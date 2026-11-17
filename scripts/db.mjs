#!/usr/bin/env node
/**
 * Database tool for the Tobecat Supabase project.
 *
 *   npm run db -- status            connection check + applied/pending migrations
 *   npm run db -- migrate           apply pending supabase/migrations/*.sql (not *.down.sql)
 *   npm run db -- seed              run supabase/seed.sql (idempotent)
 *   npm run db -- tables            list tables in the public schema with row counts
 *   npm run db -- sql "select 1"    run one SQL statement and print the rows
 *
 * Reads DATABASE_URL from .env.local (via `node --env-file`). Each migration
 * runs in its own transaction and is recorded in
 * supabase_migrations.schema_migrations — the same table the Supabase CLI
 * uses — so a migration is never applied twice.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const ROOT = path.resolve(import.meta.dirname, "..");
const MIGRATIONS = path.join(ROOT, "supabase", "migrations");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
  process.exit(1);
}

// Supabase's pooler presents a certificate from Supabase's own CA, which
// Node doesn't ship; the connection is still TLS-encrypted.
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function ensureHistory() {
  await client.query(`
    create schema if not exists supabase_migrations;
    create table if not exists supabase_migrations.schema_migrations (
      version text primary key,
      statements text[],
      name text
    );`);
}

async function migrationFiles() {
  const files = (await readdir(MIGRATIONS)).filter((f) => f.endsWith(".sql") && !f.endsWith(".down.sql")).sort();
  return files.map((f) => {
    const [version, ...rest] = f.replace(/\.sql$/, "").split("_");
    return { file: f, version, name: rest.join("_") };
  });
}

async function applied() {
  const { rows } = await client.query("select version from supabase_migrations.schema_migrations");
  return new Set(rows.map((r) => r.version));
}

const commands = {
  async status() {
    const { rows } = await client.query("select current_database() db, current_user usr, version() v");
    console.log(`Connected: ${rows[0].db} as ${rows[0].usr}\n${rows[0].v.split(",")[0]}`);
    await ensureHistory();
    const done = await applied();
    for (const m of await migrationFiles()) console.log(`${done.has(m.version) ? "applied" : "PENDING"}  ${m.file}`);
  },

  async migrate() {
    await ensureHistory();
    const done = await applied();
    const pending = (await migrationFiles()).filter((m) => !done.has(m.version));
    if (!pending.length) return console.log("Nothing to apply — database is up to date.");
    for (const m of pending) {
      const sql = await readFile(path.join(MIGRATIONS, m.file), "utf8");
      process.stdout.write(`Applying ${m.file} … `);
      try {
        await client.query("begin");
        await client.query(sql);
        await client.query("insert into supabase_migrations.schema_migrations (version, name, statements) values ($1, $2, $3)", [m.version, m.name, [sql]]);
        await client.query("commit");
        console.log("done");
      } catch (e) {
        await client.query("rollback");
        console.log("FAILED — rolled back, nothing changed");
        throw e;
      }
    }
  },

  async seed() {
    const sql = await readFile(path.join(ROOT, "supabase", "seed.sql"), "utf8");
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("commit");
      console.log("Seed applied.");
    } catch (e) {
      await client.query("rollback");
      console.log("Seed FAILED — rolled back, nothing changed");
      throw e;
    }
  },

  async tables() {
    const { rows } = await client.query(`
      select c.relname as table, c.relrowsecurity as rls,
             (xpath('/row/n/text()', query_to_xml(format('select count(*) as n from public.%I', c.relname), false, true, '')))[1]::text::int as rows
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r' order by 1`);
    if (!rows.length) return console.log("No tables in the public schema.");
    console.table(rows);
  },

  async sql(statement) {
    if (!statement) throw new Error('Usage: npm run db -- sql "select ..."');
    const res = await client.query(statement);
    if (res.rows?.length) console.table(res.rows);
    else console.log(`${res.command ?? "OK"} ${res.rowCount ?? ""}`.trim());
  },
};

const [cmd = "status", ...args] = process.argv.slice(2);
if (!commands[cmd]) {
  console.error(`Unknown command "${cmd}". Use: ${Object.keys(commands).join(", ")}`);
  process.exit(1);
}
try {
  await client.connect();
  await commands[cmd](...args);
} catch (e) {
  console.error(`Error: ${e.message}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}

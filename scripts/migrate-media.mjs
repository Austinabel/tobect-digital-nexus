#!/usr/bin/env node
/**
 * Copies the site's bundled images into Supabase Storage (bucket "media")
 * and records each one in the media library (public.media_assets) with alt
 * text, credit, licence and where the site uses it.
 *
 *   npm run media:migrate
 *
 * Idempotent: files are upserted and rows matched by storage path, so it
 * can be re-run safely. Also used by the template setup for a fresh install.
 */
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const ROOT = path.resolve(import.meta.dirname, "..");
const BUCKET = "media";
const UNSPLASH = "Unsplash License";

/**
 * The bundled starter images (licensed stock photos, illustrative only).
 * `usage` lists only places that are still in the code; banners, slides and
 * kits point at images through the database and are checked live.
 */
const FILES = [
  { file: "src/assets/hero/solar-farm.jpg", alt: "Solar farm stretching across a landscape in golden evening light", credit: "Vlad Burac", creditUrl: "https://unsplash.com/photos/CVjxkBW22fU", usage: [] },
  { file: "src/assets/hero/home-rooftop.jpg", alt: "Solar panels installed on the roof of a family home", credit: "Watt A Lot", creditUrl: "https://unsplash.com/photos/gqpuuF3a2tY", usage: ["Energy solutions: Residential"] },
  { file: "src/assets/hero/tracker-array.jpg", alt: "Rows of solar panels on tracking mounts under a bright blue sky", credit: "American Public Power Association", creditUrl: "https://unsplash.com/photos/XGAZzyLzn18", usage: [] },
  { file: "src/assets/hero/homes-sunset.jpg", alt: "Homes with rooftop solar panels at sunset", credit: "Vivint Solar", creditUrl: "https://unsplash.com/photos/_ciUqT1HEuY", usage: [] },
  { file: "src/assets/hero/utility-install.jpg", alt: "Aerial view of a large solar installation with an installer walking between panel rows", credit: "Priamo Mendez", creditUrl: "https://unsplash.com/photos/E4XEBPEkgUs", usage: [] },
  { file: "src/assets/sections/cctv-building.jpg", alt: "CCTV cameras mounted on the corner of a building", credit: "Ennio Dybeli", creditUrl: "https://unsplash.com/photos/KDdNjUQwzSw", usage: ["Energy solutions: Security"] },
  { file: "src/assets/sections/commercial-rooftop.jpg", alt: "Large array of solar panels on the roof of a commercial building", credit: "Chirayu Trivedi", creditUrl: "https://unsplash.com/photos/twOIx6I35tk", usage: ["Energy solutions: Commercial", "About page hero"] },
  { file: "src/assets/sections/installer-panels.jpg", alt: "Installer working on a solar panel", credit: "Markus Spiske", creditUrl: "https://unsplash.com/photos/rNn_TU8dvoY", usage: ["Business solar section"] },
];

/** Width/height from a JPEG, PNG or WebP header — no image library needed. */
export function imageSize(buf) {
  if (buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8X") return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
    if (chunk === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    if (chunk === "VP8L") {
      const b = buf.readUInt32LE(21);
      return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
    }
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) return null;
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      // SOF0–SOF15 except DHT (C4), JPG (C8), DAC (CC)
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
  }
  return null;
}

async function main() {
  for (const k of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY"]) if (!process.env[k]) throw new Error(`${k} is not set (.env.local)`);
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false }, realtime: { transport: ws } });

  const { data: buckets, error: listErr } = await admin.storage.listBuckets();
  if (listErr) throw listErr;
  if (!buckets.some((b) => b.name === BUCKET)) {
    const { error } = await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: "6MB", allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"] });
    if (error) throw error;
    console.log(`Created public bucket "${BUCKET}"`);
  }

  for (const f of FILES) {
    const buf = await readFile(path.join(ROOT, f.file));
    const storagePath = `starter/${path.basename(path.dirname(f.file))}/${path.basename(f.file)}`;
    const { error: upErr } = await admin.storage.from(BUCKET).upload(storagePath, buf, { contentType: "image/jpeg", upsert: true, cacheControl: "31536000" });
    if (upErr) throw upErr;
    const publicUrl = admin.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
    const size = imageSize(buf);
    const row = {
      storage_path: storagePath,
      public_url: publicUrl,
      filename: path.basename(f.file),
      mime_type: "image/jpeg",
      size_bytes: buf.length,
      width: size?.width ?? null,
      height: size?.height ?? null,
      alt: f.alt,
      credit: f.credit,
      credit_url: f.creditUrl,
      license: UNSPLASH,
      usage: f.usage,
      is_sample: true,
      sha256: createHash("sha256").update(buf).digest("hex"),
      updated_at: new Date().toISOString(),
    };
    const { error: dbErr } = await admin.from("media_assets").upsert(row, { onConflict: "storage_path" });
    if (dbErr) throw dbErr;
    console.log(`✓ ${storagePath}  ${size ? `${size.width}×${size.height}` : "?"}  ${(buf.length / 1024).toFixed(0)} KB`);
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}` || process.argv[1]?.endsWith("migrate-media.mjs")) {
  main().catch((e) => {
    console.error("Media migration failed:", e.message);
    process.exitCode = 1;
  });
}

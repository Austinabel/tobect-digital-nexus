import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCsv, resolveCategory, sheetToRecords, splitImageUrls, templateCsv, validateImport, type ImportCategory } from "./product-import";

const cats: ImportCategory[] = [
  { slug: "inverters", name: "Inverters", parent: null },
  { slug: "hybrid-inverters", name: "Hybrid Inverters", parent: "inverters" },
  { slug: "solar-panels", name: "Solar Panels", parent: null },
];
const existing = [{ slug: "jinko-550w-solar-panel", name: "Jinko 550W Solar Panel", brand: "Jinko Solar", model: null, barcode: "6971234567890" }];
const ctx = { categories: cats, existing, existingSlugs: new Set(["jinko-550w-solar-panel"]), publishDefault: true };
const run = (csv: string) => validateImport(sheetToRecords(parseCsv(csv)), ctx);

test("CSV: quotes, embedded commas and newlines, BOM, semicolons", () => {
  assert.deepEqual(parseCsv('﻿name,price\r\n"Panel, 550W","1,000"\r\n"Two\nlines",5\r\n'), [
    ["name", "price"],
    ["Panel, 550W", "1,000"],
    ["Two\nlines", "5"],
  ]);
  assert.deepEqual(parseCsv("name;price\nA;1\n"), [["name", "price"], ["A", "1"]]);
  assert.deepEqual(parseCsv('a,b\n"say ""hi""",2\n\n'), [["a", "b"], ['say "hi"', "2"]]);
});

test("headers are matched by name, alias or spec label, in any case", () => {
  const s = sheetToRecords([["Product Name", "Category", "Price (NGN)", "Model No", "Capacity", "Colour"], ["A", "Inverters", "100", "M1", "8 kW", "red"]]);
  assert.deepEqual(s.columns, ["name", "category", "price", "model", "attr_capacity", null]);
  assert.deepEqual(s.unknownHeaders, ["Colour"]);
  assert.deepEqual(s.missingRequired, []);
  assert.deepEqual(sheetToRecords([["name"]]).missingRequired, ["category", "price"]);
});

test("categories by name, web address or 'Parent > Child'", () => {
  assert.equal(resolveCategory("hybrid inverters", cats)?.slug, "hybrid-inverters");
  assert.equal(resolveCategory("Inverters > Hybrid Inverters", cats)?.slug, "hybrid-inverters");
  assert.equal(resolveCategory("solar-panels", cats)?.slug, "solar-panels");
  assert.equal(resolveCategory("Solar Panels > Hybrid Inverters", cats), null, "wrong parent");
  assert.equal(resolveCategory("Fridges", cats), null);
});

test("rows are validated with the product form's rules", () => {
  const rows = run(
    [
      "name,category,price,brand,model,availability,published,image_urls",
      "Deye 8kW Hybrid Inverter,Hybrid Inverters,\"1,250,000\",Deye,SUN-8K,in stock,yes,https://x.com/a.jpg | https://x.com/b.jpg",
      "No price product,Inverters,,,,,,",
      "Mystery item,Fridges,1000,,,,,",
      "Bad availability,Inverters,1000,,,maybe,,",
      "EXAMPLE row,Inverters,1,,,,,",
    ].join("\n"),
  );
  assert.equal(rows[0].status, "ready");
  assert.equal(rows[0].value?.price_ngn, 1250000);
  assert.equal(rows[0].value?.category_slug, "hybrid-inverters");
  assert.equal(rows[0].value?.availability, "in-stock");
  assert.deepEqual(rows[0].imageUrls, ["https://x.com/a.jpg", "https://x.com/b.jpg"]);
  assert.equal(rows[1].status, "error");
  assert.match(rows[2].messages[0], /Unknown category/);
  assert.equal(rows[3].status, "error");
  assert.equal(rows[4].status, "skipped");
  assert.equal(rows[0].line, 2);
});

test("duplicates: against the shop and within the file; web addresses stay unique", () => {
  const rows = run(
    [
      "name,category,price,barcode",
      "Jinko 550W Solar Panel,Solar Panels,140000,",
      "Another panel,Solar Panels,1000,6971234567890",
      "Canadian 600W Panel,Solar Panels,150000,",
      "canadian 600w panel,Solar Panels,150000,",
      "Canadian 600W Panels,Solar Panels,150000,",
    ].join("\n"),
  );
  assert.equal(rows[0].status, "duplicate");
  assert.equal(rows[1].status, "duplicate", "same barcode");
  assert.equal(rows[2].status, "ready");
  assert.equal(rows[3].status, "duplicate", "same name as an earlier row");
  assert.match(rows[3].messages[0], /earlier row/);
  assert.equal(rows[4].status, "possible-duplicate");
  assert.notEqual(rows[4].fields?.slug, rows[2].fields?.slug);
});

test("published defaults to the page choice; image links filtered", () => {
  const rows = validateImport(sheetToRecords(parseCsv("name,category,price\nA panel,Solar Panels,1000\n")), { ...ctx, publishDefault: false });
  assert.equal(rows[0].value?.published, false);
  assert.deepEqual(splitImageUrls("https://a.com/1.jpg, ftp://b.com/2.jpg|http://c.com/3.png https://a.com/1.jpg"), ["https://a.com/1.jpg", "http://c.com/3.png"]);
});

test("the template parses back with every column recognised", () => {
  const s = sheetToRecords(parseCsv(templateCsv()));
  assert.deepEqual(s.unknownHeaders, []);
  assert.equal(validateImport(s, ctx)[0].status, "skipped");
});

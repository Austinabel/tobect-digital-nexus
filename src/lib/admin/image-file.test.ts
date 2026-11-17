import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { imageSize, sniffImage } from "./image-file";

const root = path.resolve(__dirname, "../../..");

test("real JPEGs are recognised and measured", () => {
  const buf = new Uint8Array(readFileSync(path.join(root, "src/assets/sections/cctv-building.jpg")));
  assert.deepEqual(sniffImage(buf), { mime: "image/jpeg", ext: "jpg" });
  assert.deepEqual(imageSize(buf), { width: 1800, height: 1800 });
});

test("PNG headers give their size", () => {
  const png = new Uint8Array(24);
  png.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52]);
  new DataView(png.buffer).setUint32(16, 640);
  new DataView(png.buffer).setUint32(20, 480);
  assert.equal(sniffImage(png)?.mime, "image/png");
  assert.deepEqual(imageSize(png), { width: 640, height: 480 });
});

test("files pretending to be images are rejected", () => {
  const html = new TextEncoder().encode("<html><script>alert(1)</script></html>");
  assert.equal(sniffImage(html), null);
  const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  assert.equal(sniffImage(svg), null, "SVG (can carry scripts) is not accepted");
  assert.equal(sniffImage(new Uint8Array([0x25, 0x50, 0x44, 0x46])), null, "PDF");
});

test("WebP and AVIF signatures are recognised", () => {
  const webp = new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 ");
  assert.equal(sniffImage(webp)?.ext, "webp");
  const avif = new Uint8Array([0, 0, 0, 0x1c, ...new TextEncoder().encode("ftypavif")]);
  assert.equal(sniffImage(avif)?.ext, "avif");
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { checkImageUrl, fileNameFromUrl, isPrivateAddress } from "./url-safety";

const bad = (u: string) => "error" in checkImageUrl(u);

test("public image links are accepted", () => {
  assert.ok(!bad("https://cdn.example.com/products/deye-8kw.jpg"));
  assert.ok(!bad("http://images.supplier.ng/a.png?size=large"));
});

test("links into private networks or odd schemes are refused", () => {
  for (const u of [
    "http://localhost/admin",
    "http://127.0.0.1/x.png",
    "http://169.254.169.254/latest/meta-data",
    "http://10.0.0.5/x.jpg",
    "http://192.168.1.1/router.png",
    "http://[::1]/x.png",
    "http://[fd00::1]/x.png",
    "http://[::ffff:127.0.0.1]/x.png",
    "http://intranet/x.png",
    "http://printer.local/x.png",
    "file:///etc/passwd",
    "ftp://example.com/x.png",
    "javascript:alert(1)",
    "https://user:pass@example.com/x.png",
    "https://example.com:8080/x.png",
    "not a url",
  ]) {
    assert.ok(bad(u), u);
  }
});

test("address ranges", () => {
  assert.equal(isPrivateAddress("8.8.8.8"), false);
  assert.equal(isPrivateAddress("172.15.255.255"), false);
  assert.equal(isPrivateAddress("172.16.0.1"), true);
  assert.equal(isPrivateAddress("172.31.255.255"), true);
  assert.equal(isPrivateAddress("100.64.0.1"), true);
  assert.equal(isPrivateAddress("2606:4700::1111"), false);
  assert.equal(isPrivateAddress("fe80::1"), true);
  assert.equal(isPrivateAddress("::ffff:7f00:1"), true, "127.0.0.1 hidden in IPv6 hex form");
  assert.equal(isPrivateAddress("::ffff:a9fe:a9fe"), true, "169.254.169.254 hidden in IPv6 hex form");
  assert.equal(isPrivateAddress("::ffff:808:808"), false, "8.8.8.8 is public");
  assert.equal(isPrivateAddress("999.1.1.1"), true, "unparseable is refused");
});

test("file names come from the link", () => {
  assert.equal(fileNameFromUrl(new URL("https://x.com/a/Deye%208kW.jpg?w=1")), "Deye 8kW.jpg");
  assert.equal(fileNameFromUrl(new URL("https://x.com/")), "x.com-image");
});

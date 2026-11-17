import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_CONTENT, parseContent, parseInline, parseRichText, readContent, safeContentHref } from "./content";
import { DEFAULT_SITE, parseSiteSettings, siteLinks } from "./site";

test("rich text: headings, lists, paragraphs, bold, links and tokens — never HTML", () => {
  const blocks = parseRichText("## Claims\n\n1. Keep your receipt\n2. Call {phone}\n\nSee **this** and [Support](/support).\n\n<script>alert(1)</script>");
  assert.deepEqual(blocks[0], { t: "h2", v: "Claims" });
  assert.equal(blocks[1].t, "ol");
  assert.deepEqual((blocks[1] as { items: unknown[][] }).items[1], [{ t: "text", v: "Call " }, { t: "token", v: "phone" }]);
  assert.deepEqual((blocks[2] as { c: unknown[] }).c, [
    { t: "text", v: "See " },
    { t: "bold", v: "this" },
    { t: "text", v: " and " },
    { t: "link", v: "Support", href: "/support" },
    { t: "text", v: "." },
  ]);
  assert.deepEqual(blocks[3], { t: "p", c: [{ t: "text", v: "<script>alert(1)</script>" }] }, "HTML stays plain text");
});

test("rich text links: only site pages, https, mailto and tel", () => {
  assert.equal(safeContentHref("javascript:alert(1)"), null);
  assert.equal(safeContentHref("//evil.example"), null);
  assert.equal(safeContentHref("http://insecure.example"), null);
  assert.equal(safeContentHref("mailto:a@b.co"), "mailto:a@b.co");
  assert.deepEqual(parseInline("[x](javascript:alert(1))"), [{ t: "text", v: "x" }, { t: "text", v: ")" }]);
  assert.deepEqual(parseInline("{unknown}"), [{ t: "text", v: "{unknown}" }]);
});

test("testimonials need the customer's permission; ratings are 1–5", () => {
  const { errors } = parseContent("testimonials", { items: [{ name: "Ada", quote: "Great work", consent: false }, { name: "Bayo", quote: "Fast", rating: 7, consent: true }] });
  assert.ok(errors["items.0.consent"]);
  assert.ok(errors["items.1.rating"]);
});

test("blank list rows are ignored; required fields enforced", () => {
  const { value, errors } = parseContent("faqs", { items: [{ q: "", a: "" }, { q: "Do you install?", a: "" }] });
  assert.equal((value.items as unknown[]).length, 1);
  assert.ok(errors["items.0.a"]);
});

test("images must come from the media library", () => {
  const lib = (u: string) => u === "https://x.supabase.co/media/a.jpg";
  assert.ok(parseContent("about", { team: [{ name: "Ada", role: "CEO", photo: "https://evil.example/x.jpg" }] }, { isLibraryUrl: lib }).errors["team.0.photo"]);
  assert.deepEqual(parseContent("about", { team: [{ name: "Ada", role: "CEO", photo: "https://x.supabase.co/media/a.jpg" }] }, { isLibraryUrl: lib }).errors, {});
});

test("public reading drops invalid rows and falls back to the launch content", () => {
  const v = readContent("testimonials", { items: [{ name: "Ada", quote: "Great", consent: true }, { name: "No consent", quote: "x", consent: false }] });
  assert.deepEqual((v.items as { name: string }[]).map((t) => t.name), ["Ada"]);
  assert.equal((readContent("faqs", null).items as unknown[]).length, (DEFAULT_CONTENT.faqs.items as unknown[]).length);
});

test("site settings: invalid values are reported and fall back to the defaults", () => {
  const { site, errors } = parseSiteSettings({ ...DEFAULT_SITE, email: "not-an-email", phone: "123", url: "http://insecure.example", social: [{ label: "Facebook", href: "javascript:x" }] });
  assert.ok(errors.email && errors.phone && errors.url && errors.social_0);
  assert.equal(site.email, DEFAULT_SITE.email);
  assert.equal(site.url, DEFAULT_SITE.url);
  assert.deepEqual(site.social, []);
  const ok = parseSiteSettings({ ...DEFAULT_SITE, phone: "0803 111 2222", social: [{ label: "Instagram", href: "https://instagram.com/tobecat/" }] });
  assert.deepEqual(ok.errors, {});
  assert.equal(ok.site.social[0].href, "https://instagram.com/tobecat");
});

test("contact links follow the settings, greetings use the short name", () => {
  const { PHONE_HREF, whatsappHref } = siteLinks({ ...DEFAULT_SITE, phone: "08031112222", whatsapp: "07031112222", shortName: "SunCo" });
  assert.equal(PHONE_HREF, "tel:+2348031112222");
  assert.equal(whatsappHref("Hello Tobecat, hi"), "https://wa.me/2347031112222?text=Hello%20SunCo%2C%20hi");
});

test("logo settings: shipped /brand files or https images; empty shows the logo word", () => {
  assert.equal(parseSiteSettings({}).site.brand.logoHeaderUrl, "/brand/logo-header.png", "default is the owner's logo");
  const cleared = parseSiteSettings({ ...DEFAULT_SITE, brand: { ...DEFAULT_SITE.brand, logoHeaderUrl: "" } });
  assert.equal(cleared.site.brand.logoHeaderUrl, undefined);
  const bad = parseSiteSettings({ ...DEFAULT_SITE, brand: { ...DEFAULT_SITE.brand, logoFooterUrl: "javascript:alert(1)" } });
  assert.ok(bad.errors.logoFooterUrl);
  assert.ok(parseSiteSettings({ ...DEFAULT_SITE, brand: { ...DEFAULT_SITE.brand, logoFooterUrl: "/brand/../../etc/passwd" } }).errors.logoFooterUrl);
  assert.deepEqual(parseSiteSettings({ ...DEFAULT_SITE, brand: { ...DEFAULT_SITE.brand, logoFooterUrl: "https://x.supabase.co/storage/v1/object/public/media/logo.png" } }).errors, {});
});

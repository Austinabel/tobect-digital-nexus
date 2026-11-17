import { test } from "node:test";
import assert from "node:assert/strict";
import { campaignState, isoToLagosLocal, lagosLocalToIso, parseCampaignForm } from "./campaign-form";

const LIB = "https://x.supabase.co/storage/v1/object/public/media/a.jpg";
const isLib = (u: string) => u === LIB;
const form = (o: Record<string, string>) => (k: string) => (k in o ? o[k] : null);
const base = { position: "shop-primary", title: "Harmattan Sale", cta_text: "Shop now", cta_href: "/shop/inverters", active: "on" };

test("valid promotion parses to a clean row", () => {
  const { row, errors } = parseCampaignForm(form({ ...base, discount_label: "10% off", starts_at: "2026-12-01T09:00", ends_at: "2026-12-31T23:59", desktop_image_url: LIB, priority: "5" }), isLib);
  assert.deepEqual(errors, {});
  assert.equal(row!.starts_at, "2026-12-01T08:00:00.000Z", "Lagos is UTC+1");
  assert.equal(row!.priority, 5);
  assert.equal(row!.evergreen, false);
});

test("unsafe or missing links are rejected", () => {
  assert.ok(parseCampaignForm(form({ ...base, cta_href: "javascript:alert(1)" }), isLib).errors.cta_href);
  assert.ok(parseCampaignForm(form({ ...base, cta_href: "http://insecure.example" }), isLib).errors.cta_href);
  assert.ok(parseCampaignForm(form({ ...base, cta_href: "//evil.example" }), isLib).errors.cta_href);
  assert.ok(parseCampaignForm(form({ ...base, cta_href: "" }), isLib).errors.cta_href);
});

test("images must come from the media library", () => {
  assert.ok(parseCampaignForm(form({ ...base, desktop_image_url: "https://elsewhere.example/x.jpg" }), isLib).errors.desktop_image_url);
});

test("designed banners need artwork and a text alternative", () => {
  const e = parseCampaignForm(form({ ...base, designed_banner: "on" }), isLib).errors;
  assert.ok(e.designed_banner);
  assert.ok(e.image_alt);
});

test("end must follow start", () => {
  assert.ok(parseCampaignForm(form({ ...base, starts_at: "2026-12-10T09:00", ends_at: "2026-12-01T09:00" }), isLib).errors.ends_at);
});

test("always-on banners can't carry offers or dates", () => {
  assert.ok(parseCampaignForm(form({ ...base, evergreen: "on", discount_label: "50% off" }), isLib).errors.discount_label);
  assert.ok(parseCampaignForm(form({ ...base, evergreen: "on", ends_at: "2026-12-01T09:00" }), isLib).errors.ends_at);
  assert.deepEqual(parseCampaignForm(form({ ...base, evergreen: "on" }), isLib).errors, {});
});

test("Lagos date conversion round-trips", () => {
  assert.equal(isoToLagosLocal(lagosLocalToIso("2026-11-16T07:30")), "2026-11-16T07:30");
  assert.equal(lagosLocalToIso("16/11/2026"), null);
});

test("status words for the admin list", () => {
  const now = new Date("2026-11-16T12:00:00Z");
  const c = { active: true, evergreen: false, starts_at: null, ends_at: null };
  assert.equal(campaignState(c, now), "live");
  assert.equal(campaignState({ ...c, active: false }, now), "draft");
  assert.equal(campaignState({ ...c, evergreen: true }, now), "always-on");
  assert.equal(campaignState({ ...c, ends_at: "2026-11-01T00:00:00Z" }, now), "ended");
  assert.equal(campaignState({ ...c, starts_at: "2026-12-01T00:00:00Z" }, now), "scheduled");
});

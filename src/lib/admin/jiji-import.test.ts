import { test } from "node:test";
import assert from "node:assert/strict";
import {
  brandFrom,
  classifyJijiLink,
  conditionFrom,
  detailsFromTitle,
  isCompleteSetup,
  isServiceListing,
  jijiLinksIn,
  listingLinksOnSellerPage,
  listingToFields,
  parseJijiListing,
  productTypeFromTitle,
  readNuxtData,
} from "./jiji-import";
import { productTypeFor } from "../shop/product-fields";
import { parseProductForm } from "./product-form";

/** A Jiji-style page: the data is a flat "devalue" array where objects point at other entries by index. */
function page(ad: Record<string, unknown>): string {
  const arr: unknown[] = [];
  const put = (v: unknown): number => {
    const i = arr.length;
    arr.push(null);
    if (Array.isArray(v)) arr[i] = v.map(put);
    else if (v && typeof v === "object") arr[i] = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, put(x)]));
    else arr[i] = v;
    return i;
  };
  arr.push(["Reactive", 1]);
  put({ state: { advert: ad } });
  return `<html><body><script type="application/json" id="__NUXT_DATA__" data-ssr="true">${JSON.stringify(arr)}</script></body></html>`;
}

const meco = {
  id: 55689079,
  title: "Meco 3600 Solar  Generator (3000W Output)",
  price_obj: { value: 1090000, view: "₦ 1,090,000", type: "Negotiable" },
  description: "The newly launched Meco 3600W pro solar generator.\r\nIt can power a 1-3bedroom flat comfortably",
  images: [
    { id: 2, url: "https://pictures-nigeria.jijistatic.net/2_b.webp", is_main: false },
    { id: 1, url: "https://pictures-nigeria.jijistatic.net/1_a.webp", is_main: true },
    { id: 3, url: "https://evil.example.com/x.webp", is_main: false },
  ],
  attrs: [
    { name: "Brand", value: "Other" },
    { name: "Type", value: "Solar Energy Systems" },
    { name: "Condition", value: "Brand New" },
  ],
  category_slug: "power-equipments",
  category_name: "Electrical Equipment",
};

const categories = [
  { slug: "solar-panels", name: "Solar Panels", parent: null },
  { slug: "inverters", name: "Inverters", parent: null },
  { slug: "lithium-batteries", name: "Lithium Batteries", parent: null },
  { slug: "solar-generators", name: "Solar Generators", parent: null },
  { slug: "cctv-security", name: "CCTV & Security", parent: null },
  { slug: "solar-lights", name: "Solar Lights", parent: null },
  { slug: "solar-fans", name: "Solar Fans", parent: null },
];
const typeOf = (slug: string, parent: string | null) => productTypeFor(slug, parent).id;

test("Jiji links: listing and seller pages are recognised, tracking is dropped, other sites ignored", () => {
  assert.deepEqual(classifyJijiLink("https://jiji.ng/ojo/power-equipments/meco-3600-solar-generator-sjmApQViW1Di1SICiZabemvB.html?page=1&pos=1&lid=x"), {
    kind: "listing",
    url: "https://jiji.ng/ojo/power-equipments/meco-3600-solar-generator-sjmApQViW1Di1SICiZabemvB.html",
  });
  assert.deepEqual(classifyJijiLink("https://jiji.ng/sellerpage-wjXtUsHw7uLsJHrT9VnSK120?page=2"), { kind: "seller", url: "https://jiji.ng/sellerpage-wjXtUsHw7uLsJHrT9VnSK120" });
  assert.equal(classifyJijiLink("https://jiji.ng.evil.com/a/b/c.html"), null);
  assert.equal(classifyJijiLink("https://www.facebook.com/marketplace/item/123"), null);
  const { links, ignored } = jijiLinksIn("see https://jiji.ng/a/b/c.html and\nhttps://jiji.ng/a/b/c.html?x=1 plus https://facebook.com/x");
  assert.equal(links.length, 1);
  assert.equal(ignored.length, 1);
  assert.deepEqual(listingLinksOnSellerPage('<a href="/ikeja/power-equipments/x-1.html">a</a><a href="/ikeja/power-equipments/x-1.html">b</a><a href="/about">c</a>'), ["https://jiji.ng/ikeja/power-equipments/x-1.html"]);
});

test("a listing page is read: title, price, description, photos (main first, Jiji photos only), Jiji's fields", () => {
  const l = parseJijiListing(page(meco), "https://jiji.ng/ojo/power-equipments/meco.html")!;
  assert.equal(l.title, "Meco 3600 Solar Generator (3000W Output)");
  assert.equal(l.price, 1090000);
  assert.equal(l.description, "The newly launched Meco 3600W pro solar generator.\nIt can power a 1-3bedroom flat comfortably");
  assert.deepEqual(l.images, ["https://pictures-nigeria.jijistatic.net/1_a.webp", "https://pictures-nigeria.jijistatic.net/2_b.webp"]);
  assert.deepEqual(l.attrs, { Brand: "Other", Type: "Solar Energy Systems", Condition: "Brand New" });
  assert.equal(parseJijiListing("<html>not a listing</html>", "x"), null);
  assert.equal(readNuxtData('<script id="__NUXT_DATA__">{broken</script>'), null);
});

test("product type from the title", () => {
  const cases: [string, string | null][] = [
    ["Meco 3600 Solar Generator (3000W Output)", "power-system"],
    ["Meco 2000w With 1200w Output", "power-system"],
    ["Itel Power Tank 1000W With 410W Panel", "power-system"],
    ["Complete 3kva Solar System Set Up With 5kwh 24v Lithium Battery", "power-system"],
    ["Haisic 215kwh 100kva All-In-One Commercial Industrial ESS Cabinet", "power-system"],
    ["10kwh 48v Felicity Lithium Battery", "battery"],
    ["Haisic 8kwh 24v", "battery"],
    ["Wall Mounted 10kwh SVC Battery With 10 Yrs Warranty", "battery"],
    ["Felicity 12kva 48v Hybrid Inverter", "inverter"],
    ["590w Ronma Mono Solar Panel", "solar-panel"],
    ["650w Bifacial Panel", "solar-panel"],
    ["300w Solar Powered Led Street Light and CCTV Security Camera Unit", "cctv"],
    ["3 Lenses Quality T30 Intelligent Solar PTZ Camer", "cctv"],
    ["18 Inches Quality Solar Standing Fan With Solar Panel and Led Bulb", "fan"],
    ["200w Solar Street Light", "lighting"],
    ["Very Good Quality 316litres Solar Deep Freezer", "freezer"],
    ["Solar Water Pump 1hp 750w AC 220v DC 72v Submersible Borehole Pump", "pump"],
    ["32 Inches Solar TV", null],
    ["Solar Panels for Solar Fans and Generators.", "solar-panel"],
    ["Meco 2000W With 1200W Output", "power-system"],
  ];
  for (const [title, want] of cases) assert.equal(productTypeFromTitle(title), want, title);
  assert.equal(productTypeFromTitle("Dual Lens Howfar", "security-and-surveillance"), "cctv");
});

test("details are read from the title only when they're unambiguous", () => {
  assert.deepEqual(detailsFromTitle("battery", "10kwh 48v Felicity Lithium Battery"), { attr_chemistry: "Lithium", attr_voltage: "48", attr_capacity: "10" });
  assert.deepEqual(detailsFromTitle("battery", "Beve Power Titan 16.077kwh 51.2v 314ah Lifepo4 Lithium Battery"), { attr_chemistry: "Lithium (LiFePO4)", attr_voltage: "51.2", attr_ah: "314", attr_capacity: "16.077" });
  // 24V and 25.6V both written: voltage left for staff
  assert.equal(detailsFromTitle("battery", "Luxwatt 2.56kwh 24v/25.6v 100ah Lifepo4 Lithium Battery").attr_voltage, undefined);
  assert.equal(detailsFromTitle("battery", "16kwh Lifepo4 Battery With 10 Yrs Warranty").attr_warranty, "10");
  assert.deepEqual(detailsFromTitle("inverter", "Beve Power 16kw 16kva 48v Hybrid Solar Inverter IP65"), { attr_inverterType: "Hybrid", attr_capacity: "16", attr_power: "16", inv_battery_v: "48" });
  assert.equal(detailsFromTitle("inverter", "6kva 48v Haisic Off-Grid Inverter").attr_inverterType, "Off-grid");
  // power systems: output only when the title says "output"; storage from kWh in Wh
  assert.deepEqual(detailsFromTitle("power-system", "1000w Solar Generator With 300w Output Omnibat"), { attr_output: "300" });
  assert.deepEqual(detailsFromTitle("power-system", "Cola 1000 Plus Solar Generator 1kwh 500w Upgraded Power Station"), { attr_storage: "1000" });
  assert.deepEqual(detailsFromTitle("solar-panel", "590w Ronma Mono Solar Panel"), { attr_wattage: "590", attr_panelType: "Monocrystalline" });
  assert.deepEqual(detailsFromTitle("solar-panel", "340w Half Cut Solar Panel"), { attr_wattage: "340", attr_technology: "Half-cut" });
  assert.deepEqual(detailsFromTitle("freezer", "Very Good Quality 316litres Solar Deep Freezer"), { attr_fridgeType: "Chest freezer", attr_volume: "316" });
  assert.equal(detailsFromTitle("lighting", "8 Eye 300w Solar Street Lights").attr_lightType, "Street light");
  assert.deepEqual(detailsFromTitle("power-system", "20KVA Solar System Set Up + 3 Pieces of 16KWH Battery"), {}, "per-piece ratings aren't the product's");
  assert.equal(detailsFromTitle("power-system", "5012kwh Solar Generator With 5000w Output").attr_storage, undefined);
  // fan that is both "standing" and "rechargeable": type left for staff
  assert.equal(detailsFromTitle("fan", "18 Inch Rechargeable Solar AC/DC Standing Fan").attr_fanType, undefined);
  assert.equal(detailsFromTitle("fan", "18 Inch Rechargeable Solar AC/DC Standing Fan").attr_size, "18");
});

test("condition and brand", () => {
  assert.equal(conditionFrom("Brand New", ""), "New");
  assert.equal(conditionFrom("Foreign Used", ""), "Used");
  assert.equal(conditionFrom("Refurbished", ""), "Refurbished");
  assert.equal(conditionFrom(undefined, "Sunfit 2.5kva Inverter Brand New"), "New");
  assert.equal(conditionFrom(undefined, "Sunfit 2.5kva Inverter"), null);
  assert.equal(brandFrom("Felicity Solar", "x"), "Felicity Solar");
  assert.equal(brandFrom("Felicitysolar", "x"), "Felicity Solar");
  assert.equal(brandFrom("Sms", "x"), "SMS");
  assert.equal(brandFrom("Solar", "18inches Solar Standing Fan"), null);
  assert.equal(brandFrom("Sms", "x", ["SMS Solar"]), "SMS", "Jiji's brand is kept unless the shop spells the same brand");
  assert.equal(brandFrom("felicity solar", "x", ["Felicity Solar"]), "Felicity Solar");
  assert.equal(brandFrom("Other", "Hasic 15kva 48v Hybrid Inverter"), "Haisic");
  assert.equal(brandFrom(undefined, "Quality Solar Fan"), null);
  assert.equal(brandFrom(undefined, "Acme 5kva Inverter", ["Acme"]), "Acme");
});

test("a whole listing becomes form fields that the product form accepts", () => {
  const l = parseJijiListing(page(meco), "https://jiji.ng/ojo/power-equipments/meco.html")!;
  const d = listingToFields(l, { categories, typeOf });
  assert.equal(d.typeId, "power-system");
  assert.equal(d.fields.category, "solar-generators");
  assert.equal(d.fields.brand, "Meco");
  assert.equal(d.fields.attr_output, "3000");
  assert.equal(d.fields.attr_condition, "New");
  assert.equal(d.imageUrls.length, 2);
  const { value, errors } = parseProductForm({ ...d.fields, slug: "meco-3600", images: "[]" }, { categories: categories.map((c) => c.slug), isNew: true });
  assert.deepEqual(errors, {});
  assert.equal(value!.price_ngn, 1090000);
  assert.deepEqual(value!.attributes, { output: "3000 W", condition: "New" });

  const tv = listingToFields({ ...l, title: "32 Inches Solar TV", attrs: {} }, { categories, typeOf });
  assert.equal(tv.fields.category, "", "no guess: staff pick the category");
  assert.equal(isServiceListing({ jijiCategory: "solar-sales-and-installation-services" }), true);
  assert.equal(isServiceListing({ jijiCategory: "power-equipments" }), false);
});

test("complete solar setups are told apart from single products and solar generators", () => {
  for (const t of ["15KVA Set Up With 20KWH Lithium Battery", "6kva + 10kwh With BMS Solar System", "Amazing Combo! 15kva One Inverter And 15kwh Blisslife Lithium Battery", "Complete Solar Set Up 3600w Solar Generator With 2 Panels"])
    assert.equal(isCompleteSetup(t), true, t);
  for (const t of ["SVC RPS 1.2kw Inverter + 4kwh Solar Generator", "Haisic 215kWh / 100kva All-in-One Commercial Industrial ESS Cabinet", "Felicity Solar 10kVA 48V Hybrid Inverter With 120A MPPT", "16kwh Lifepo4 Battery With 10 Yrs Warranty", "1000w Itel Solar Kit"])
    assert.equal(isCompleteSetup(t), false, t);
});

test("cable and protection adverts are read as accessories", async () => {
  const { productTypeFromTitle } = await import("./jiji-import");
  for (const t of ["6mm DC Solar Cable 100 Metres", "Sollatek Voltage Protector (AVS 30)", "63A Changeover Switch", "DC Surge Protector 1000V", "MC4 Connectors (10 pairs)"])
    assert.equal(productTypeFromTitle(t, "power-equipments"), "accessory", t);
  assert.equal(productTypeFromTitle("Felicity 5kva Inverter With Surge Protection", "power-equipments"), "inverter");
  assert.equal(productTypeFromTitle("Solar Generator With Cables", "power-equipments"), "power-system");
});

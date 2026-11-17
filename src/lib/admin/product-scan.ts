/**
 * "Scan product": reads photos of a product (or its rating label / box)
 * with Claude's vision and suggests listing details. Server-only — the API
 * key never reaches the browser.
 *
 * Honesty rules (also in the prompt): only details visible in the photos;
 * never prices, stock, warranty or marketing claims; unreadable = null.
 * Staff review every suggested field before saving.
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import sharp from "sharp";
import { SPEC_FILTERS } from "@/lib/shop/catalogue-query";

/** Scanning is offered only when the server has an Anthropic API key. */
export const scanAvailable = () => Boolean(process.env.ANTHROPIC_API_KEY);

const ScanSchema = z.object({
  recognised: z.boolean().describe("true if the photos show a product that could be identified at all"),
  name: z.string().nullable().describe("Listing name: brand + product type + headline rating/model, e.g. 'Deye 8kW Hybrid Inverter'. Null if not identifiable."),
  brand: z.string().nullable(),
  model: z.string().nullable().describe("Exact model number as printed, e.g. 'SUN-8K-SG04LP3-EU'"),
  category: z.string().nullable().describe("One of the given category slugs, or null if none fits"),
  key_specs: z.array(z.string()).describe("Up to 8 short headline specs read from the label, e.g. '8 kW', '48 V', 'IP65'"),
  attributes: z.array(z.object({ key: z.string(), value: z.string() })).describe("Filter values, only for the allowed keys of the chosen category"),
  barcode: z.string().nullable().describe("EAN/UPC digits if printed and fully legible, else null"),
  inverter_battery_v: z.number().int().nullable().describe("Inverters only: nominal battery voltage (12, 24 or 48) if printed"),
  inverter_max_pv_v: z.number().int().nullable().describe("Inverters only: max PV input voltage (Voc) if printed"),
  inverter_mppt_min_v: z.number().int().nullable().describe("Inverters only: lowest MPPT voltage if printed"),
  description: z.string().nullable().describe("2-3 plain factual sentences using only what is visible. No prices, warranty, superlatives or claims."),
  notes: z.string().describe("Short note for staff: what was unclear, partly hidden or needs checking"),
});
export type ScanResult = z.infer<typeof ScanSchema>;

const SYSTEM = `You help staff of a Nigerian solar and electrical equipment shop list products. You are given photos of one product — often its rating label, nameplate, box or datasheet.

Report only details you can actually read or see in the photos. Never guess a model number, rating or spec that is not printed, and never invent prices, stock, warranty terms, certifications or marketing claims. If something is unreadable or not shown, use null (or leave it out of the lists) and say so in "notes". Copy numbers and units exactly as printed (e.g. "550 W", "48 V", "10 kVA").

For "category", choose the single best slug from the list provided, or null. Prefer a subcategory when one fits. For "attributes", use only the keys allowed for the category you chose, with values worded the way the label shows them.`;

export async function readProductPhotos(
  images: Uint8Array[],
  categories: { slug: string; name: string; parent?: string | null }[],
): Promise<{ result?: ScanResult; error?: string }> {
  // Resize so the long edge is ≤ 1568 px (Claude's useful maximum) — smaller uploads, lower cost.
  const prepared = await Promise.all(
    images.slice(0, 3).map(async (bytes) => (await sharp(bytes).rotate().resize({ width: 1568, height: 1568, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer()).toString("base64")),
  );

  const catList = categories.map((c) => {
    const parent = c.parent ? categories.find((p) => p.slug === c.parent) : undefined;
    const keys = (SPEC_FILTERS[c.slug] ?? (c.parent ? SPEC_FILTERS[c.parent] : undefined) ?? []).map((s) => s.key);
    return `- ${c.slug}: ${parent ? `${parent.name} › ` : ""}${c.name}${keys.length ? ` (attribute keys: ${keys.join(", ")})` : ""}`;
  });

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      output_config: { effort: "medium", format: betaZodOutputFormat(ScanSchema) },
      messages: [
        {
          role: "user",
          content: [
            ...prepared.map((data) => ({ type: "image" as const, source: { type: "base64" as const, media_type: "image/jpeg" as const, data } })),
            { type: "text", text: `Categories in this shop:\n${catList.join("\n")}\n\nRead the photos and fill in the listing details.` },
          ],
        },
      ],
    });
    if (response.stop_reason === "refusal") return { error: "The photos couldn't be read. Try a clearer photo of the product's label." };
    if (!response.parsed_output) return { error: "The scan didn't return usable details. Try a clearer photo of the label." };
    return { result: response.parsed_output };
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return { error: "The scanning service key isn't valid. Ask the site owner to check ANTHROPIC_API_KEY." };
    if (e instanceof Anthropic.RateLimitError) return { error: "Scanning is busy right now — wait a minute and try again." };
    if (e instanceof Anthropic.BadRequestError) return { error: "That image couldn't be processed. Try a JPEG or PNG photo." };
    if (e instanceof Anthropic.APIError) return { error: "The scanning service had a problem. Please try again." };
    console.error("Product scan failed:", e);
    return { error: "Scanning failed. Check the internet connection and try again." };
  }
}

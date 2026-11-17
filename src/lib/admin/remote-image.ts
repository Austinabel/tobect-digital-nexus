import { lookup } from "node:dns/promises";
import { MAX_IMAGE_BYTES } from "@/lib/admin/image-file";
import { checkImageUrl, isPrivateAddress } from "@/lib/admin/url-safety";

const TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 3;

/**
 * Downloads an image from a public web address, safely:
 * - only http(s) to public hosts (every redirect hop is checked again, and
 *   the host's DNS answers must all be public addresses);
 * - at most 5 MB, read in a stream so a huge file is cut off early;
 * - 15-second limit.
 * The caller still checks the bytes really are an image (storeImage).
 */
export async function fetchRemoteImage(raw: string): Promise<{ bytes: Uint8Array; url: URL } | { error: string }> {
  let current = checkImageUrl(raw);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if ("error" in current) return current;
    const url = current.url;
    try {
      const addrs = await lookup(url.hostname.replace(/^\[|\]$/g, ""), { all: true });
      if (!addrs.length || addrs.some((a) => isPrivateAddress(a.address))) return { error: "That address points to a private network." };
    } catch {
      return { error: `Couldn't find the website ${url.hostname}.` };
    }

    let res: Response;
    try {
      res = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { accept: "image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8", "user-agent": "Mozilla/5.0 (compatible; ShopImageFetcher/1.0)" },
      });
    } catch (e) {
      return { error: e instanceof Error && e.name === "TimeoutError" ? "The image took too long to download." : "Couldn't download the image from that link." };
    }

    if (res.status >= 300 && res.status < 400) {
      const next = res.headers.get("location");
      if (!next) return { error: "The link redirected nowhere." };
      current = checkImageUrl(new URL(next, url).toString());
      continue;
    }
    if (!res.ok) return { error: `The website answered “${res.status}” — the image may have moved or need a login.` };
    const declared = Number(res.headers.get("content-length") ?? 0);
    if (declared > MAX_IMAGE_BYTES) return { error: "That image is larger than 5 MB." };
    const type = res.headers.get("content-type") ?? "";
    if (type && !type.startsWith("image/") && !type.startsWith("application/octet-stream") && !type.startsWith("binary/")) {
      return { error: "That link opens a web page, not an image. Right-click the picture and choose “Copy image address”." };
    }

    // read with a hard size cap
    const reader = res.body?.getReader();
    if (!reader) return { error: "The image was empty." };
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > MAX_IMAGE_BYTES) {
        await reader.cancel();
        return { error: "That image is larger than 5 MB." };
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let at = 0;
    for (const c of chunks) {
      bytes.set(c, at);
      at += c.length;
    }
    return { bytes, url };
  }
  return { error: "The link redirected too many times." };
}

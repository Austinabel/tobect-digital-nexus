/**
 * Rules for downloading an image from a link staff paste in. Pure and
 * unit-tested (url-safety.test.ts). The server only fetches public web
 * addresses: never the server's own network (a classic way to attack a
 * site is to make it fetch http://localhost/… or a cloud metadata address).
 */

export type UrlCheck = { url: URL } | { error: string };

export function checkImageUrl(raw: string): UrlCheck {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return { error: "That isn't a web address. Copy the image's address (right-click → Copy image address)." };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return { error: "Only http:// and https:// image links can be used." };
  if (url.username || url.password) return { error: "Links with a username or password can't be used." };
  if (url.port && url.port !== "80" && url.port !== "443") return { error: "Links to unusual ports can't be used." };
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") || !host.includes(".") && !host.includes(":")) {
    return { error: "That address points to a private network." };
  }
  if (isIpLiteral(host) && isPrivateAddress(host)) return { error: "That address points to a private network." };
  return { url };
}

export function isIpLiteral(host: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":");
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) return null;
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

const V4_BLOCKED: [string, number][] = [
  ["0.0.0.0", 8], // "this network"
  ["10.0.0.0", 8], // private
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local, incl. cloud metadata 169.254.169.254
  ["172.16.0.0", 12], // private
  ["192.0.0.0", 24], // IETF protocol assignments
  ["192.168.0.0", 16], // private
  ["198.18.0.0", 15], // benchmarking
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved + broadcast
];

/** true for loopback, private, link-local, multicast and other non-public addresses (IPv4 and IPv6). */
export function isPrivateAddress(ip: string): boolean {
  const addr = ip.replace(/^\[|\]$/g, "").toLowerCase();
  if (addr.includes(":")) {
    if (addr === "::" || addr === "::1") return true;
    const mapped = /^::(?:ffff:)?(\d{1,3}(?:\.\d{1,3}){3})$/.exec(addr);
    if (mapped) return isPrivateAddress(mapped[1]);
    // IPv4 hidden in IPv6, as URL parsers write it: ::ffff:7f00:1 (= 127.0.0.1), or the old ::7f00:1 form
    const hex = /^::(?:ffff:)?([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(addr);
    if (hex) {
      const hi = parseInt(hex[1], 16);
      const lo = parseInt(hex[2], 16);
      return isPrivateAddress(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
    }
    const first = parseInt(addr.split(":")[0] || "0", 16);
    if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
    if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
    if ((first & 0xff00) === 0xff00) return true; // multicast
    if (addr.startsWith("64:ff9b:")) return true; // NAT64 can reach IPv4 private space
    return false;
  }
  const n = ipv4ToInt(addr);
  if (n === null) return true; // unparseable → refuse
  return V4_BLOCKED.some(([base, bits]) => {
    const b = ipv4ToInt(base)!;
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (n & mask) >>> 0 === (b & mask) >>> 0;
  });
}

/** A readable file name from an image link, e.g. ".../deye-8kw.jpg?w=800" → "deye-8kw.jpg". */
export function fileNameFromUrl(url: URL): string {
  const last = decodeURIComponent(url.pathname.split("/").filter(Boolean).pop() ?? "").replace(/[^\w.\- ]+/g, "").slice(0, 80);
  return last || `${url.hostname}-image`;
}

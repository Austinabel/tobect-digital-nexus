/**
 * Upload checks for the media library. The file's real format is read from
 * its first bytes — the browser-supplied type and file name are not trusted.
 */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export type ImageKind = { mime: "image/jpeg" | "image/png" | "image/webp" | "image/avif"; ext: "jpg" | "png" | "webp" | "avif" };

export function sniffImage(buf: Uint8Array): ImageKind | null {
  const ascii = (a: number, b: number) => String.fromCharCode(...buf.subarray(a, b));
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (buf[0] === 0x89 && ascii(1, 4) === "PNG") return { mime: "image/png", ext: "png" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { mime: "image/webp", ext: "webp" };
  if (ascii(4, 8) === "ftyp" && /^avi[fs]$/.test(ascii(8, 12))) return { mime: "image/avif", ext: "avif" };
  return null;
}

/** Width/height from a JPEG, PNG or WebP header (AVIF: unknown → null). */
export function imageSize(buf: Uint8Array): { width: number; height: number } | null {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const ascii = (a: number, b: number) => String.fromCharCode(...buf.subarray(a, b));
  try {
    if (buf[0] === 0x89 && ascii(1, 4) === "PNG") return { width: dv.getUint32(16), height: dv.getUint32(20) };
    if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") {
      const chunk = ascii(12, 16);
      const u24 = (o: number) => buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16);
      if (chunk === "VP8X") return { width: 1 + u24(24), height: 1 + u24(27) };
      if (chunk === "VP8 ") return { width: dv.getUint16(26, true) & 0x3fff, height: dv.getUint16(28, true) & 0x3fff };
      if (chunk === "VP8L") {
        const b = dv.getUint32(21, true);
        return { width: (b & 0x3fff) + 1, height: ((b >> 14) & 0x3fff) + 1 };
      }
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i + 9 < buf.length) {
        if (buf[i] !== 0xff) return null;
        const marker = buf[i + 1];
        const len = dv.getUint16(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { height: dv.getUint16(i + 5), width: dv.getUint16(i + 7) };
        i += 2 + len;
      }
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Creates a deterministic SHA-256 hash for a parse request.
 * Used as the cache key in parse_cache.
 *
 * Normalises whitespace and lowercases text so minor formatting
 * differences in the same inquiry produce the same cache key.
 */
export async function createInquiryHash(
  sanitizedText: string,
  sourceType: string,
  parserVersion: string,
): Promise<string> {
  const normalised = [
    sanitizedText.replace(/\s+/g, " ").toLowerCase().trim(),
    sourceType,
    parserVersion,
  ].join("|");

  const encoded = new TextEncoder().encode(normalised);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);

  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Extracts the first complete JSON object from arbitrary text.
 *
 * Handles:
 * - Plain JSON response
 * - JSON embedded in prose
 * - JSON wrapped in ```json ... ``` or ``` ... ``` code fences
 *
 * Failure codes thrown as Error messages:
 * - NO_JSON_OBJECT   — no '{' found in text
 * - INVALID_JSON     — found '{' but could not parse valid JSON
 */
export function extractFirstJSONObject(text: string): Record<string, unknown> {
  const trimmed = text.trim();

  // Fast path: strip code fences and try direct parse first
  const stripped = stripCodeFence(trimmed);
  if (stripped !== trimmed) {
    try {
      return JSON.parse(stripped) as Record<string, unknown>;
    } catch {
      // fall through to brace-tracking extraction
    }
  }

  // Find the first '{'
  const start = trimmed.indexOf("{");
  if (start === -1) {
    throw new Error("NO_JSON_OBJECT");
  }

  // Track braces while respecting strings and escape sequences
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < trimmed.length; i++) {
    const ch = trimmed[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const slice = trimmed.slice(start, i + 1);
        try {
          return JSON.parse(slice) as Record<string, unknown>;
        } catch {
          throw new Error("INVALID_JSON");
        }
      }
    }
  }

  throw new Error("INVALID_JSON");
}

function stripCodeFence(text: string): string {
  const match = text.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```$/);
  return match ? match[1].trim() : text;
}

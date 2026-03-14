const MAX_OUTPUT_CHARS = 3000;

// Match reply-chain separators and everything after
const REPLY_CHAIN_RE =
  /(-{5,}[ \t]*(Original Message|Forwarded Message|Reply)[^\n]*)|(\bOn .{10,120}\bwrote:)/im;

// Email header lines at the start of quoted blocks
const EMAIL_HEADER_RE = /^(From|Sent|To|Cc|Bcc|Subject|Date):[ \t].+/gim;

// Lines that start with > (quoted replies)
const QUOTED_LINE_RE = /^>+[ \t]?.*/gm;

// Common signature starters — truncate everything from here onward
const SIGNATURE_STARTERS = [
  /^--\s*$/m,
  /^-{2,}\s*$/m,
  /^Regards,?\s*$/im,
  /^Best regards,?\s*$/im,
  /^Kind regards,?\s*$/im,
  /^Sincerely,?\s*$/im,
  /^Thanks,?\s*$/im,
  /^Thank you,?\s*$/im,
  /^Warm regards,?\s*$/im,
  /^Cheers,?\s*$/im,
  /^With (best )?regards,?\s*$/im,
  /^Yours (sincerely|faithfully),?\s*$/im,
];

// Footer / legal / unsubscribe blocks — remove matched span
const FOOTER_RES = [
  /unsubscribe\b[^]*?(?=\n\n|\n[A-Z]|$)/gi,
  /this (email|message) (was sent|is intended)[^]*?(?=\n\n|$)/gi,
  /if you (received|believe)\s+this[^]*?(?=\n\n|$)/gi,
  /confidentiality notice[^]*?(?=\n\n|$)/gi,
  /this message.{0,30}confidential[^]*?(?=\n\n|$)/gi,
  /all rights reserved.{0,100}/gi,
  /privacy policy\b.{0,100}/gi,
  /terms (of|and) (service|use|conditions)\b.{0,100}/gi,
];

// Lines that are only a URL or email address (social link lines)
const BARE_LINK_LINE_RE = /^[ \t]*(https?:\/\/\S+|www\.\S+|\S+@\S+\.\S+)[ \t]*$/gm;

export function sanitizeRawText(input: string): {
  sanitized_text: string;
  removed_chars: number;
} {
  let text = input;

  // 1. Truncate at reply-chain separator
  const chainMatch = REPLY_CHAIN_RE.exec(text);
  if (chainMatch?.index !== undefined) {
    text = text.slice(0, chainMatch.index);
  }

  // 2. Remove quoted reply lines
  text = text.replace(QUOTED_LINE_RE, "");

  // 3. Remove email header blocks
  text = text.replace(EMAIL_HEADER_RE, "");

  // 4. Truncate at signature
  for (const re of SIGNATURE_STARTERS) {
    const m = re.exec(text);
    if (m?.index !== undefined) {
      text = text.slice(0, m.index);
      break;
    }
  }

  // 5. Strip footer / legal / unsubscribe spans
  for (const re of FOOTER_RES) {
    text = text.replace(re, "");
  }

  // 6. Remove bare social/URL lines
  text = text.replace(BARE_LINK_LINE_RE, "");

  // 7. Normalise whitespace
  text = text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // 8. Hard cap
  if (text.length > MAX_OUTPUT_CHARS) {
    text = text.slice(0, MAX_OUTPUT_CHARS);
  }

  return {
    sanitized_text: text,
    removed_chars: Math.max(0, input.length - text.length),
  };
}

// Digit normalization for user input. Arabic-Indic (U+0660..0669) and Eastern
// Arabic-Indic (U+06F0..06F9) digits become ASCII; Arabic decimal/thousands
// separators become "." and ",". Original text fields are never passed through this.

const ARABIC_INDIC_ZERO = 0x0660;
const EASTERN_ARABIC_INDIC_ZERO = 0x06f0;

export function normalizeDigits(input: string): string {
  let out = "";
  for (const ch of input) {
    const code = ch.codePointAt(0)!;
    if (code >= ARABIC_INDIC_ZERO && code <= ARABIC_INDIC_ZERO + 9) {
      out += String(code - ARABIC_INDIC_ZERO);
    } else if (code >= EASTERN_ARABIC_INDIC_ZERO && code <= EASTERN_ARABIC_INDIC_ZERO + 9) {
      out += String(code - EASTERN_ARABIC_INDIC_ZERO);
    } else if (ch === "\u066B") {
      out += "."; // Arabic decimal separator
    } else if (ch === "\u066C") {
      out += ","; // Arabic thousands separator
    } else {
      out += ch;
    }
  }
  return out;
}

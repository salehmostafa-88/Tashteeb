import { describe, expect, it } from "vitest";
import ar from "../../messages/ar.json";
import en from "../../messages/en.json";

function flatten(obj: object, prefix = ""): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") acc[path] = value;
    else Object.assign(acc, flatten(value as object, path));
    return acc;
  }, {});
}

const arFlat = flatten(ar);
const enFlat = flatten(en);

describe("message catalogues", () => {
  it("Arabic and English have identical keys", () => {
    expect(Object.keys(arFlat).sort()).toEqual(Object.keys(enFlat).sort());
  });

  it("no empty strings", () => {
    for (const [key, value] of Object.entries({ ...arFlat, ...enFlat })) {
      expect(value.trim(), key).not.toBe("");
    }
  });

  // ICU "#" and "{x, number}" format with the plain "ar" locale, which renders
  // Western digits. Pass preformatted text instead (owner decision O06).
  it("Arabic messages never format numbers through ICU", () => {
    for (const [key, value] of Object.entries(arFlat)) {
      expect(/#|,\s*number\b/.test(value), key).toBe(false);
    }
  });

  it("Arabic messages contain no Western digits outside ICU plural selectors", () => {
    for (const [key, value] of Object.entries(arFlat)) {
      expect(/[0-9]/.test(value.replace(/=\d+\s*\{/g, "{")), key).toBe(false);
    }
  });
});

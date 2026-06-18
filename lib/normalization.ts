import Fuse from "fuse.js";
import slugify from "slugify";
import { COMPANIES, LEGAL_SUFFIXES } from "./constants";

function normalizeRawName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[.,()]/g, "")
    .replace(/\s+/g, " ")
    .split(" ")
    .filter((word) => !LEGAL_SUFFIXES.has(word))
    .join(" ")
    .trim();
}

function createAliasIndex() {
  const aliases: {
    alias: string;
    companyName: string;
    companySlug: string;
  }[] = [];

  for (const company of COMPANIES) {
    for (const alias of company.aliases) {
      aliases.push({
        alias: normalizeRawName(alias),
        companyName: company.name,
        companySlug: company.slug,
      });
    }
  }

  return aliases;
}

const ALIAS_INDEX = createAliasIndex();

const fuse = new Fuse(ALIAS_INDEX, {
  keys: ["alias"],
  threshold: 0.25,
  includeScore: true,
});

export function resolveCompany(input: string) {
  const normalized = normalizeRawName(input);

  const exactMatch = ALIAS_INDEX.find((item) => item.alias === normalized);

  if (exactMatch) {
    return {
      company: exactMatch.companyName,
      slug: exactMatch.companySlug,
      normalizedName: exactMatch.companySlug,
      metadata: COMPANIES.find((company) => company.slug === exactMatch.companySlug),
      confidence: 1,
      source: "EXACT_MATCH",
    };
  }

  const fuzzyResults = fuse.search(normalized);

  if (fuzzyResults.length > 0) {
    const best = fuzzyResults[0];

    const confidence = Number((1 - (best.score ?? 0)).toFixed(2));

    if (confidence >= 0.8) {
      return {
        company: best.item.companyName,
        slug: best.item.companySlug,
        normalizedName: best.item.companySlug,
        metadata: COMPANIES.find((company) => company.slug === best.item.companySlug),
        confidence,
        source: "FUZZY_MATCH",
      };
    }
  }

  return {
    company: null,
    slug: slugify(normalized, {
      lower: true,
      strict: true,
    }),
    normalizedName: normalized,
    metadata: null,
    confidence: 0,
    source: "REVIEW_REQUIRED",
  };
}

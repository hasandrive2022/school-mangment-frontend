/**
 * Bengali labels for content category codes (Round 6, P9).
 *
 * The backend/admin store category codes in English ("exam", "general", …).
 * The public UI must never show those raw codes — map them here. Unknown
 * codes that already contain Bengali text pass through unchanged; unknown
 * Latin codes fall back to a neutral Bengali label instead of leaking
 * English into the UI.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  general: "সাধারণ",
  notice: "নোটিশ",
  admission: "ভর্তি",
  exam: "পরীক্ষা",
  exams: "পরীক্ষা",
  holiday: "ছুটি",
  holidays: "ছুটি",
  result: "ফলাফল",
  results: "ফলাফল",
  fee: "ফি",
  fees: "ফি",
  urgent: "জরুরি",
  event: "অনুষ্ঠান",
  events: "অনুষ্ঠান",
  news: "খবর",
  academic: "একাডেমিক",
  form: "ফরম",
  forms: "ফরম",
  syllabus: "সিলেবাস",
  routine: "রুটিন",
  book: "বই",
  books: "বই",
  certificate: "সনদ",
  sports: "খেলাধুলা",
  culture: "সাংস্কৃতিক",
  cultural: "সাংস্কৃতিক",
  scout: "স্কাউট",
  science: "বিজ্ঞান",
  rti: "তথ্য অধিকার",
  grs: "অভিযোগ প্রতিকার",
  apa: "বার্ষিক কর্মসম্পাদনা",
  nis: "শুদ্ধাচার",
  charter: "সিটিজেন চার্টার",
  other: "অন্যান্য",
  others: "অন্যান্য",
};

export function categoryLabel(raw: string | null | undefined): string {
  if (!raw) return "";
  const key = raw.trim().toLowerCase();
  if (CATEGORY_LABELS[key]) return CATEGORY_LABELS[key];
  // Already-Bengali (or mixed) labels pass through as stored.
  if (/[\u0980-\u09FF]/.test(raw)) return raw;
  return "অন্যান্য";
}

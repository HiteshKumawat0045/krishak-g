export function detectLanguage(text: string): "hi" | "en" {
  const devanagariRegex = /[\u0900-\u097F]/;
  return devanagariRegex.test(text) ? "hi" : "en";
}

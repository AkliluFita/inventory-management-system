"use client";

import type { Language } from "@primestock/domain";

export function PublicLanguageSelect({ language, onChange, light = false }: { language: Language; onChange: (value: Language) => void; light?: boolean }) {
  return <select className={`public-language-select${light ? " light" : ""}`} aria-label="Language" value={language} onChange={event => onChange(event.target.value as Language)}>
    <option value="en">English</option><option value="am">አማርኛ</option><option value="om">Afaan Oromoo</option>
  </select>;
}

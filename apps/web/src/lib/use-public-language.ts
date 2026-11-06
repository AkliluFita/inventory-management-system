"use client";

import { useEffect, useState } from "react";
import { languages, translate, type Language } from "@primestock/domain";

export function usePublicLanguage() {
  const [language, updateLanguage] = useState<Language>("en");
  useEffect(() => {
    const stored = window.localStorage.getItem("primestock.web.language") || navigator.language.slice(0, 2);
    if (languages.some(item => item.code === stored)) queueMicrotask(() => updateLanguage(stored as Language));
  }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  function setLanguage(next: Language) {
    updateLanguage(next);
    window.localStorage.setItem("primestock.web.language", next);
  }
  return { language, setLanguage, t: (text: string) => translate(text, language) };
}

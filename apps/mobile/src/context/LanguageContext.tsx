import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { translate, languages } from "@primestock/domain";
import type { Language } from "@primestock/domain";
export { languages };
export type { Language };

const storageKey = "primestock.language.v1";
const initialLanguage = (): Language => {
  const code = getLocales()[0]?.languageCode;
  return code === "am" || code === "om" ? code : "en";
};

type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: (text: string) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, updateLanguage] = useState<Language>(initialLanguage);
  const selectedByUser = useRef(false);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(storageKey).then((saved) => { if (active && !selectedByUser.current && (saved === "en" || saved === "am" || saved === "om")) updateLanguage(saved); }).catch(() => {});
    return () => { active = false; };
  }, []);
  const setLanguage = useCallback((next: Language) => { selectedByUser.current = true; updateLanguage(next); void AsyncStorage.setItem(storageKey, next).catch(() => {}); }, []);
  const t = useCallback((text: string) => translate(text, language), [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used within LanguageProvider");
  return value;
}

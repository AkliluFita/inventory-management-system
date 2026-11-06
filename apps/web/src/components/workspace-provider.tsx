"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { languages, translate, type InventorySnapshot, type Language, type TradeSnapshot } from "@primestock/domain";
import { getWorkspace } from "@/lib/api";
import { createClient } from "@/lib/supabase/browser";

type Workspace = { inventory: InventorySnapshot; trade: TradeSnapshot; branchId: string };
type WorkspaceContextValue = {
  client: SupabaseClient; userPhone: string; workspace: Workspace | null; branchId: string;
  loading: boolean; busy: boolean; error: string | null;
  language: Language; setLanguage: (value: Language) => void; t: (value: string) => string;
  selectBranch: (id: string) => void; refresh: () => Promise<void>;
  run: <T>(operation: (client: SupabaseClient, branchId: string) => Promise<T>) => Promise<T>;
};
const Context = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children, userPhone }: { children: React.ReactNode; userPhone: string }) {
  const [client] = useState(createClient);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [branchId, updateBranchId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, updateLanguage] = useState<Language>("en");
  const sequence = useRef(0);

  const load = useCallback(async (selected?: string) => {
    const request = ++sequence.current;
    setLoading(true); setError(null);
    try {
      const next = await getWorkspace(client, selected);
      if (request !== sequence.current) return;
      setWorkspace(next); updateBranchId(next.branchId);
      window.localStorage.setItem("primestock.web.branch", next.branchId);
    } catch (cause) {
      if (request === sequence.current) setError(cause instanceof Error ? cause.message : "Could not load your workspace.");
    } finally { if (request === sequence.current) setLoading(false); }
  }, [client]);

  useEffect(() => {
    let active = true;
    const saved = window.localStorage.getItem("primestock.web.branch") || undefined;
    const code = window.localStorage.getItem("primestock.web.language") || navigator.language.slice(0,2);
    if (languages.some(item => item.code === code)) queueMicrotask(() => { if (active) updateLanguage(code as Language); });
    queueMicrotask(() => { if (active) void load(saved); });
    return () => { active = false; };
  }, [load]);

  const setLanguage = useCallback((next: Language) => { updateLanguage(next); window.localStorage.setItem("primestock.web.language", next); }, []);
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  const selectBranch = useCallback((id: string) => {
    if (!id || id === branchId) return;
    window.localStorage.setItem("primestock.web.branch", id);
    setWorkspace(null);
    updateBranchId(id);
    void load(id);
  }, [branchId, load]);
  const refresh = useCallback(() => load(branchId), [branchId, load]);
  const run = useCallback(async <T,>(operation: (c: SupabaseClient, id: string) => Promise<T>): Promise<T> => {
    if (!branchId) throw new Error("Choose a branch first.");
    setBusy(true);
    try { const result = await operation(client, branchId); await load(branchId); return result; }
    finally { setBusy(false); }
  }, [branchId, client, load]);
  const t = useCallback((text: string) => translate(text, language), [language]);
  const value = useMemo(() => ({ client, userPhone, workspace, branchId, loading, busy, error, language, setLanguage, t, selectBranch, refresh, run }), [client, userPhone, workspace, branchId, loading, busy, error, language, setLanguage, t, selectBranch, refresh, run]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useWorkspace() {
  const value = useContext(Context);
  if (!value) throw new Error("WorkspaceProvider is missing.");
  return value;
}

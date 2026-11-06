"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { Modal } from "@/components/ui";
import { useWorkspace } from "@/components/workspace-provider";

export const field = (data: FormData, name: string) => String(data.get(name) ?? "").trim();
export function positive(data: FormData, name: string, label: string, integer = false) {
  const value = Number(field(data,name).replace(/,/g,""));
  if (!Number.isFinite(value) || value <= 0 || (integer && !Number.isInteger(value))) throw new Error(`${label} must be a positive ${integer?"whole number":"number"}.`);
  return value;
}
export function nonNegative(data: FormData, name: string, label: string, integer = false) {
  const value = Number(field(data,name).replace(/,/g,""));
  if (!Number.isFinite(value) || value < 0 || (integer && !Number.isInteger(value))) throw new Error(`${label} must be zero or more${integer?" whole units":""}.`);
  return value;
}
export function required(data: FormData, name: string, label: string) {
  const value=field(data,name);
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

export function ActionDialog({ title, subtitle, submitLabel, onClose, onSave, children }: { title:string; subtitle?:string; submitLabel:string; onClose:()=>void; onSave:(data:FormData)=>Promise<void>; children:ReactNode }) {
  const { t } = useWorkspace();
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try { await onSave(new FormData(event.currentTarget)); onClose(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save your changes."); }
    finally { setBusy(false); }
  }
  return <Modal title={title} subtitle={subtitle} onClose={()=>{if(!busy)onClose();}}><form onSubmit={submit}><div className="form-grid">{children}</div>{error&&<div className="form-error" role="alert" style={{marginTop:16}}>{error}</div>}<div className="form-actions"><button className="button secondary" type="button" disabled={busy} onClick={onClose}>{t("Cancel")}</button><button className="button primary" type="submit" disabled={busy}>{busy&&<LoaderCircle className="spin" size={16}/>} {t(submitLabel)}</button></div></form></Modal>;
}

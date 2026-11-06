"use client";

import { Search, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useWorkspace } from "@/components/workspace-provider";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  const { t } = useWorkspace();
  return <div className="page-header"><div>{eyebrow&&<div className="eyebrow"><span className="eyebrow-line"/>{t(eyebrow)}</div>}<h1>{t(title)}</h1>{description&&<p>{t(description)}</p>}</div>{actions&&<div className="page-actions">{actions}</div>}</div>;
}
export function Panel({ title, hint, action, children, className="" }: { title?: string; hint?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  const { t } = useWorkspace();
  return <section className={`panel ${className}`}>{(title||action)&&<div className="panel-heading"><div>{title&&<h2>{t(title)}</h2>}{hint&&<p>{t(hint)}</p>}</div>{action}</div>}{children}</section>;
}
export function StatCard({ label, value, detail, icon: Icon, tone="blue" }: { label: string; value: string; detail?: string; icon: LucideIcon; tone?: "blue"|"mint"|"amber"|"rose" }) {
  const { t } = useWorkspace();
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={22}/></div><div className="stat-label">{t(label)}</div><div className="stat-value">{value}</div>{detail&&<div className="stat-detail">{t(detail)}</div>}</div>;
}
export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (value:string)=>void; placeholder?: string }) {
  const { t } = useWorkspace();
  return <div className="search-field"><Search size={18}/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={t(placeholder||"Search...")} aria-label={t(placeholder||"Search")}/></div>;
}
export function Empty({ icon:Icon, title, description, action }: { icon:LucideIcon; title:string; description:string; action?:ReactNode }) {
  const { t } = useWorkspace();
  return <div className="empty-state"><div className="empty-icon"><Icon size={25}/></div><h3>{t(title)}</h3><p>{t(description)}</p>{action}</div>;
}
export function Badge({ children, tone="neutral" }: { children:ReactNode; tone?:"neutral"|"green"|"amber"|"red"|"blue" }) {
  const { t } = useWorkspace();
  return <span className={`badge ${tone}`}>{typeof children === "string" ? t(children) : children}</span>;
}
export function FormField({ label, children, hint }: { label:string; children:ReactNode; hint?:string }) {
  const { t } = useWorkspace();
  return <label className="form-field"><span>{t(label)}</span>{children}{hint&&<small>{t(hint)}</small>}</label>;
}
export function Modal({ title, subtitle, onClose, children }: { title:string; subtitle?:string; onClose:()=>void; children:ReactNode }) {
  const { t } = useWorkspace();
  return <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div className="modal" role="dialog" aria-modal="true" aria-label={t(title)}><div className="modal-heading"><div><h2>{t(title)}</h2>{subtitle&&<p>{t(subtitle)}</p>}</div><button className="modal-close" aria-label={t("Close")} onClick={onClose}>×</button></div>{children}</div></div>;
}
export const displayDate = (date: string) => date ? new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { day:"numeric", month:"short", year:"numeric" }) : "—";

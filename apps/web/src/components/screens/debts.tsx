"use client";

import { useState } from "react";
import { AlertCircle, Check, CreditCard, Search, Users } from "lucide-react";
import { money } from "@primestock/domain";
import { useWorkspace } from "@/components/workspace-provider";
import { mutations } from "@/lib/api";
import { Badge, Empty, PageHeader, Panel, SearchField, StatCard, displayDate } from "@/components/ui";

export function DebtsScreen() {
  const { workspace, run, t }=useWorkspace();
  const [query,setQuery]=useState("");
  const [pending,setPending]=useState("");
  const [error,setError]=useState("");
  const debts=workspace!.inventory.debts;
  const unpaid=debts.filter(d=>!d.paid);
  const overdue=unpaid.filter(d=>d.daysOverdue>0);
  const shown=debts.filter(d=>`${d.customer} ${d.id}`.toLowerCase().includes(query.toLowerCase()));
  async function settle(id:string) {
    if (!window.confirm("Mark this debt as paid?")) return;
    setPending(id);setError("");
    try { await run(c=>mutations.settleDebt(c,id)); }
    catch(cause){setError(cause instanceof Error?cause.message:"Could not update the debt.");}
    finally{setPending("");}
  }
  return <><PageHeader eyebrow="CUSTOMER ACCOUNTS" title="Customer debts" description="Track credit sales and close balances when customers pay."/>
    <div className="stats-grid"><StatCard label="Outstanding balance" value={money(unpaid.reduce((sum,d)=>sum+d.amount,0))} icon={CreditCard} tone="rose"/><StatCard label="Open balances" value={String(unpaid.length)} icon={Users}/><StatCard label="Overdue customers" value={String(overdue.length)} icon={AlertCircle} tone="amber"/><StatCard label="Payments settled" value={String(debts.filter(d=>d.paid).length)} icon={Check} tone="mint"/></div>
    {error&&<div className="notice red" role="alert">{error}</div>}
    <Panel title="Customer balances" hint="Credit sales in the selected branch"><div className="toolbar"><SearchField value={query} onChange={setQuery} placeholder="Search customer or debt ID..."/><span className="summary-pill"><strong>{shown.length}</strong> records</span></div>{shown.length?<div className="table-wrap"><table className="data-table"><thead><tr><th>{t('Customer')}</th><th>{t('Due date')}</th><th>{t('Status')}</th><th className="number">{t('Balance')}</th><th className="actions-cell">{t('Action')}</th></tr></thead><tbody>{shown.map(d=><tr key={d.id}><td><strong>{d.customer}</strong><small>{d.id.slice(0,8).toUpperCase()}</small></td><td>{displayDate(d.dueDate)}</td><td><Badge tone={d.paid?"green":d.daysOverdue>0?"red":"amber"}>{d.paid?"Paid":d.daysOverdue>0?`${d.daysOverdue} days overdue`:"Due soon"}</Badge></td><td className="number"><strong>{money(d.amount)}</strong></td><td className="actions-cell">{!d.paid&&<button className="text-link" disabled={pending===d.id} onClick={()=>void settle(d.id)}>{pending===d.id?"Updating...":t("Mark paid")}</button>}</td></tr>)}</tbody></table></div>:<Empty icon={Search} title={query?"No matching customer":"No credit sales yet"} description={query?"Try another search term.":"Partial credit sales will appear here."}/>}</Panel>
  </>;
}

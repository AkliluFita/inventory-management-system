"use client";

import { useState } from "react";
import { Banknote, FileText, Landmark, Plus, Wallet } from "lucide-react";
import { ethiopianBanks, money, today, transferEquivalent, validDate } from "@primestock/domain";
import { useWorkspace } from "@/components/workspace-provider";
import { ActionDialog, positive, required } from "@/components/action-dialog";
import { Empty, FormField, PageHeader, Panel, StatCard, displayDate } from "@/components/ui";
import { mutations, receiptUrl } from "@/lib/api";

export function TransfersScreen() {
  const {workspace,client,run,t}=useWorkspace();
  const [open,setOpen]=useState(false);
  const [error,setError]=useState("");
  const transfers=workspace!.trade.transfers;
  const amount=transfers.reduce((sum,t)=>sum+t.amountEtb,0);
  async function viewReceipt(path:string){
    setError("");
    const popup=window.open("","_blank","noopener,noreferrer");
    try {const url=await receiptUrl(client,path);if(popup)popup.location.href=url;else window.location.assign(url);}
    catch(cause){popup?.close();setError(cause instanceof Error?cause.message:"Could not open the receipt.");}
  }
  return <><PageHeader eyebrow="FINANCIAL OPERATIONS" title="Bank transfers" description="Record transfer values, exchange rates and receipt documents." actions={<button className="button primary" onClick={()=>setOpen(true)}><Plus size={16}/> {t("New transfer")}</button>}/>
    <div className="stats-grid"><StatCard label="Recorded transfers" value={String(transfers.length)} icon={Landmark}/><StatCard label="Total ETB transferred" value={money(amount)} icon={Wallet} tone="mint"/><StatCard label="Receipt documents" value={String(transfers.filter(t=>t.receipt).length)} icon={FileText} tone="amber"/><StatCard label="Banks used" value={String(new Set(transfers.map(t=>t.bank)).size)} icon={Banknote} tone="blue"/></div>
    {error&&<div className="notice red" role="alert">{error}</div>}
    <Panel title="Transfer history" hint="Financial transfers in the selected branch">{transfers.length?<div className="table-wrap"><table className="data-table"><thead><tr><th>{t('Bank & remitter')}</th><th>{t('Date')}</th><th className="number">{t('Amount (ETB)')}</th><th className="number">{t('USD equivalent')}</th><th className="number">{t('AED equivalent')}</th><th>{t('Receipt')}</th></tr></thead><tbody>{transfers.map(transfer=><tr key={transfer.id}><td><strong>{transfer.bank}</strong><small>{transfer.remitter}</small></td><td>{displayDate(transfer.date)}</td><td className="number"><strong>{money(transfer.amountEtb)}</strong></td><td className="number">${transferEquivalent(transfer.amountEtb,transfer.usdRate).toLocaleString("en-US",{maximumFractionDigits:2})}</td><td className="number">{transferEquivalent(transfer.amountEtb,transfer.aedRate).toLocaleString("en-US",{maximumFractionDigits:2})} AED</td><td>{transfer.receipt?<button className="text-link" onClick={()=>void viewReceipt(transfer.receipt!.uri)}><FileText size={14} style={{display:"inline"}}/> {t("View")}</button>:"—"}</td></tr>)}</tbody></table></div>:<Empty icon={Landmark} title="No bank transfers yet" description="Record your first transfer to see it here." action={<button className="button primary" onClick={()=>setOpen(true)}>{t("New transfer")}</button>}/>}</Panel>
    {open&&<ActionDialog title="Record bank transfer" subtitle="A receipt PDF or image can be attached (maximum 10 MB)." submitLabel="Save transfer" onClose={()=>setOpen(false)} onSave={async form=>{const date=required(form,"date","Date");if(!validDate(date))throw new Error("Choose a valid date.");const file=form.get("receipt");const receipt=file instanceof File&&file.size>0?file:undefined;await run((c,id)=>mutations.createTransfer(c,id,{date,amountEtb:positive(form,"amountEtb","Amount"),bank:required(form,"bank","Bank"),usdRate:positive(form,"usdRate","USD rate"),aedRate:positive(form,"aedRate","AED rate"),remitter:required(form,"remitter","Remitter")},receipt));}}><FormField label="Transfer date"><input name="date" type="date" defaultValue={today()} required/></FormField><FormField label="Amount (ETB)"><input name="amountEtb" type="number" min="0.01" step="0.01" required/></FormField><div className="full"><FormField label="Bank"><select name="bank" defaultValue="" required><option value="" disabled>Choose bank</option>{ethiopianBanks.map(bank=><option key={bank} value={bank}>{bank}</option>)}</select></FormField></div><FormField label="USD exchange rate"><input name="usdRate" type="number" min="0.01" step="0.01" required/></FormField><FormField label="AED exchange rate"><input name="aedRate" type="number" min="0.01" step="0.01" required/></FormField><div className="full"><FormField label="Remitter"><input name="remitter" placeholder="Sender or account holder" required/></FormField></div><div className="full"><FormField label="Receipt"><input className="file-input" name="receipt" type="file" accept="image/*,.pdf,application/pdf"/></FormField></div></ActionDialog>}
  </>;
}

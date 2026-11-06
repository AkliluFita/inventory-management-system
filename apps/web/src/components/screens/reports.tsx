"use client";

import { useState } from "react";
import { BarChart3, CircleDollarSign, CreditCard, TrendingUp, Wallet } from "lucide-react";
import { money, type ReportPeriod } from "@primestock/domain";
import { useWorkspace } from "@/components/workspace-provider";
import { Badge, Empty, PageHeader, Panel, StatCard, displayDate } from "@/components/ui";

const periods:ReportPeriod[]=["Daily","Weekly","Monthly","Annual"];
export function ReportsScreen() {
  const { workspace, t }=useWorkspace();
  const [period,setPeriod]=useState<ReportPeriod>("Monthly");
  const data=workspace!.inventory;
  const totals=data.reportTotals?.[period]??{revenue:0,cost:0};
  const profit=totals.revenue-totals.cost;
  const margin=totals.revenue>0?Math.round(profit/totals.revenue*100):0;
  const recent=data.sales.slice(0,8);
  const chart=[...recent].reverse();
  const max=Math.max(1,...chart.map(s=>s.total));
  return <><PageHeader eyebrow="FINANCIAL PERFORMANCE" title="Reports & insights" description="See how sales, costs and profit change in your selected branch."/>
    <div className="section-tabs">{periods.map(p=><button className={period===p?"active":""} key={p} onClick={()=>setPeriod(p)}>{t(p)}</button>)}</div>
    <div className="stats-grid"><StatCard label="Revenue" value={money(totals.revenue)} icon={CreditCard}/><StatCard label="Cost of goods sold" value={money(totals.cost)} icon={Wallet} tone="amber"/><StatCard label="Gross profit" value={money(profit)} icon={TrendingUp} tone="mint"/><StatCard label="Profit margin" value={`${margin}%`} icon={CircleDollarSign} tone="blue"/></div>
    <div className="content-grid"><Panel title="Recent sales trend" hint="Individual sales loaded in this branch">{chart.length?<><div className="chart-placeholder">{chart.map(s=><div className="chart-column" key={s.id} title={`${displayDate(s.date)}: ${money(s.total)}`} style={{height:`${Math.max(4,s.total/max*100)}%`}}/>)}</div><div className="chart-labels">{chart.map(s=><span key={s.id}>{new Date(`${s.date}T00:00:00`).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>)}</div></>:<Empty icon={BarChart3} title="No sales to chart" description="Complete a sale to see a trend here."/>}</Panel><Panel title="Profit & loss" hint={`${period} summary from completed sales`}><div className="report-line"><span>Sales revenue</span><strong>{money(totals.revenue)}</strong></div><div className="report-line"><span>Cost of goods sold</span><strong>- {money(totals.cost)}</strong></div><div className="report-line total"><span>Gross profit</span><strong>{money(profit)}</strong></div><div className="notice blue" style={{marginTop:22,marginBottom:0}}><BarChart3 size={19}/><span>These totals come from the database, so they include the entire selected period even when the recent sales list is limited.</span></div></Panel></div>
    <Panel title="Recent transactions" hint="Latest completed sales" className="mt-4">{recent.length?<div className="table-wrap"><table className="data-table"><thead><tr><th>{t('Sale')}</th><th>{t('Date')}</th><th>{t('Customer')}</th><th>{t('Payment')}</th><th className="number">{t('Items')}</th><th className="number">{t('Total')}</th></tr></thead><tbody>{recent.map(s=><tr key={s.id}><td><strong>{s.id.slice(0,8).toUpperCase()}</strong></td><td>{displayDate(s.date)}</td><td>{s.customer||"Walk-in customer"}</td><td><Badge tone={s.method==="Partial credit"?"amber":"green"}>{s.method}</Badge></td><td className="number">{s.items}</td><td className="number"><strong>{money(s.total)}</strong></td></tr>)}</tbody></table></div>:<Empty icon={CreditCard} title="No sales yet" description="Completed sales will be listed here."/>}</Panel>
  </>;
}

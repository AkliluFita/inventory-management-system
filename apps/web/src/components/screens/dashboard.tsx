"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Boxes, CircleAlert, CreditCard, Package, PackagePlus, ShoppingCart, TrendingUp, Truck } from "lucide-react";
import { money, stockStatus } from "@primestock/domain";
import { useWorkspace } from "@/components/workspace-provider";
import { PageHeader, Panel, StatCard, Empty } from "@/components/ui";

export function DashboardScreen() {
  const { workspace, t } = useWorkspace();
  const data = workspace!.inventory;
  const branch = data.branches.find(item=>item.id===workspace!.branchId);
  const low = data.products.filter(p=>stockStatus(p)!=="in-stock");
  const overdue = data.debts.filter(d=>!d.paid && d.daysOverdue>0);
  const daily = Array.from({length:7},(_,i)=>{
    const date=new Date(); date.setDate(date.getDate()-(6-i));
    const iso=date.toISOString().slice(0,10);
    return {label:date.toLocaleDateString("en-US",{weekday:"short"}), value:data.sales.filter(s=>s.date===iso).reduce((sum,s)=>sum+s.total,0)};
  });
  const max=Math.max(1,...daily.map(d=>d.value));
  return <><PageHeader eyebrow="WORKSPACE OVERVIEW" title={`${t("Good to see you")}${branch?`, ${branch.name}`:""}`} description="Here is what is happening in your inventory today." actions={<Link href="/sales" className="button primary"><ShoppingCart size={16}/> {t("Open sales")}</Link>}/>
    <div className="stats-grid"><StatCard label="Today's sales" value={money(data.todaySalesBase)} detail="Revenue from completed sales" icon={CreditCard}/><StatCard label="Stock products" value={data.products.length.toLocaleString()} detail="In the selected branch" icon={Boxes} tone="mint"/><StatCard label="Low or out of stock" value={String(low.length)} detail="Products needing attention" icon={CircleAlert} tone="amber"/><StatCard label="Unpaid customer debts" value={money(data.debts.filter(d=>!d.paid).reduce((sum,d)=>sum+d.amount,0))} detail={`${overdue.length} overdue customer${overdue.length===1?"":"s"}`} icon={TrendingUp} tone="rose"/></div>
    <div className="content-grid"><Panel title="Sales at a glance" hint="Recent sales in this branch" action={<Link className="panel-action" href="/reports">{t("View reports")} <ArrowRight size={13} style={{display:"inline"}}/></Link>}><div className="metric-strip"><div><small>Monthly revenue</small><strong>{money(data.monthlyRevenueBase)}</strong></div><div><small>Completed sales shown</small><strong>{data.sales.length}</strong></div></div><div className="chart-placeholder" aria-label="Sales over the last seven days">{daily.map((item,i)=><div className="chart-column" key={i} title={`${item.label}: ${money(item.value)}`} style={{height:`${Math.max(4,item.value/max*100)}%`}}/>)}</div><div className="chart-labels">{daily.map((item,i)=><span key={i}>{item.label}</span>)}</div></Panel>
      <Panel title="Stock watch" hint="Items to check first" action={<Link className="panel-action" href="/inventory">{t("View All")} <ArrowRight size={13} style={{display:"inline"}}/></Link>}>{low.length?low.slice(0,5).map(p=><div className="progress-row" key={p.id}><span className="product-name">{p.name}</span><div className="progress"><span className={p.stock===0?"red":"orange"} style={{width:`${Math.max(3,Math.min(100,p.minStock?100*p.stock/(p.minStock*2):100))}%`}}/></div><small>{p.stock} left</small></div>):<Empty icon={Package} title="Stock looks healthy" description="No products are below their reorder point."/>}</Panel></div>
    <div className="content-grid equal" style={{marginTop:17}}><Panel title="Recent activity" hint="Your latest workspace events">{data.activities.length?data.activities.slice(0,5).map(a=><div className="activity-row" key={a.id}><span className="activity-icon">{a.kind==="sale"?<ShoppingCart size={16}/>:a.kind==="order"?<Truck size={16}/>:<PackagePlus size={16}/>}</span><div><strong>{t(a.title)}</strong><p>{a.detail}</p></div><time>{a.time}</time></div>):<Empty icon={Boxes} title="No activity yet" description="Your sales and stock movements will appear here."/>}</Panel><Panel title="Quick actions" hint="Get the next task done"><div className="quick-actions"><Link href="/inventory"><PackagePlus size={17}/> {t("Add product")}</Link><Link href="/procurement"><Truck size={17}/> {t("Receive stock")}</Link><Link href="/sales"><ShoppingCart size={17}/> {t("Make a sale")}</Link><Link href="/branches"><Boxes size={17}/> {t("Switch branch")}</Link></div><div className="notice blue" style={{marginTop:20,marginBottom:0}}><ArrowUpRight size={19}/><span>Your mobile app and web workspace use the same Supabase data. Changes made here appear in both.</span></div></Panel></div>
  </>;
}

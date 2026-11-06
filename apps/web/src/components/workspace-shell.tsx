"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Activity, ArrowRight, BarChart3, Boxes, Building2, ChevronDown, LayoutDashboard, LogOut, Menu, Package, RefreshCw, ShoppingCart, Truck, Users, Wallet, X } from "lucide-react";
import { useWorkspace } from "@/components/workspace-provider";

const nav = [
  { title: "Overview", items: [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "/sales", label: "Sales", icon: ShoppingCart },
    { href: "/procurement", label: "Procurement", icon: Truck },
  ] },
  { title: "Operations", items: [
    { href: "/debts", label: "Customer debts", icon: Users },
    { href: "/imports", label: "Imports & arrivals", icon: Boxes },
    { href: "/transfers", label: "Bank transfers", icon: Wallet },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/branches", label: "Branches", icon: Building2 },
  ] },
] as const;

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const { client, userPhone, workspace, branchId, selectBranch, refresh, loading, language, setLanguage, t } = useWorkspace();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const currentBranch = workspace?.inventory.branches.find(item => item.id === branchId);
  const currentLabel = [...nav[0].items, ...nav[1].items].find(item => item.href === pathname)?.label || "Dashboard";
  async function signOut() {
    const { error } = await client.auth.signOut();
    if (error) { window.alert(error.message); return; }
    router.replace("/login"); router.refresh();
  }
  return <div className="workspace-layout">
    {open && <button className="mobile-scrim" aria-label="Close menu" onClick={()=>setOpen(false)}/>}
    <aside className={`sidebar ${open?"sidebar-open":""}`}>
      <div className="sidebar-top"><Link href="/dashboard" className="brand-lockup sidebar-brand" onClick={()=>setOpen(false)}><span className="brand-mark"><Boxes size={23}/></span><span>PrimeStock</span></Link><button className="mobile-close icon-button" aria-label="Close menu" onClick={()=>setOpen(false)}><X size={19}/></button></div>
      <div className="sidebar-workspace"><span className="sidebar-workspace-label">WORKSPACE</span><div className="sidebar-workspace-name"><div className="workspace-avatar"><Building2 size={19}/></div><div><strong>{currentBranch?.name || "PrimeStock"}</strong><small>{currentBranch?.city || "Inventory management"}</small></div><ChevronDown size={16}/></div></div>
      <nav className="sidebar-nav" aria-label="Main navigation">{nav.map(group => <div className="nav-group" key={group.title}><div className="nav-group-label">{t(group.title)}</div>{group.items.map(item => { const Icon=item.icon; const active=pathname===item.href; return <Link key={item.href} href={item.href} className={`nav-link ${active?"active":""}`} onClick={()=>setOpen(false)}><Icon size={18}/><span>{t(item.label)}</span>{active&&<span className="nav-active-dot"/>}</Link>; })}</div>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-tip"><div className="tip-icon"><Activity size={19}/></div><strong>{t("Stay one step ahead")}</strong><p>{t("Keep your products moving with live stock and sales data.")}</p><Link href="/reports" onClick={()=>setOpen(false)}>{t("View reports")} <ArrowRight size={15}/></Link></div><button className="nav-link signout" onClick={signOut}><LogOut size={18}/><span>{t("Log Out")}</span></button></div>
    </aside>
    <div className="main-column"><header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" aria-label="Open menu" onClick={()=>setOpen(true)}><Menu size={22}/></button><div className="topbar-breadcrumb"><span>{t("Workspace")}</span><span className="breadcrumb-slash">/</span><strong>{currentLabel}</strong></div></div><div className="topbar-actions"><div className="topbar-branch"><Building2 size={17}/><select aria-label="Active branch" value={branchId} onChange={e=>selectBranch(e.target.value)} disabled={loading||!workspace}>{workspace?.inventory.branches.map(item=><option value={item.id} key={item.id}>{item.name}</option>)}</select><ChevronDown size={15}/></div><button className="icon-button topbar-refresh" aria-label="Refresh data" title="Refresh data" disabled={loading} onClick={()=>void refresh()}><RefreshCw size={19} className={loading?"spin":""}/></button><div className="topbar-divider"/><select className="language-select" aria-label="Language" value={language} onChange={e=>setLanguage(e.target.value as typeof language)}><option value="en">EN</option><option value="am">አማ</option><option value="om">OM</option></select><div className="user-chip" title={userPhone}><span>{userPhone ? userPhone.slice(-2) : "PS"}</span></div></div></header><main className="page-content">{children}</main><footer className="app-footer"><span>PrimeStock workspace</span><span>{t("Made for stock that moves")}</span></footer></div>
  </div>;
}

"use client";

import { LoaderCircle, RotateCw } from "lucide-react";
import { useWorkspace } from "@/components/workspace-provider";
import { DashboardScreen } from "@/components/screens/dashboard";
import { InventoryScreen } from "@/components/screens/inventory";
import { SalesScreen } from "@/components/screens/sales";
import { ProcurementScreen } from "@/components/screens/procurement";
import { DebtsScreen } from "@/components/screens/debts";
import { ImportsScreen } from "@/components/screens/imports";
import { TransfersScreen } from "@/components/screens/transfers";
import { ReportsScreen } from "@/components/screens/reports";
import { BranchesScreen } from "@/components/screens/branches";
import type { Section } from "@/lib/routes";

export function WorkspaceSection({ section }: { section:Section }) {
  const { workspace, loading, error, refresh } = useWorkspace();
  if (loading) return <div className="loading-state"><LoaderCircle className="spin" size={21}/> Loading your workspace...</div>;
  if (error && !workspace) return <div className="error-state"><h2>Could not load your workspace</h2><p>{error}</p><button className="button primary" onClick={()=>void refresh()}><RotateCw size={16}/> Try again</button></div>;
  if (!workspace) return null;
  return <>{error&&<div className="notice red" role="alert">{error}<button className="text-link" onClick={()=>void refresh()}>Retry</button></div>}{section==="dashboard"?<DashboardScreen/>:section==="inventory"?<InventoryScreen/>:section==="sales"?<SalesScreen/>:section==="procurement"?<ProcurementScreen/>:section==="debts"?<DebtsScreen/>:section==="imports"?<ImportsScreen/>:section==="transfers"?<TransfersScreen/>:section==="reports"?<ReportsScreen/>:<BranchesScreen/>}</>;
}

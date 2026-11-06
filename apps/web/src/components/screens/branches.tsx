"use client";

import { useState } from "react";
import { Building2, Plus } from "lucide-react";
import { useWorkspace } from "@/components/workspace-provider";
import { ActionDialog, required, field } from "@/components/action-dialog";
import { Badge, Empty, FormField, PageHeader, Panel } from "@/components/ui";
import { mutations } from "@/lib/api";

export function BranchesScreen() {
  const { workspace, branchId, selectBranch, run, t }=useWorkspace();
  const [creating,setCreating]=useState(false);
  const branches=workspace!.inventory.branches;
  return <><PageHeader eyebrow="LOCATIONS" title="Your branches" description="Choose the location whose stock and transactions you want to manage." actions={<button className="button primary" onClick={()=>setCreating(true)}><Plus size={16}/> {t("New branch")}</button>}/>
    <Panel title="All locations" hint={`${branches.length} branch${branches.length===1?"":"es"} in this account`}>{branches.length?<div className="branch-grid">{branches.map(branch=><button key={branch.id} className={`branch-card ${branchId===branch.id?"active":""}`} onClick={()=>selectBranch(branch.id)}><div className="branch-card-top"><span className="branch-icon"><Building2 size={21}/></span><Badge tone={branch.status==="Active"?"green":"amber"}>{branchId===branch.id?"Current":branch.status}</Badge></div><h3>{branch.name}</h3><p>{branch.city||"Location not set"}</p><div className="branch-card-footer"><span>{branch.items} products</span><span>{branchId===branch.id?"Selected":"Select branch →"}</span></div></button>)}</div>:<Empty icon={Building2} title="No branches yet" description="Create your first location to begin tracking stock." action={<button className="button primary" onClick={()=>setCreating(true)}>{t("Create branch")}</button>}/>}</Panel>
    {creating&&<ActionDialog title="New branch" subtitle="Create a new stock location for this account." submitLabel="Create branch" onClose={()=>setCreating(false)} onSave={async data=>{const result=await run((c)=>mutations.createBranch(c,required(data,"name","Branch name"),field(data,"city"))); selectBranch(result.id);}}><FormField label="Branch name"><input name="name" placeholder="e.g. Addis Ababa · Bole" required autoFocus/></FormField><FormField label="City"><input name="city" placeholder="e.g. Addis Ababa"/></FormField></ActionDialog>}
  </>;
}

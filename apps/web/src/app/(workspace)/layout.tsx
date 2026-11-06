import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkspaceProvider } from "@/components/workspace-provider";
import { WorkspaceShell } from "@/components/workspace-shell";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");
  return <WorkspaceProvider userPhone={String(data.claims.phone ?? "")}> <WorkspaceShell>{children}</WorkspaceShell> </WorkspaceProvider>;
}

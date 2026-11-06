import { notFound } from "next/navigation";
import { WorkspaceSection } from "@/components/sections";
import { sections } from "@/lib/routes";

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.includes(section as (typeof sections)[number])) notFound();
  return <WorkspaceSection section={section as (typeof sections)[number]} />;
}

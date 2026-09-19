import { notFound } from "next/navigation";
import { AdminWorkspace } from "@/features/admin/AdminWorkspace";
import { isAdminView } from "@/features/admin/messages";
export default async function AdminViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ view: string }>;
  searchParams: Promise<{ dataset?: string }>;
}) {
  const [{ view }, { dataset }] = await Promise.all([params, searchParams]);
  if (!isAdminView(view)) notFound();
  return (
    <AdminWorkspace
      view={view}
      dataset={typeof dataset === "string" ? dataset : undefined}
    />
  );
}

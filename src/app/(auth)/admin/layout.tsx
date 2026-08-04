import { requireAdmin } from "@/lib/require-admin";
import { AdminNavbar } from "./components/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-neutral-50 md:flex-row flex-col">
      <AdminNavbar userName={session.user.name} />
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
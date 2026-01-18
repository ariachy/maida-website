import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Validate session server-side
  const session = await validateSession();

  // If not authenticated and not on login page, redirect to login
  // Note: The login page (admin/page.tsx) doesn't use this layout
  if (!session.success) {
    redirect('/admin');
  }

  return (
    <div className="flex min-h-screen bg-[#F5F1EB]">
      <AdminSidebar userName={session.user?.name || session.user?.email} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

import { getServerSession } from "next-auth/next";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminSignIn } from "@/components/AdminSignIn";
import { authOptions } from "@/lib/auth";
import { loadEventsForAdmin } from "@/lib/adminEvents";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <main className="min-h-screen bg-gray-50 py-16">
        <AdminSignIn />
      </main>
    );
  }

  const events = await loadEventsForAdmin();

  return (
    <main className="min-h-screen bg-gray-50">
      <AdminDashboard events={events} />
    </main>
  );
}

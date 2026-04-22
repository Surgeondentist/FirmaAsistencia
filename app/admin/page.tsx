import { getServerSession } from "next-auth/next";
import { AdminConfigMessage } from "@/components/AdminConfigMessage";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminSignIn } from "@/components/AdminSignIn";
import { authOptions } from "@/lib/auth";
import { loadEventsForAdmin } from "@/lib/adminEvents";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch {
    return <AdminConfigMessage reason="session" />;
  }

  if (!session?.user?.email) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4 py-16">
        <AdminSignIn />
      </main>
    );
  }

  let events;
  try {
    events = await loadEventsForAdmin();
  } catch {
    return <AdminConfigMessage reason="kv" />;
  }

  return (
    <main className="min-h-dvh px-4 py-10 sm:py-12">
      <AdminDashboard events={events} />
    </main>
  );
}

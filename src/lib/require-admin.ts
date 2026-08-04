import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth"; // your existing Better Auth instance

/**
 * Call at the top of any admin server component / server action.
 * Redirects to /login if there's no session, and to / if the
 * user isn't an admin.
 */
export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return session;
}
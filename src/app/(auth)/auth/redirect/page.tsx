import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Google OAuth redirects here after sign-in since we can't check the
// user's role until the round trip completes. This page just resolves
// the session and forwards to the right place.
export default async function AuthRedirect() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;
  redirect(role === "admin" ? "/admin" : "/shop");
}
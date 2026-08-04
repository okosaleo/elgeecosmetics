import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireUser(redirectTo: string = "/checkout") {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  return session;
}
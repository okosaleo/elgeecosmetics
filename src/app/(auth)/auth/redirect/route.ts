import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Google OAuth redirects here after sign-in since we can't check the
// user's role until the round trip completes. This route resolves
// the session and forwards to the right place.
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });

  const url = new URL(request.url);

  if (!session) {
    return NextResponse.redirect(new URL("/login", url.origin));
  }

  const role = (session.user as { role?: string }).role;
  return NextResponse.redirect(
    new URL(role === "admin" ? "/admin" : "/shop", url.origin)
  );
}
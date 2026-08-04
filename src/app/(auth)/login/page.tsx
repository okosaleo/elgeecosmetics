import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    redirect(role === "admin" ? "/admin" : "/shop");
  }

  return <LoginForm />;
}
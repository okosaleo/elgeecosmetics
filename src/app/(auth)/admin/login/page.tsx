"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthNav from "../../components/auth-nav";
import { authClient } from "@/lib/auth-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await authClient.signIn.email({ email, password });

    if (error) {
      setLoading(false);
      setError(error.message ?? "Couldn't find that account.");
      return;
    }

    const role = (data?.user as { role?: string } | undefined)?.role;

    if (role !== "admin") {
      await authClient.signOut();
      setLoading(false);
      setError("This account doesn't have admin access.");
      return;
    }

    router.push("/admin");
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-black px-6">
      <AuthNav />

      <div className="w-full max-w-sm">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-lime-300">
          Admin access
        </p>
        <h1 className="mb-2 text-3xl font-normal uppercase leading-none tracking-tight text-neutral-50 sm:text-4xl">
          Control room
        </h1>
        <p className="mb-8 text-sm text-neutral-400">
          Restricted to Elgeecosmetics staff.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@elgeecosmetics.com"
              className="w-full border-b border-neutral-700 bg-transparent pb-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-lime-300"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
              Password
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border-b border-neutral-700 bg-transparent pb-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-lime-300"
            />
          </label>

          {error && (
            <p className="text-xs uppercase tracking-wide text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-lime-300 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Enter control room"}
          </button>
        </form>
      </div>
    </div>
  );
}
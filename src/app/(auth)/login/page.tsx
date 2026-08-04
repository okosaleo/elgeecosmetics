"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AuthNav from "../components/auth-nav";
import { authClient } from "@/lib/auth-client";


const RITUAL_IMAGE =
  "https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW651OhVg2DYVnhgeRlboH1ZO8kA5aF94vpqQ7m"; // placeholder — swap for real editorial shot

const GOOGLE_LOGO =
  "https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6U2jKrpy6j2NdYey1T6aLDBvsglQop9KiOIGn";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isSignup = mode === "signup";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isSignup) {
      const { data, error } = await authClient.signUp.email({
        name,
        email,
        password,
      });
      setLoading(false);
      if (error) {
        setError(error.message ?? "Something went wrong. Try again.");
        return;
      }
      // public sign-up always yields a standard user — admins are
      // provisioned separately, never through this form
      router.push("/shop");
      return;
    }

    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Couldn't find that account. Try again.");
      return;
    }
    const role = (data?.user as { role?: string } | undefined)?.role;
    router.push(role === "admin" ? "/admin" : "/shop");
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    await authClient.signIn.social({
      provider: "google",
      // a small server page reads the resulting session and routes
      // by role, since we can't check role before the OAuth redirect
      callbackURL: "/auth/redirect",
    });
  };

  return (
    <div className="relative grid min-h-screen w-full grid-cols-1 bg-black lg:grid-cols-2">
      <AuthNav />

      {/* Left — editorial image with rotated wordmark strip */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src={RITUAL_IMAGE}
          alt="Elgeecosmetics ritual"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40" />

        {/* rotated label strip along the edge */}
        <div className="absolute left-6 top-0 flex h-full items-center">
          <span
            className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.5em] text-lime-300/80"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Elgeecosmetics — Est. Ritual — No. 07 Edition —
          </span>
        </div>

        <div className="absolute bottom-10 left-16 right-10">
          <div className="mb-4 border-t border-dotted border-neutral-100/40" />
          <p className="max-w-sm text-sm leading-relaxed text-neutral-200">
            Formulated for skin that refuses to be ordinary. Every login is a
            return to the ritual.
          </p>
        </div>
      </div>

      {/* Right — auth panel */}
      <div className="flex items-center justify-center px-6 py-24 sm:px-10">
        <div className="w-full max-w-sm">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-lime-300">
            Access Elgeecosmetics
          </p>

          {/* Toggle */}
          <div className="relative mb-8 flex border-b border-dotted border-neutral-700">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 pb-3 text-left text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                mode === "login" ? "text-neutral-50" : "text-neutral-500"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 pb-3 text-right text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                mode === "signup" ? "text-neutral-50" : "text-neutral-500"
              }`}
            >
              Join the ritual
            </button>
            <span
              className="absolute -bottom-[1px] h-[2px] w-1/2 bg-lime-300 transition-transform duration-300 ease-out"
              style={{
                transform: mode === "signup" ? "translateX(100%)" : "translateX(0%)",
              }}
            />
          </div>

          <h1 className="mb-2 text-3xl font-normal uppercase leading-none tracking-tight text-neutral-50 sm:text-4xl">
            {isSignup ? "Begin the ritual" : "Welcome back"}
          </h1>
          <p className="mb-8 text-sm text-neutral-400">
            {isSignup
              ? "Create an account to save your routine and track orders."
              : "Sign in to pick up your routine where you left off."}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {isSignup && (
              <Field label="Full name">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full border-b border-neutral-700 bg-transparent pb-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-lime-300"
                />
              </Field>
            )}

            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full border-b border-neutral-700 bg-transparent pb-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-lime-300"
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border-b border-neutral-700 bg-transparent pb-2 text-sm text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-lime-300"
              />
            </Field>

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
              {loading
                ? "Please wait..."
                : isSignup
                ? "Create account"
                : "Log in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 border-t border-dotted border-neutral-700" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
              Or
            </span>
            <div className="h-px flex-1 border-t border-dotted border-neutral-700" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-3 border border-neutral-700 py-3 text-xs font-medium uppercase tracking-[0.2em] text-neutral-100 transition-colors hover:border-lime-300 disabled:opacity-50"
          >
            <Image src={GOOGLE_LOGO} alt="" width={16} height={16} />
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          <p className="mt-8 text-center text-xs text-neutral-500">
            {isSignup ? "Already initiated? " : "New here? "}
            <button
              type="button"
              onClick={() => setMode(isSignup ? "login" : "signup")}
              className="text-neutral-100 underline underline-offset-4 hover:text-lime-300"
            >
              {isSignup ? "Log in" : "Join the ritual"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}
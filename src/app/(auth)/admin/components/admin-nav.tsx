"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { adminNavItems } from "./admin-nav-items";
import { authClient } from "@/lib/auth-client"; // your Better Auth client
import {  Logout03Icon, Menu02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {adminNavItems.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            )}
          >
            <HugeiconsIcon icon={item.icon} className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminNavbar({ userName }: { userName?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-neutral-200 md:bg-white md:px-4 md:py-6">
        <Link href="/admin" className="mb-6 px-3 text-lg font-semibold tracking-tight">
          ELGEE <span className="text-neutral-400">Admin</span>
        </Link>
        <NavLinks />
        <div className="mt-auto pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-neutral-600"
            onClick={() => authClient.signOut()}
          >
            <HugeiconsIcon icon={Logout03Icon} />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
        <Link href="/admin" className="text-lg font-semibold tracking-tight">
          ELGEE <span className="text-neutral-400">Admin</span>
        </Link>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" />}>
  <HugeiconsIcon icon={Menu02Icon} />
</SheetTrigger>
          <SheetContent side="left" className="w-72 px-4 py-6">
            <SheetTitle className="mb-6 px-3 text-left text-lg font-semibold">
              ELGEE <span className="text-neutral-400">Admin</span>
            </SheetTitle>
            <NavLinks onNavigate={() => setOpen(false)} />
            <div className="mt-6 border-t border-neutral-200 pt-4">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-neutral-600"
                onClick={() => authClient.signOut()}
              >
                <HugeiconsIcon icon={Logout03Icon} />
                Sign out
              </Button>
              {userName && (
                <p className="mt-3 px-3 text-xs text-neutral-400">
                  Signed in as {userName}
                </p>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
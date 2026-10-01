"use client";

import { LogOut } from "lucide-react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router =
    useRouter();

  async function signOut() {
    const supabase =
      createClient();

    if (supabase) {
      await supabase.auth.signOut();
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white"
    >
      <LogOut size={18} />
      Salir
    </button>
  );
}
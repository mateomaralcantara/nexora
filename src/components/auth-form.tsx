"use client";

import {
  type FormEvent,
  useState,
} from "react";

import {
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const router = useRouter();

  const [mode, setMode] =
    useState<"login" | "signup">(
      "login",
    );

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const supabase =
      createClient();

    if (!supabase) {
      setMessage(
        "Configura Supabase en .env.local.",
      );

      setLoading(false);

      return;
    }

    const form =
      new FormData(event.currentTarget);

    const email =
      String(
        form.get("email") ?? "",
      );

    const password =
      String(
        form.get("password") ?? "",
      );

    const companyName =
      String(
        form.get("company_name") ?? "",
      );

    const fullName =
      String(
        form.get("full_name") ?? "",
      );

    try {
      if (mode === "signup") {
        const {
          error,
        } =
          await supabase.auth.signUp({
            email,
            password,

            options: {
              data: {
                company_name:
                  companyName ||
                  "Mi Inmobiliaria",

                full_name:
                  fullName,
              },

              emailRedirectTo:
                `${window.location.origin}/auth/callback`,
            },
          });

        if (error) {
          throw error;
        }

        setMessage(
          "Cuenta creada. Revisa tu correo si la confirmación está habilitada.",
        );

        return;
      }

      const {
        error,
      } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        throw error;
      }

      router.replace(
        "/dashboard",
      );

      router.refresh();

    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "No fue posible autenticar.",
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
      <div className="mb-7 grid h-14 w-14 place-items-center rounded-2xl bg-cyan-400 text-slate-950">
        <LockKeyhole size={25} />
      </div>

      <h1 className="text-3xl font-black text-white">
        {mode === "login"
          ? "Acceso Nexora"
          : "Crear inmobiliaria"}
      </h1>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        CRM, propiedades, leads y
        operaciones en una sola
        plataforma.
      </p>

      <form
        onSubmit={submit}
        className="mt-7 space-y-4"
      >
        {mode === "signup" && (
          <>
            <input
              name="company_name"
              required
              placeholder="Nombre de la inmobiliaria"
              className="h-13 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-white outline-none focus:border-cyan-400"
            />

            <input
              name="full_name"
              required
              placeholder="Tu nombre"
              className="h-13 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-white outline-none focus:border-cyan-400"
            />
          </>
        )}

        <input
          name="email"
          type="email"
          required
          placeholder="Correo"
          className="h-13 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-white outline-none focus:border-cyan-400"
        />

        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Contraseña"
          className="h-13 w-full rounded-xl border border-white/10 bg-slate-950 px-4 text-white outline-none focus:border-cyan-400"
        />

        {message && (
          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-sm text-cyan-100">
            {message}
          </div>
        )}

        <button
          disabled={loading}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 font-black text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
        >
          {loading && (
            <LoaderCircle
              className="animate-spin"
              size={18}
            />
          )}

          {mode === "login"
            ? "Entrar"
            : "Crear cuenta"}
        </button>
      </form>

      <button
        onClick={() => {
          setMessage("");

          setMode(
            mode === "login"
              ? "signup"
              : "login",
          );
        }}
        className="mt-6 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
      >
        {mode === "login"
          ? "¿No tienes cuenta? Crear inmobiliaria"
          : "Ya tengo cuenta"}
      </button>
    </div>
  );
}
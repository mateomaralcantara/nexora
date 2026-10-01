import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  PropertyEditorForm,
} from "@/components/property-editor-form";

import {
  requireUser,
} from "@/lib/auth";

import type {
  Property,
} from "@/lib/types";

export default async function Page({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const {
    id,
  } = await params;

  const {
    supabase,
  } =
    await requireUser();

  const {
    data,
    error,
  } =
    await supabase
      .from("properties")
      .select(
        "*,property_images(id,url,alt_text,position,property_id)",
      )
      .eq(
        "id",
        id,
      )
      .maybeSingle();

  if (
    error ||
    !data
  ) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/dashboard/properties"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"
      >
        <ArrowLeft size={16} />

        Propiedades
      </Link>

      <h1 className="mt-5 text-4xl font-black">
        Editar propiedad
      </h1>

      <p className="mt-2 text-slate-500">
        Modifica información, fotos, estado y video de la publicación.
      </p>

      <div className="mt-8">
        <PropertyEditorForm
          property={
            data as unknown as Property
          }
        />
      </div>
    </div>
  );
}

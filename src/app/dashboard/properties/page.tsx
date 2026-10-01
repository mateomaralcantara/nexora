import Link from "next/link";

import {
  ExternalLink,
  Pencil,
  Plus,
  Video,
} from "lucide-react";

import {
  requireUser,
} from "@/lib/auth";

import {
  formatCurrency,
} from "@/lib/utils";

const VIDEO_ALT =
  "__NEXORA_VIDEO__";

const statusLabels:
  Record<
    string,
    string
  > = {
    published:
      "Publicada",
    draft:
      "Borrador",
    reserved:
      "Reservada",
    sold:
      "Vendida",
    rented:
      "Alquilada",
    archived:
      "Archivada",
  };

export default async function Page() {
  const {
    supabase,
  } =
    await requireUser();

  const {
    data = [],
  } =
    await supabase
      .from("properties")
      .select(
        "*,property_images(id,url,alt_text,position)",
      )
      .order(
        "created_at",
        {
          ascending:
            false,
        },
      );

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-wider text-cyan-700">
            Inventario
          </p>

          <h1 className="mt-2 text-4xl font-black">
            Propiedades
          </h1>

          <p className="mt-2 text-slate-500">
            Crea nuevas publicaciones y modifica las propiedades existentes.
          </p>
        </div>

        <Link
          href="/dashboard/properties/new"
          className="flex h-12 items-center gap-2 rounded-xl bg-slate-950 px-5 font-black text-white"
        >
          <Plus size={18} />

          Nueva propiedad
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-200 bg-white">

        <table className="w-full min-w-[1050px] text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-4">
                Propiedad
              </th>

              <th className="px-5 py-4">
                Tipo
              </th>

              <th className="px-5 py-4">
                Ciudad
              </th>

              <th className="px-5 py-4">
                Precio
              </th>

              <th className="px-5 py-4">
                Multimedia
              </th>

              <th className="px-5 py-4">
                Estado
              </th>

              <th className="px-5 py-4 text-right">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {data.map(
              (property) => {
                const media =
                  property.property_images ??
                  [];

                const photos =
                  media.filter(
                    (
                      item:
                        {
                          alt_text?:
                            string | null;
                        },
                    ) =>
                      item.alt_text !==
                      VIDEO_ALT,
                  );

                const hasVideo =
                  media.some(
                    (
                      item:
                        {
                          alt_text?:
                            string | null;
                        },
                    ) =>
                      item.alt_text ===
                      VIDEO_ALT,
                  );

                return (
                  <tr
                    key={
                      property.id
                    }
                    className="border-t border-slate-100"
                  >
                    <td className="px-5 py-4">
                      <p className="font-black">
                        {
                          property.title
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {photos.length} foto(s)
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {
                        property.property_type
                      }
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {property.city ||
                        "-"}
                    </td>

                    <td className="px-5 py-4 font-bold">
                      {Number(
                        property.price ||
                          0,
                      ) > 0
                        ? formatCurrency(
                            property.price,
                            property.currency,
                          )
                        : "Precio a consultar"}
                    </td>

                    <td className="px-5 py-4">
                      {hasVideo ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-800">
                          <Video size={14} />

                          Video
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Sin video
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                        {statusLabels[
                          property.status
                        ] ??
                          property.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {property.status ===
                        "published" ? (
                          <Link
                            href={`/properties/${property.slug}`}
                            target="_blank"
                            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:border-cyan-400 hover:text-cyan-700"
                            title="Ver publicación"
                          >
                            <ExternalLink size={17} />
                          </Link>
                        ) : null}

                        <Link
                          href={`/dashboard/properties/${property.id}/edit`}
                          className="flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white"
                        >
                          <Pencil size={16} />

                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>

        {data.length ===
        0 ? (
          <div className="p-10 text-center text-slate-500">
            Crea tu primera propiedad.
          </div>
        ) : null}
      </div>
    </div>
  );
}

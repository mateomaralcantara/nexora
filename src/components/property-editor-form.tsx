"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";

import {
  ImagePlus,
  LoaderCircle,
  Save,
  Trash2,
  Video,
} from "lucide-react";

import { useRouter } from "next/navigation";

import type {
  Property,
  PropertyImage,
} from "@/lib/types";

const VIDEO_ALT =
  "__NEXORA_VIDEO__";

const DOMINICAN_TASK_M2 =
  628.86;

const DOMINICAN_PROVINCES = [
  "Azua",
  "Bahoruco",
  "Barahona",
  "Dajabón",
  "Distrito Nacional",
  "Duarte",
  "Elías Piña",
  "El Seibo",
  "Espaillat",
  "Hato Mayor",
  "Hermanas Mirabal",
  "Independencia",
  "La Altagracia",
  "La Romana",
  "La Vega",
  "María Trinidad Sánchez",
  "Monseñor Nouel",
  "Monte Cristi",
  "Monte Plata",
  "Pedernales",
  "Peravia",
  "Puerto Plata",
  "Samaná",
  "San Cristóbal",
  "San José de Ocoa",
  "San Juan",
  "San Pedro de Macorís",
  "Sánchez Ramírez",
  "Santiago",
  "Santiago Rodríguez",
  "Santo Domingo",
  "Valverde",
] as const;

const PROPERTY_TYPES = [
  "Apartamento",
  "Apartamento en construcción",
  "Apartamento en preventa",
  "Casa",
  "Villa",
  "Penthouse",
  "Solar",
  "Terreno",
  "Terreno agrícola",
  "Terreno ganadero",
  "Finca",
  "Finca ganadera",
  "Local Comercial",
  "Oficina",
  "Nave industrial",
] as const;

const STATUS_OPTIONS = [
  ["published", "Publicada"],
  ["draft", "Borrador"],
  ["reserved", "Reservada"],
  ["sold", "Vendida"],
  ["rented", "Alquilada"],
  ["archived", "Archivada"],
] as const;

type EditableProperty =
  Property & {
    property_images?:
      PropertyImage[];
  };

export function PropertyEditorForm({
  property,
}: {
  property?: EditableProperty;
}) {
  const router =
    useRouter();

  const isEdit =
    Boolean(property?.id);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    images,
    setImages,
  ] = useState<File[]>([]);

  const [
    existingImages,
    setExistingImages,
  ] = useState<
    PropertyImage[]
  >(
    (
      property?.property_images ??
      []
    )
      .filter(
        (image) =>
          image.alt_text !==
          VIDEO_ALT,
      )
      .sort(
        (a, b) =>
          (a.position ?? 0) -
          (b.position ?? 0),
      ),
  );

  const [
    videoUrl,
    setVideoUrl,
  ] = useState(
    (
      property?.property_images ??
      []
    ).find(
      (image) =>
        image.alt_text ===
        VIDEO_ALT,
    )?.url ?? "",
  );

  const input =
    "h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-cyan-500";

  const maxNewImages =
    Math.max(
      0,
      6 -
        existingImages.length,
    );

  function handleImages(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const selected =
      Array.from(
        event.target.files ??
          [],
      );

    if (
      selected.length >
      maxNewImages
    ) {
      setMessage(
        `Puedes agregar hasta ${maxNewImages} foto(s) más. El máximo es 6 por propiedad.`,
      );
    }

    const valid =
      selected
        .slice(
          0,
          maxNewImages,
        )
        .filter(
          (file) =>
            file.type.startsWith(
              "image/",
            ) &&
            file.size <=
              15 *
                1024 *
                1024,
        );

    setImages(valid);
  }

  async function removeImage(
    image:
      PropertyImage,
  ) {
    if (!image.id) {
      return;
    }

    const confirmed =
      window.confirm(
        "¿Eliminar esta foto de la propiedad?",
      );

    if (!confirmed) {
      return;
    }

    setMessage("");

    try {
      const response =
        await fetch(
          `/api/media/${image.id}`,
          {
            method:
              "DELETE",
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No fue posible eliminar la foto.",
        );
      }

      setExistingImages(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              image.id,
          ),
      );

      setMessage(
        "Foto eliminada correctamente.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Error inesperado.",
      );
    }
  }

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const form =
      new FormData(
        event.currentTarget,
      );

    const text = (
      key: string,
    ) =>
      String(
        form.get(key) ?? "",
      ).trim();

    const nullableNumber = (
      key: string,
    ) => {
      const value =
        text(key);

      if (!value) {
        return null;
      }

      const parsed =
        Number(value);

      return Number.isFinite(
        parsed,
      )
        ? parsed
        : null;
    };

    const enteredTareas =
      nullableNumber(
        "land_tareas",
      );

    const enteredLotM2 =
      nullableNumber(
        "lot_m2",
      );

    const landTareas =
      enteredTareas ??
      (
        enteredLotM2
          ? Math.round(
              (
                enteredLotM2 /
                DOMINICAN_TASK_M2
              ) *
                100,
            ) /
            100
          : null
      );

    const lotM2 =
      enteredLotM2 ??
      (
        enteredTareas
          ? Math.round(
              (
                enteredTareas *
                DOMINICAN_TASK_M2
              ) *
                100,
            ) /
            100
          : null
      );

    const payload = {
      title:
        text("title"),

      description:
        text(
          "description",
        ),

      operation:
        text(
          "operation",
        ),

      status:
        text("status"),

      property_type:
        text(
          "property_type",
        ),

      price:
        Number(
          text("price"),
        ),

      currency:
        text(
          "currency",
        ),

      bedrooms:
        nullableNumber(
          "bedrooms",
        ),

      bathrooms:
        nullableNumber(
          "bathrooms",
        ),

      parking_spaces:
        nullableNumber(
          "parking_spaces",
        ),

      area_m2:
        nullableNumber(
          "area_m2",
        ),

      lot_m2:
        lotM2,

      land_tareas:
        landTareas,

      construction_status:
        text(
          "construction_status",
        ),

      expected_delivery_date:
        text(
          "expected_delivery_date",
        ),

      animals_present:
        form.get(
          "animals_present",
        ) === "on",

      animals_description:
        text(
          "animals_description",
        ),

      furnished:
        form.get(
          "furnished",
        ) === "on",

      pool:
        form.get(
          "pool",
        ) === "on",

      featured:
        form.get(
          "featured",
        ) === "on",

      sector:
        text("sector"),

      city:
        text("city"),

      province:
        text(
          "province",
        ),

      country:
        text("country"),

      amenities:
        text(
          "amenities",
        )
          .split(",")
          .map(
            (item) =>
              item.trim(),
          )
          .filter(Boolean),

      video_url:
        videoUrl.trim(),
    };

    try {
      const response =
        await fetch(
          isEdit
            ? `/api/properties/${property?.id}`
            : "/api/properties",
          {
            method:
              isEdit
                ? "PATCH"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload,
              ),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            (
              isEdit
                ? "No fue posible actualizar la propiedad."
                : "No fue posible crear la propiedad."
            ),
        );
      }

      const propertyId =
        String(
          data.property?.id ??
            property?.id ??
            "",
        );

      if (
        propertyId &&
        images.length
      ) {
        const usedPositions =
          new Set(
            existingImages.map(
              (image) =>
                image.position ??
                0,
            ),
          );

        const freePositions =
          [
            0,
            1,
            2,
            3,
            4,
            5,
          ].filter(
            (position) =>
              !usedPositions.has(
                position,
              ),
          );

        for (
          let index = 0;
          index <
          images.length;
          index++
        ) {
          const upload =
            new FormData();

          upload.append(
            "file",
            images[index],
          );

          upload.append(
            "property_id",
            propertyId,
          );

          upload.append(
            "position",
            String(
              freePositions[
                index
              ] ?? index,
            ),
          );

          const imageResponse =
            await fetch(
              "/api/media/upload",
              {
                method:
                  "POST",

                body:
                  upload,
              },
            );

          if (
            !imageResponse.ok
          ) {
            const imageData =
              await imageResponse.json();

            throw new Error(
              imageData.error ||
                `No fue posible cargar la foto ${index + 1}.`,
            );
          }
        }
      }

      setMessage(
        isEdit
          ? "Propiedad actualizada correctamente."
          : "Propiedad creada correctamente.",
      );

      router.push(
        "/dashboard/properties",
      );

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Error inesperado.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
    >
      <div className="grid gap-5 md:grid-cols-2">

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-bold">
            Título
          </span>

          <input
            required
            name="title"
            defaultValue={
              property?.title ??
              ""
            }
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Operación
          </span>

          <select
            name="operation"
            defaultValue={
              property?.operation ??
              "sale"
            }
            className={input}
          >
            <option value="sale">
              Venta
            </option>

            <option value="rent">
              Alquiler
            </option>

            <option value="short_rent">
              Renta corta
            </option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Estado
          </span>

          <select
            name="status"
            defaultValue={
              property?.status ??
              "published"
            }
            className={input}
          >
            {STATUS_OPTIONS.map(
              ([
                value,
                label,
              ]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Tipo de inmueble
          </span>

          <select
            name="property_type"
            defaultValue={
              property?.property_type ??
              "Apartamento"
            }
            className={input}
          >
            {PROPERTY_TYPES.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Estado de construcción
          </span>

          <select
            name="construction_status"
            defaultValue={
              property?.construction_status ??
              "ready"
            }
            className={input}
          >
            <option value="ready">
              Terminada / lista
            </option>

            <option value="under_construction">
              En construcción
            </option>

            <option value="pre_sale">
              Preventa
            </option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Fecha estimada de entrega
          </span>

          <input
            type="date"
            name="expected_delivery_date"
            defaultValue={
              property?.expected_delivery_date ??
              ""
            }
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Precio
          </span>

          <input
            required
            min="0"
            step="0.01"
            type="number"
            name="price"
            defaultValue={
              property?.price ??
              0
            }
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Moneda
          </span>

          <select
            name="currency"
            defaultValue={
              property?.currency ??
              "USD"
            }
            className={input}
          >
            <option>
              USD
            </option>

            <option>
              DOP
            </option>

            <option>
              EUR
            </option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Habitaciones
          </span>

          <input
            min="0"
            step="0.5"
            type="number"
            name="bedrooms"
            defaultValue={
              property?.bedrooms ??
              ""
            }
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Baños
          </span>

          <input
            min="0"
            step="0.5"
            type="number"
            name="bathrooms"
            defaultValue={
              property?.bathrooms ??
              ""
            }
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Parqueos
          </span>

          <input
            min="0"
            type="number"
            name="parking_spaces"
            defaultValue={
              property?.parking_spaces ??
              ""
            }
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Área construida m²
          </span>

          <input
            min="0"
            step="0.01"
            type="number"
            name="area_m2"
            defaultValue={
              property?.area_m2 ??
              ""
            }
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Terreno / solar en m²
          </span>

          <input
            min="0"
            step="0.01"
            type="number"
            name="lot_m2"
            defaultValue={
              property?.lot_m2 ??
              ""
            }
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Terreno en tareas
          </span>

          <input
            min="0"
            step="0.01"
            type="number"
            name="land_tareas"
            defaultValue={
              property?.land_tareas ??
              ""
            }
            className={input}
          />

          <span className="mt-1 block text-xs text-slate-500">
            Si completas solo tareas o solo m², Nexora calcula automáticamente la otra medida.
          </span>
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Sector
          </span>

          <input
            name="sector"
            defaultValue={
              property?.sector ??
              ""
            }
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Ciudad / municipio
          </span>

          <input
            name="city"
            defaultValue={
              property?.city ??
              ""
            }
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Provincia
          </span>

          <select
            name="province"
            required
            defaultValue={
              property?.province ??
              ""
            }
            className={input}
          >
            <option
              value=""
              disabled
            >
              Selecciona una provincia
            </option>

            {DOMINICAN_PROVINCES.map(
              (province) => (
                <option
                  key={province}
                  value={province}
                >
                  {province}
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            País
          </span>

          <input
            name="country"
            defaultValue={
              property?.country ??
              "República Dominicana"
            }
            className={input}
          />
        </label>

        <div className="md:col-span-2 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-3">
          <label className="flex items-center gap-3 font-bold">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={
                property?.featured ??
                false
              }
              className="h-5 w-5"
            />
            Destacada
          </label>

          <label className="flex items-center gap-3 font-bold">
            <input
              type="checkbox"
              name="furnished"
              defaultChecked={
                property?.furnished ??
                false
              }
              className="h-5 w-5"
            />
            Amueblada
          </label>

          <label className="flex items-center gap-3 font-bold">
            <input
              type="checkbox"
              name="pool"
              defaultChecked={
                property?.pool ??
                false
              }
              className="h-5 w-5"
            />
            Piscina
          </label>
        </div>

        <div className="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <label className="flex items-center gap-3 font-bold text-emerald-950">
            <input
              type="checkbox"
              name="animals_present"
              defaultChecked={
                property?.animals_present ??
                false
              }
              className="h-5 w-5"
            />

            Esta finca o terreno tiene animales
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-bold">
              Animales presentes
            </span>

            <input
              name="animals_description"
              defaultValue={
                property?.animals_description ??
                ""
              }
              placeholder="Ej.: 35 vacas, 2 toros, caballos, chivos, gallinas..."
              className={input}
            />
          </label>
        </div>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-bold">
            Amenidades separadas por coma
          </span>

          <input
            name="amenities"
            defaultValue={
              property?.amenities?.join(
                ", ",
              ) ?? ""
            }
            placeholder="Piscina, pozo, río, electricidad, corral..."
            className={input}
          />
        </label>

        <div className="md:col-span-2 rounded-3xl border-2 border-dashed border-cyan-300 bg-cyan-50 p-6">
          <div className="flex items-center gap-3">
            <ImagePlus className="text-cyan-700" />

            <div>
              <p className="font-black text-slate-950">
                Fotos de la propiedad
              </p>

              <p className="text-sm text-slate-600">
                Máximo 6 imágenes y 15 MB por foto. Puedes eliminar o agregar fotos al editar.
              </p>
            </div>
          </div>

          {existingImages.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {existingImages.map(
                (
                  image,
                  index,
                ) => (
                  <div
                    key={
                      image.id ??
                      image.url
                    }
                    className="overflow-hidden rounded-2xl border border-cyan-200 bg-white"
                  >
                    <img
                      src={
                        image.url
                      }
                      alt={`Foto ${index + 1}`}
                      className="aspect-[4/3] w-full object-cover"
                    />

                    <div className="flex items-center justify-between gap-2 p-3">
                      <span className="text-xs font-bold text-slate-600">
                        {index === 0
                          ? "Principal"
                          : `Foto ${index + 1}`}
                      </span>

                      {image.id ? (
                        <button
                          type="button"
                          onClick={() =>
                            removeImage(
                              image,
                            )
                          }
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          aria-label="Eliminar foto"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : null}
                    </div>
                  </div>
                ),
              )}
            </div>
          ) : null}

          {maxNewImages > 0 ? (
            <>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={
                  handleImages
                }
                className="mt-5 block w-full rounded-xl border border-cyan-200 bg-white p-3"
              />

              <p className="mt-3 text-sm font-bold text-cyan-800">
                {existingImages.length + images.length} / 6 fotos
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm font-bold text-cyan-800">
              Ya tienes 6 fotos. Elimina una para agregar otra.
            </p>
          )}

          {images.length > 0 ? (
            <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
              {images.map(
                (
                  file,
                  index,
                ) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="rounded-lg bg-white px-3 py-2"
                  >
                    Nueva foto {index + 1}: {file.name}
                  </div>
                ),
              )}
            </div>
          ) : null}
        </div>

        <div className="md:col-span-2 rounded-3xl border border-violet-200 bg-violet-50 p-6">
          <div className="flex items-start gap-3">
            <Video className="mt-0.5 text-violet-700" />

            <div className="flex-1">
              <p className="font-black text-slate-950">
                Video de la propiedad
                <span className="ml-2 text-xs font-bold text-violet-700">
                  OPCIONAL
                </span>
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Pega un enlace de YouTube, Vimeo o un enlace directo a un video MP4. Si lo dejas vacío, la publicación funciona normalmente sin video.
              </p>

              <input
                type="url"
                value={
                  videoUrl
                }
                onChange={
                  (event) =>
                    setVideoUrl(
                      event.target.value,
                    )
                }
                placeholder="https://youtube.com/watch?v=... o https://.../video.mp4"
                className={`${input} mt-4 bg-white`}
              />

              {videoUrl ? (
                <button
                  type="button"
                  onClick={() =>
                    setVideoUrl(
                      "",
                    )
                  }
                  className="mt-3 text-sm font-bold text-red-600"
                >
                  Quitar video
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-bold">
            Descripción
          </span>

          <textarea
            name="description"
            rows={7}
            defaultValue={
              property?.description ??
              ""
            }
            className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-cyan-500"
          />
        </label>
      </div>

      {message ? (
        <div className="mt-5 rounded-xl bg-slate-100 p-4 text-sm font-medium">
          {message}
        </div>
      ) : null}

      <button
        disabled={loading}
        className="mt-6 flex h-12 items-center gap-2 rounded-xl bg-slate-950 px-6 font-black text-white hover:bg-cyan-600 disabled:opacity-50"
      >
        {loading ? (
          <LoaderCircle
            className="animate-spin"
            size={18}
          />
        ) : (
          <Save size={18} />
        )}

        {isEdit
          ? "Guardar cambios"
          : "Guardar propiedad"}
      </button>
    </form>
  );
}

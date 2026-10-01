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
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

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

const DOMINICAN_TASK_M2 =
  628.86;

export function NewPropertyForm() {
  const router =
    useRouter();

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

  const input =
    "h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-cyan-500";

  function handleImages(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selected =
      Array.from(
        event.target.files ?? [],
      );

    if (
      selected.length > 6
    ) {
      setMessage(
        "Puedes cargar un máximo de 6 fotos por propiedad.",
      );
    }

    const valid =
      selected
        .slice(0, 6)
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

  async function submit(
    event: FormEvent<HTMLFormElement>,
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

    const optionalNumber = (
      key: string,
    ) => {
      const value =
        text(key);

      if (!value) {
        return undefined;
      }

      const parsed =
        Number(value);

      return Number.isFinite(
        parsed,
      )
        ? parsed
        : undefined;
    };

    const enteredTareas =
      optionalNumber(
        "land_tareas",
      );

    const enteredLotM2 =
      optionalNumber(
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
          : undefined
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
          : undefined
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
        optionalNumber(
          "bedrooms",
        ),

      bathrooms:
        optionalNumber(
          "bathrooms",
        ),

      parking_spaces:
        optionalNumber(
          "parking_spaces",
        ),

      area_m2:
        optionalNumber(
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
    };

    try {
      const response =
        await fetch(
          "/api/properties",
          {
            method: "POST",

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
            "No fue posible crear la propiedad.",
        );
      }

      const propertyId =
        String(
          data.property?.id ??
          "",
        );

      if (
        propertyId &&
        images.length
      ) {
        for (
          let position = 0;
          position <
          images.length;
          position++
        ) {
          const upload =
            new FormData();

          upload.append(
            "file",
            images[position],
          );

          upload.append(
            "property_id",
            propertyId,
          );

          upload.append(
            "position",
            String(position),
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
                `No fue posible cargar la foto ${position + 1}.`,
            );
          }
        }
      }

      setMessage(
        `Propiedad creada correctamente con ${images.length} foto(s).`,
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
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Operación
          </span>

          <select
            name="operation"
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
            className={input}
          >
            <option value="published">
              Publicada
            </option>

            <option value="draft">
              Borrador
            </option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Tipo de inmueble
          </span>

          <select
            name="property_type"
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
            defaultValue="ready"
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
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Moneda
          </span>

          <select
            name="currency"
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
            type="number"
            name="bedrooms"
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
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-bold">
            Ciudad / municipio
          </span>

          <input
            name="city"
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
            defaultValue=""
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
            defaultValue="República Dominicana"
            className={input}
          />
        </label>

        <div className="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <label className="flex items-center gap-3 font-bold text-emerald-950">
            <input
              type="checkbox"
              name="animals_present"
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
                Foto principal + 5 fotos adicionales. Máximo 6 imágenes y 15 MB por foto.
              </p>
            </div>
          </div>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImages}
            className="mt-5 block w-full rounded-xl border border-cyan-200 bg-white p-3"
          />

          <p className="mt-3 text-sm font-bold text-cyan-800">
            {images.length} / 6 fotos seleccionadas
          </p>

          {images.length > 0 && (
            <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
              {images.map(
                (file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="rounded-lg bg-white px-3 py-2"
                  >
                    {index === 0
                      ? "Principal: "
                      : `Foto ${index + 1}: `}

                    {file.name}
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-bold">
            Descripción
          </span>

          <textarea
            name="description"
            rows={7}
            className="w-full rounded-xl border border-slate-200 p-4 outline-none focus:border-cyan-500"
          />
        </label>

      </div>

      {message && (
        <div className="mt-5 rounded-xl bg-slate-100 p-4 text-sm font-medium">
          {message}
        </div>
      )}

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

        Guardar propiedad
      </button>
    </form>
  );
}
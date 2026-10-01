import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
) {
  try {
    const auth =
      await requireUser();

    const form =
      await request.formData();

    const file =
      form.get("file");

    const propertyId =
      String(
        form.get("property_id") ??
        "",
      );

    const rawPosition =
      Number(
        form.get("position") ?? 0,
      );

    const position =
      Math.min(
        5,
        Math.max(
          0,
          Number.isFinite(rawPosition)
            ? rawPosition
            : 0,
        ),
      );

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "Archivo requerido",
        },
        {
          status: 400,
        },
      );
    }

    if (
      file.size >
      15 * 1024 * 1024
    ) {
      return NextResponse.json(
        {
          error:
            "Máximo 15 MB por imagen",
        },
        {
          status: 413,
        },
      );
    }

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Solo imágenes",
        },
        {
          status: 400,
        },
      );
    }

    if (propertyId) {
      const {
        data: ownedProperty,
      } = await auth.supabase
        .from("properties")
        .select("id")
        .eq(
          "id",
          propertyId,
        )
        .maybeSingle();

      if (!ownedProperty) {
        return NextResponse.json(
          {
            error:
              "Propiedad no autorizada",
          },
          {
            status: 403,
          },
        );
      }
    }

    const admin =
      createAdminClient();

    if (!admin) {
      return NextResponse.json(
        {
          error:
            "Admin Supabase no configurado",
        },
        {
          status: 503,
        },
      );
    }

    const ext =
      file.name
        .split(".")
        .pop()
        ?.replace(
          /[^a-zA-Z0-9]/g,
          "",
        ) ||
      "jpg";

    const path =
      `${auth.organizationId}/${propertyId || "general"}/${crypto.randomUUID()}.${ext}`;

    const {
      error,
    } = await admin.storage
      .from(
        "property-media",
      )
      .upload(
        path,
        await file.arrayBuffer(),
        {
          contentType:
            file.type,

          upsert: false,
        },
      );

    if (error) {
      throw error;
    }

    const {
      data,
    } = admin.storage
      .from(
        "property-media",
      )
      .getPublicUrl(
        path,
      );

    if (propertyId) {
      const {
        error: imageError,
      } = await admin
        .from(
          "property_images",
        )
        .insert({
          organization_id:
            auth.organizationId,

          property_id:
            propertyId,

          url:
            data.publicUrl,

          position,
        });

      if (imageError) {
        throw imageError;
      }
    }

    return NextResponse.json({
      url:
        data.publicUrl,

      path,

      position,
    });

  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error",
      },
      {
        status: 500,
      },
    );
  }
}
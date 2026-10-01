import {
  NextResponse,
} from "next/server";

import {
  requireUser,
} from "@/lib/auth";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export async function DELETE(
  _request:
    Request,

  {
    params,
  }: {
    params:
      Promise<{
        id:
          string;
      }>;
  },
) {
  try {
    const auth =
      await requireUser();

    const {
      id,
    } =
      await params;

    const {
      data:
        media,
      error:
        mediaError,
    } =
      await auth.supabase
        .from(
          "property_images",
        )
        .select(
          "id,url,property_id,alt_text",
        )
        .eq(
          "id",
          id,
        )
        .maybeSingle();

    if (
      mediaError
    ) {
      throw mediaError;
    }

    if (!media) {
      return NextResponse.json(
        {
          error:
            "Foto no encontrada.",
        },
        {
          status: 404,
        },
      );
    }

    const {
      error:
        deleteError,
    } =
      await auth.supabase
        .from(
          "property_images",
        )
        .delete()
        .eq(
          "id",
          id,
        );

    if (
      deleteError
    ) {
      throw deleteError;
    }

    const marker =
      "/storage/v1/object/public/property-media/";

    if (
      media.url.includes(
        marker,
      )
    ) {
      const admin =
        createAdminClient();

      if (admin) {
        const path =
          decodeURIComponent(
            media.url.split(
              marker,
            )[1] ??
              "",
          );

        if (path) {
          await admin.storage
            .from(
              "property-media",
            )
            .remove([
              path,
            ]);
        }
      }
    }

    return NextResponse.json({
      success:
        true,
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

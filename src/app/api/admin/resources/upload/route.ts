// fixing deployemeny error
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { RESOURCE_BUCKET, resourceStoragePath } from "@/lib/resource-storage";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

const ALLOWED_FILE_TYPES = new Set([
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  // Presentations
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // Spreadsheets
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
]);

function getFileExtension(fileName: string) {
  const parts = fileName.toLowerCase().split(".");

  if (parts.length < 2) {
    return "";
  }

  return parts[parts.length - 1];
}

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 120);
}

async function getAuthenticatedAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      supabase,
      user: null,
      error: NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle();

  if (profileError) {
    console.error(
      "Resource upload profile lookup error:",
      profileError
    );

    return {
      supabase,
      user,
      error: NextResponse.json(
        {
          error:
            "Unable to verify administrator access.",
        },
        { status: 500 }
      ),
    };
  }

  if (!profile || profile.role !== "admin") {
    return {
      supabase,
      user,
      error: NextResponse.json(
        {
          error:
            "Administrator access required.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    supabase,
    user,
    error: null,
  };
}

/**
 * POST /api/admin/resources/upload
 *
 * Uploads an educational resource file to Supabase Storage.
 *
 * FormData:
 *   file: File
 */
export async function POST(request: NextRequest) {
  try {
    const {
      supabase,
      user,
      error: accessError,
    } = await getAuthenticatedAdmin();

    if (accessError || !user) {
      return (
        accessError ??
        NextResponse.json(
          {
            error:
              "Administrator access required.",
          },
          { status: 403 }
        )
      );
    }

    const contentType =
      request.headers.get("content-type") ?? "";

    if (
      !contentType
        .toLowerCase()
        .includes("multipart/form-data")
    ) {
      return NextResponse.json(
        {
          error:
            "Request must use multipart/form-data.",
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "No file was provided.",
        },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          error: "The selected file is empty.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "File is too large. Maximum allowed size is 20 MB.",
        },
        { status: 413 }
      );
    }

    const extension = getFileExtension(
      file.name
    );

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Allowed files: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, JPEG, PNG, WEBP, GIF.",
        },
        { status: 400 }
      );
    }

    if (
      file.type &&
      !ALLOWED_FILE_TYPES.has(file.type)
    ) {
      return NextResponse.json(
        {
          error:
            "The selected file type is not supported.",
        },
        { status: 400 }
      );
    }

    const safeName =
      sanitizeFileName(file.name) ||
      `resource.${extension}`;

    /*
     * Files are placed under the authenticated
     * admin's UUID directory and given a unique
     * timestamp/random prefix.
     *
     * Example:
     *
     * admin-uuid/
     *   1756900000000-a7f21-paper.pdf
     */
    const uniquePrefix =
      `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    const filePath =
      `${user.id}/${uniquePrefix}-${safeName}`;

    const fileBuffer =
      new Uint8Array(await file.arrayBuffer());

    const { error: uploadError } =
      await supabase.storage
        .from("resources")
        .upload(filePath, fileBuffer, {
          contentType:
            file.type ||
            "application/octet-stream",
          cacheControl: "3600",
          upsert: false,
        });

    if (uploadError) {
      console.error(
        "Resource file upload error:",
        uploadError
      );

      return NextResponse.json(
        {
          error:
            "Failed to upload the file.",
        },
        { status: 500 }
      );
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from("resources")
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      /*
       * Clean up the uploaded file if a public URL
       * could not be generated.
       */
      await supabase.storage
        .from("resources")
        .remove([filePath]);

      return NextResponse.json(
        {
          error:
            "File uploaded, but its public URL could not be generated.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          "File uploaded successfully.",
        file: {
          name: file.name,
          path: filePath,
          url: publicUrlData.publicUrl,
          size: file.size,
          type: file.type,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Resource upload unexpected error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while uploading the file.",
      },
      { status: 500 }
    );
  }
}
/*
 * DELETE /api/admin/resources/upload  { url }
 *
 * Removes a file this admin just uploaded when saving the resource that
 * was meant to use it failed. Without this, every failed save (and each
 * retry) left another orphaned copy in storage.
 *
 * Only files in this admin's own upload folder that no resource
 * references can be removed.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { supabase, user, error: accessError } =
      await getAuthenticatedAdmin();

    if (accessError || !user) {
      return (
        accessError ??
        NextResponse.json(
          { error: "Authentication required." },
          { status: 401 }
        )
      );
    }

    const body = await request.json().catch(() => null);
    const url = body && typeof body.url === "string" ? body.url : "";
    const path = resourceStoragePath(url);

    if (!path || !path.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { error: "Invalid file." },
        { status: 400 }
      );
    }

    const { count, error: usageError } = await supabase
      .from("resources")
      .select("id", { count: "exact", head: true })
      .eq("file_url", url);

    if (usageError) {
      console.error("Resource upload cleanup lookup error:", usageError);
      return NextResponse.json(
        { error: "Unable to clean up the file." },
        { status: 500 }
      );
    }

    if ((count ?? 0) > 0) {
      // Still referenced: keep it.
      return NextResponse.json({ removed: false });
    }

    const { error: removeError } = await supabase.storage
      .from(RESOURCE_BUCKET)
      .remove([path]);

    if (removeError) {
      console.error("Resource upload cleanup error:", removeError);
      return NextResponse.json(
        { error: "Unable to clean up the file." },
        { status: 500 }
      );
    }

    return NextResponse.json({ removed: true });
  } catch (error) {
    console.error("Resource upload cleanup unexpected error:", error);
    return NextResponse.json(
      { error: "Unable to clean up the file." },
      { status: 500 }
    );
  }
}

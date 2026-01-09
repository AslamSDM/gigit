import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUploadPresignedUrl, generateFileKey, type UploadFolder } from "@/lib/r2";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES: Record<UploadFolder, string[]> = {
  resumes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  profiles: ["image/jpeg", "image/png", "image/webp"],
  portfolios: ["image/jpeg", "image/png", "image/webp"],
  certifications: ["application/pdf", "image/jpeg", "image/png"],
  licenses: ["application/pdf", "image/jpeg", "image/png"],
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { filename, contentType, folder } = body;

    if (!filename || !contentType || !folder) {
      return NextResponse.json(
        { error: "Missing required fields: filename, contentType, folder" },
        { status: 400 }
      );
    }

    // Validate folder
    if (!ALLOWED_FILE_TYPES[folder as UploadFolder]) {
      return NextResponse.json(
        { error: "Invalid folder" },
        { status: 400 }
      );
    }

    // Validate content type
    const allowedTypes = ALLOWED_FILE_TYPES[folder as UploadFolder];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate unique file key
    const key = generateFileKey(folder as UploadFolder, session.user.id, filename);

    // Get presigned URL
    const { url } = await getUploadPresignedUrl(key, contentType);

    return NextResponse.json({
      uploadUrl: url,
      key,
      publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}

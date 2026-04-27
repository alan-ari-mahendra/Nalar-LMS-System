import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { requireAuth } from "@/lib/auth/guards"
import { UPLOAD_LIMITS, type UploadKind } from "@/lib/upload/constants"

// TODO(phase-real-upload): Replace this stub with real storage integration.
// Options: UploadThing, AWS S3 + presigned PUT, Cloudflare R2, Supabase Storage.
// Real flow: receive multipart upload, stream to bucket, return permanent URL.
// Current behavior: validates size + kind, returns deterministic placeholder URL,
// stores nothing. DB columns (Course.thumbnailUrl, Lesson.videoUrl, Attachment.url)
// will hold these placeholders until swapped.

const ALLOWED_KINDS: UploadKind[] = ["thumbnail", "video", "attachment"]

const MAX_BYTES_BY_KIND: Record<UploadKind, number> = {
  thumbnail: UPLOAD_LIMITS.THUMBNAIL_MAX_BYTES,
  video: UPLOAD_LIMITS.VIDEO_MAX_BYTES,
  attachment: UPLOAD_LIMITS.ATTACHMENT_MAX_BYTES,
}

function isUploadKind(value: unknown): value is UploadKind {
  return typeof value === "string" && (ALLOWED_KINDS as string[]).includes(value)
}

export async function POST(req: Request) {
  await requireAuth()

  const formData = await req.formData()
  const file = formData.get("file")
  const kindRaw = formData.get("kind")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (!isUploadKind(kindRaw)) {
    return NextResponse.json(
      { error: "Invalid kind. Expected: thumbnail | video | attachment" },
      { status: 400 }
    )
  }

  const maxBytes = MAX_BYTES_BY_KIND[kindRaw]
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: `File too large. Max ${maxBytes} bytes for ${kindRaw}` },
      { status: 413 }
    )
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
  const id = randomUUID()
  const url = `https://placeholder.learnify.dev/${kindRaw}/${id}/${safeName}`

  return NextResponse.json({
    success: true,
    url,
    kind: kindRaw,
    filename: safeName,
    size: file.size,
  })
}

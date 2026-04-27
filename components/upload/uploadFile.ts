import type { UploadKind } from "@/lib/upload/constants"

export type UploadResponse =
  | { success: true; url: string; filename: string; size: number; kind: UploadKind }
  | { success: false; error: string }

// TODO(phase-real-upload): Swap with real storage client when integrating UploadThing/S3.
export async function uploadFile(file: File, kind: UploadKind): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("kind", kind)

  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData })
    const data = (await res.json()) as UploadResponse | { error: string }

    if (!res.ok || !("success" in data)) {
      const message = "error" in data ? data.error : "Upload failed"
      return { success: false, error: message }
    }
    return data
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed"
    return { success: false, error: message }
  }
}

export const UPLOAD_LIMITS = {
  THUMBNAIL_MAX_BYTES: 2 * 1024 * 1024,
  VIDEO_MAX_BYTES: 500 * 1024 * 1024,
  ATTACHMENT_MAX_BYTES: 20 * 1024 * 1024,
} as const

export const UPLOAD_ACCEPT = {
  thumbnail: {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  },
  video: {
    "video/mp4": [".mp4"],
    "video/webm": [".webm"],
  },
  attachment: {
    "application/pdf": [".pdf"],
    "application/zip": [".zip"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "text/plain": [".txt"],
    "image/*": [],
    "video/*": [],
  },
} as const

export const FALLBACK_SAMPLE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

export type UploadKind = "thumbnail" | "video" | "attachment"

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

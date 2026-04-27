"use client"

import { useCallback, useEffect, useState } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { UPLOAD_ACCEPT, UPLOAD_LIMITS, formatBytes } from "@/lib/upload/constants"
import { uploadFile } from "./uploadFile"

type Status = "idle" | "uploading" | "processing" | "ready" | "error"

interface VideoUploaderProps {
  value?: string | null
  onChange: (url: string) => void
  disabled?: boolean
}

export function VideoUploader({ value, onChange, disabled }: VideoUploaderProps) {
  const [status, setStatus] = useState<Status>(value ? "ready" : "idle")
  const [progress, setProgress] = useState(0)
  const [filename, setFilename] = useState<string | null>(null)
  const [size, setSize] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status !== "uploading") return
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 12 + 3
        return next >= 95 ? 95 : next
      })
    }, 200)
    return () => clearInterval(interval)
  }, [status])

  const onDrop = useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      setError(null)
      if (rejected.length > 0) {
        setError(rejected[0]?.errors[0]?.message ?? "File rejected")
        setStatus("error")
        return
      }
      const file = accepted[0]
      if (!file) return

      setFilename(file.name)
      setSize(file.size)
      setStatus("uploading")
      setProgress(0)

      const result = await uploadFile(file, "video")

      if (!result.success) {
        setError(result.error)
        setStatus("error")
        return
      }

      setProgress(100)
      setStatus("processing")

      // Simulate transcoding/processing delay
      await new Promise((r) => setTimeout(r, 3000))

      setStatus("ready")
      onChange(result.url)
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: UPLOAD_ACCEPT.video,
    maxSize: UPLOAD_LIMITS.VIDEO_MAX_BYTES,
    multiple: false,
    disabled: disabled || status === "uploading" || status === "processing",
  })

  const isBusy = status === "uploading" || status === "processing"

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`w-full rounded-xl border-2 border-dashed transition-all p-8 text-center ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-outline-variant bg-surface-container hover:border-primary/50"
        } ${disabled || isBusy ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <input {...getInputProps()} />

        {status === "idle" && (
          <div className="space-y-2 text-on-surface-variant">
            <span className="material-symbols-outlined !text-4xl">movie</span>
            <p className="text-sm font-medium">
              {isDragActive ? "Drop video here" : "Drag & drop video, or click to browse"}
            </p>
            <p className="text-xs">
              MP4 or WebM — up to {formatBytes(UPLOAD_LIMITS.VIDEO_MAX_BYTES)}
            </p>
          </div>
        )}

        {(status === "uploading" || status === "processing") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-surface font-medium truncate max-w-[60%]">{filename}</span>
              <span className="text-on-surface-variant text-xs">
                {size !== null ? formatBytes(size) : ""}
              </span>
            </div>
            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${status === "processing" ? 100 : progress}%` }}
              />
            </div>
            <p className="text-xs text-on-surface-variant">
              {status === "uploading" ? `Uploading ${Math.round(progress)}%` : "Processing..."}
            </p>
          </div>
        )}

        {status === "ready" && (
          <div className="space-y-2">
            <span className="material-symbols-outlined text-tertiary !text-4xl">check_circle</span>
            <p className="text-sm font-bold text-on-surface">Video ready</p>
            {filename && (
              <p className="text-xs text-on-surface-variant truncate">
                {filename}
                {size !== null && ` — ${formatBytes(size)}`}
              </p>
            )}
            <p className="text-xs text-primary hover:underline">Click to replace</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-2 text-error">
            <span className="material-symbols-outlined !text-4xl">error</span>
            <p className="text-sm font-bold">Upload failed</p>
            {error && <p className="text-xs">{error}</p>}
            <p className="text-xs text-primary hover:underline">Click to retry</p>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import Image from "next/image"
import { UPLOAD_ACCEPT, UPLOAD_LIMITS, formatBytes } from "@/lib/upload/constants"
import { uploadFile } from "./uploadFile"

interface ThumbnailUploaderProps {
  value?: string | null
  onChange: (url: string) => void
  disabled?: boolean
}

export function ThumbnailUploader({ value, onChange, disabled }: ThumbnailUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const onDrop = useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      setError(null)

      if (rejected.length > 0) {
        setError(rejected[0]?.errors[0]?.message ?? "File rejected")
        return
      }
      const file = accepted[0]
      if (!file) return

      const localPreview = URL.createObjectURL(file)
      setPreview(localPreview)
      setUploading(true)

      const result = await uploadFile(file, "thumbnail")
      setUploading(false)

      if (!result.success) {
        setError(result.error)
        return
      }
      onChange(result.url)
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: UPLOAD_ACCEPT.thumbnail,
    maxSize: UPLOAD_LIMITS.THUMBNAIL_MAX_BYTES,
    multiple: false,
    disabled: disabled || uploading,
  })

  const displayUrl = preview ?? value ?? null

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`relative w-full aspect-video rounded-xl border-2 border-dashed transition-all overflow-hidden ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-outline-variant bg-surface-container hover:border-primary/50"
        } ${disabled || uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <input {...getInputProps()} />

        {displayUrl ? (
          <Image
            src={displayUrl}
            alt="Thumbnail preview"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-on-surface-variant p-6 text-center">
            <span className="material-symbols-outlined !text-4xl">image</span>
            <p className="text-sm font-medium">
              {isDragActive ? "Drop image here" : "Drag & drop image, or click to browse"}
            </p>
            <p className="text-xs">
              JPG, PNG, or WebP — up to {formatBytes(UPLOAD_LIMITS.THUMBNAIL_MAX_BYTES)}
            </p>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-on-primary text-sm font-bold">Uploading...</span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-error text-xs flex items-center gap-1">
          <span className="material-symbols-outlined !text-sm">error</span>
          {error}
        </p>
      )}
    </div>
  )
}

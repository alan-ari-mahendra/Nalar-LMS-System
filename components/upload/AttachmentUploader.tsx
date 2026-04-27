"use client"

import { useCallback, useState } from "react"
import { useDropzone, type FileRejection } from "react-dropzone"
import { UPLOAD_ACCEPT, UPLOAD_LIMITS, formatBytes } from "@/lib/upload/constants"
import { uploadFile } from "./uploadFile"

type AttachmentItem = {
  url: string
  filename: string
  size: number
}

interface AttachmentUploaderProps {
  value: AttachmentItem[]
  onChange: (items: AttachmentItem[]) => void
  disabled?: boolean
}

export function AttachmentUploader({ value, onChange, disabled }: AttachmentUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (accepted: File[], rejected: FileRejection[]) => {
      setError(null)
      if (rejected.length > 0) {
        setError(rejected[0]?.errors[0]?.message ?? "Some files rejected")
      }
      if (accepted.length === 0) return

      setUploading(true)
      const uploaded: AttachmentItem[] = []

      for (const file of accepted) {
        const result = await uploadFile(file, "attachment")
        if (result.success) {
          uploaded.push({ url: result.url, filename: result.filename, size: result.size })
        } else {
          setError(result.error)
        }
      }

      setUploading(false)
      if (uploaded.length > 0) {
        onChange([...value, ...uploaded])
      }
    },
    [onChange, value]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: UPLOAD_ACCEPT.attachment,
    maxSize: UPLOAD_LIMITS.ATTACHMENT_MAX_BYTES,
    multiple: true,
    disabled: disabled || uploading,
  })

  function handleRemove(index: number) {
    const next = value.filter((_, i) => i !== index)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`w-full rounded-xl border-2 border-dashed transition-all p-6 text-center ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-outline-variant bg-surface-container hover:border-primary/50"
        } ${disabled || uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2 text-on-surface-variant">
          <span className="material-symbols-outlined !text-3xl">attach_file</span>
          <p className="text-sm font-medium">
            {uploading
              ? "Uploading..."
              : isDragActive
                ? "Drop files here"
                : "Drag & drop files, or click to browse"}
          </p>
          <p className="text-xs">
            Up to {formatBytes(UPLOAD_LIMITS.ATTACHMENT_MAX_BYTES)} per file
          </p>
        </div>
      </div>

      {error && (
        <p className="text-error text-xs flex items-center gap-1">
          <span className="material-symbols-outlined !text-sm">error</span>
          {error}
        </p>
      )}

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((item, idx) => (
            <li
              key={`${item.url}-${idx}`}
              className="flex items-center gap-3 bg-surface-container border border-outline-variant rounded-lg px-4 py-2"
            >
              <span className="material-symbols-outlined text-on-surface-variant !text-xl">
                description
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-on-surface truncate">{item.filename}</p>
                <p className="text-xs text-on-surface-variant">{formatBytes(item.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                disabled={disabled}
                aria-label="Remove"
                className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined !text-lg">close</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

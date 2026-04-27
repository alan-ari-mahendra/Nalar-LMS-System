"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { BuilderLesson } from "./types"

const TYPE_ICONS: Record<BuilderLesson["type"], string> = {
  VIDEO: "play_circle",
  TEXT: "article",
  QUIZ: "quiz",
  ATTACHMENT: "attach_file",
}

interface SortableLessonProps {
  lesson: BuilderLesson
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  disabled?: boolean
}

export function SortableLesson({
  lesson,
  isActive,
  onSelect,
  onDelete,
  disabled,
}: SortableLessonProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lesson.id,
    disabled,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
        isActive
          ? "border-primary bg-primary/10"
          : "border-outline-variant bg-surface-container-low hover:border-primary/40"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="Drag lesson"
        className="cursor-grab active:cursor-grabbing text-on-surface-variant hover:text-on-surface"
      >
        <span className="material-symbols-outlined !text-lg">drag_indicator</span>
      </button>
      <button
        type="button"
        onClick={onSelect}
        className="flex-1 text-left flex items-center gap-2 min-w-0"
      >
        <span className="material-symbols-outlined !text-base text-on-surface-variant shrink-0">
          {TYPE_ICONS[lesson.type]}
        </span>
        <span className="text-sm text-on-surface truncate">{lesson.title}</span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          if (window.confirm(`Delete lesson "${lesson.title}"?`)) onDelete()
        }}
        aria-label="Delete lesson"
        disabled={disabled}
        className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined !text-base">close</span>
      </button>
    </div>
  )
}

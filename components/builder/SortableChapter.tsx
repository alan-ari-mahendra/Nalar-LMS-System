"use client"

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"
import { SortableLesson } from "./SortableLesson"
import type { BuilderChapter, BuilderLesson, LessonType } from "./types"

interface SortableChapterProps {
  chapter: BuilderChapter
  selectedLessonId: string | null
  onSelectLesson: (lessonId: string) => void
  onAddLesson: (chapterId: string, title: string, type: LessonType) => void
  onDeleteLesson: (lessonId: string) => void
  onDeleteChapter: (chapterId: string) => void
  onReorderLessons: (chapterId: string, orderedIds: string[]) => void
  disabled?: boolean
}

export function SortableChapter({
  chapter,
  selectedLessonId,
  onSelectLesson,
  onAddLesson,
  onDeleteLesson,
  onDeleteChapter,
  onReorderLessons,
  disabled,
}: SortableChapterProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
    disabled,
  })

  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newType, setNewType] = useState<LessonType>("VIDEO")

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleLessonDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const ids = chapter.lessons.map((l) => l.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    const next = arrayMove(ids, oldIndex, newIndex)
    onReorderLessons(chapter.id, next)
  }

  function handleAdd() {
    if (!newTitle.trim()) return
    onAddLesson(chapter.id, newTitle.trim(), newType)
    setNewTitle("")
    setAdding(false)
  }

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const lessonIds = chapter.lessons.map((l: BuilderLesson) => l.id)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden"
    >
      <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-high/50">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag chapter"
          className="cursor-grab active:cursor-grabbing text-on-surface-variant hover:text-on-surface"
        >
          <span className="material-symbols-outlined !text-lg">drag_indicator</span>
        </button>
        <h4 className="font-bold text-sm flex-1 truncate">{chapter.title}</h4>
        <span className="text-xs text-on-surface-variant">
          {chapter.lessons.length} lessons
        </span>
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Delete chapter "${chapter.title}" and all its lessons?`)) {
              onDeleteChapter(chapter.id)
            }
          }}
          disabled={disabled}
          aria-label="Delete chapter"
          className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined !text-lg">delete</span>
        </button>
      </div>

      <div className="p-3 space-y-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
          <SortableContext items={lessonIds} strategy={verticalListSortingStrategy}>
            {chapter.lessons.map((l) => (
              <SortableLesson
                key={l.id}
                lesson={l}
                isActive={l.id === selectedLessonId}
                onSelect={() => onSelectLesson(l.id)}
                onDelete={() => onDeleteLesson(l.id)}
                disabled={disabled}
              />
            ))}
          </SortableContext>
        </DndContext>

        {adding ? (
          <div className="flex items-center gap-2 mt-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Lesson title"
              autoFocus
              className="flex-1 bg-surface-container-low border border-outline-variant rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as LessonType)}
              className="bg-surface-container-low border border-outline-variant rounded-md px-2 py-1.5 text-sm"
            >
              <option value="VIDEO">Video</option>
              <option value="TEXT">Text</option>
              <option value="QUIZ">Quiz</option>
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={disabled}
              className="bg-primary text-on-primary px-3 py-1.5 rounded-md text-sm font-bold disabled:opacity-50"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false)
                setNewTitle("")
              }}
              className="text-on-surface-variant hover:text-on-surface px-2 py-1.5"
            >
              <span className="material-symbols-outlined !text-base">close</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            disabled={disabled}
            className="w-full text-sm text-primary hover:bg-surface-container-high/30 px-3 py-2 rounded-md flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined !text-base">add</span>
            Add lesson
          </button>
        )}
      </div>
    </div>
  )
}

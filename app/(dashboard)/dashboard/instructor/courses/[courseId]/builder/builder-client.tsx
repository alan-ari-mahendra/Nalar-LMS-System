"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
} from "@dnd-kit/sortable"
import {
  createChapter,
  createLesson,
  deleteChapter,
  deleteLesson,
  reorderChapters,
  reorderLessons,
} from "@/lib/actions/course"
import { SortableChapter } from "@/components/builder/SortableChapter"
import { LessonEditor } from "@/components/builder/LessonEditor"
import type { BuilderCourse, LessonType } from "@/components/builder/types"

interface BuilderClientProps {
  course: BuilderCourse
}

export function BuilderClient({ course }: BuilderClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [chapters, setChapters] = useState(course.chapters)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    course.chapters[0]?.lessons[0]?.id ?? null
  )

  const [chapterAdding, setChapterAdding] = useState(false)
  const [chapterTitle, setChapterTitle] = useState("")

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const selectedLesson =
    chapters.flatMap((c) => c.lessons).find((l) => l.id === selectedLessonId) ?? null

  function handleChapterDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const ids = chapters.map((c) => c.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) return
    const next = arrayMove(chapters, oldIndex, newIndex)
    setChapters(next)
    startTransition(async () => {
      const result = await reorderChapters({
        courseId: course.id,
        orderedIds: next.map((c) => c.id),
      })
      if (!result.success) {
        setError(result.error)
        setChapters(chapters)
      }
    })
  }

  function handleLessonReorder(chapterId: string, orderedIds: string[]) {
    const ch = chapters.find((c) => c.id === chapterId)
    if (!ch) return
    const map = new Map(ch.lessons.map((l) => [l.id, l]))
    const nextLessons = orderedIds.map((id) => map.get(id)).filter((l): l is typeof ch.lessons[number] => Boolean(l))
    const optimistic = chapters.map((c) =>
      c.id === chapterId ? { ...c, lessons: nextLessons } : c
    )
    setChapters(optimistic)
    startTransition(async () => {
      const result = await reorderLessons({ chapterId, orderedIds })
      if (!result.success) {
        setError(result.error)
        setChapters(chapters)
      }
    })
  }

  function handleAddChapter() {
    if (!chapterTitle.trim()) return
    setError("")
    startTransition(async () => {
      const result = await createChapter({ courseId: course.id, title: chapterTitle.trim() })
      if (!result.success) {
        setError(result.error)
        return
      }
      setChapterTitle("")
      setChapterAdding(false)
      router.refresh()
    })
  }

  function handleDeleteChapter(chapterId: string) {
    setError("")
    startTransition(async () => {
      const result = await deleteChapter({ chapterId })
      if (!result.success) {
        setError(result.error)
        return
      }
      if (selectedLesson && chapters.find((c) => c.id === chapterId)?.lessons.some((l) => l.id === selectedLesson.id)) {
        setSelectedLessonId(null)
      }
      router.refresh()
    })
  }

  function handleAddLesson(chapterId: string, title: string, type: LessonType) {
    setError("")
    startTransition(async () => {
      const result = await createLesson({ chapterId, title, type })
      if (!result.success) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  function handleDeleteLesson(lessonId: string) {
    setError("")
    startTransition(async () => {
      const result = await deleteLesson({ lessonId })
      if (!result.success) {
        setError(result.error)
        return
      }
      if (selectedLessonId === lessonId) setSelectedLessonId(null)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/dashboard/instructor/courses/${course.id}`}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="min-w-0">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
              Course Builder
            </span>
            <h2 className="text-xl font-extrabold tracking-tight truncate">{course.title}</h2>
          </div>
        </div>
        <Link
          href={`/dashboard/instructor/courses/${course.id}`}
          className="border border-outline-variant bg-surface-container-low text-on-surface px-4 py-2 rounded-lg font-bold text-sm hover:bg-surface-container transition-all whitespace-nowrap"
        >
          Course Settings
        </Link>
      </div>

      {error && (
        <div className="bg-error-container border border-error/30 rounded-lg px-4 py-2 text-on-error-container text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        {/* Curriculum sidebar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">Curriculum</h3>
            <span className="text-xs text-on-surface-variant">{chapters.length} chapters</span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleChapterDragEnd}
          >
            <SortableContext
              items={chapters.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {chapters.map((c) => (
                  <SortableChapter
                    key={c.id}
                    chapter={c}
                    selectedLessonId={selectedLessonId}
                    onSelectLesson={setSelectedLessonId}
                    onAddLesson={handleAddLesson}
                    onDeleteLesson={handleDeleteLesson}
                    onDeleteChapter={handleDeleteChapter}
                    onReorderLessons={handleLessonReorder}
                    disabled={isPending}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {chapterAdding ? (
            <div className="flex items-center gap-2">
              <input
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                placeholder="Chapter title"
                autoFocus
                className="flex-1 bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleAddChapter}
                disabled={isPending}
                className="bg-primary text-on-primary px-3 py-2 rounded-md text-sm font-bold disabled:opacity-50"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setChapterAdding(false)}
                className="text-on-surface-variant hover:text-on-surface px-2 py-2"
              >
                <span className="material-symbols-outlined !text-base">close</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setChapterAdding(true)}
              className="w-full border border-dashed border-outline-variant rounded-xl py-3 text-sm text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined !text-base">add</span>
              Add chapter
            </button>
          )}
        </div>

        {/* Editor pane */}
        <div>
          {selectedLesson ? (
            <LessonEditor lesson={selectedLesson} />
          ) : (
            <div className="bg-surface-container border border-outline-variant rounded-xl p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined !text-5xl opacity-40">edit_note</span>
              <p className="mt-3 text-sm">Select a lesson to edit, or add one to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

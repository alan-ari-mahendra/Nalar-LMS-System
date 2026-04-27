"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  updateCourse,
  createChapter,
  deleteChapter,
  createLesson,
  deleteLesson,
  publishCourse,
  archiveCourse,
} from "@/lib/actions/course"
import { CourseBadge } from "@/components/shared/CourseBadge"
import { ThumbnailUploader } from "@/components/upload/ThumbnailUploader"
import type { CourseStatus } from "@/type"

interface CourseData {
  id: string
  title: string
  description: string
  shortDesc: string
  price: number
  level: string
  status: string
  categoryId: string
  thumbnailUrl: string
  totalLessons: number
  totalDuration: number
  chapters: {
    id: string
    title: string
    description: string | null
    position: number
    lessons: {
      id: string
      title: string
      type: string
      duration: number | null
      position: number
    }[]
  }[]
}

interface CourseEditorProps {
  course: CourseData
  categories: { id: string; name: string }[]
}

export function CourseEditor({ course, categories }: CourseEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnailUrl)
  const [showChapterForm, setShowChapterForm] = useState(false)
  const [chapterTitle, setChapterTitle] = useState("")

  const [addingLessonChapterId, setAddingLessonChapterId] = useState<string | null>(null)
  const [lessonTitle, setLessonTitle] = useState("")
  const [lessonType, setLessonType] = useState<"VIDEO" | "TEXT" | "QUIZ">("VIDEO")

  function handleUpdateCourse(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setMessage("")
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await updateCourse({
        courseId: course.id,
        title: fd.get("title") as string,
        description: fd.get("description") as string,
        shortDesc: fd.get("shortDesc") as string,
        price: Number(fd.get("price") || 0),
        level: fd.get("level") as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
        categoryId: fd.get("categoryId") as string,
        thumbnailUrl,
      })
      if (result.success) {
        setMessage("Course updated!")
        router.refresh()
      } else setError(result.error)
    })
  }

  function handleAddChapter() {
    if (!chapterTitle.trim()) return
    startTransition(async () => {
      const result = await createChapter({ courseId: course.id, title: chapterTitle })
      if (result.success) {
        setChapterTitle("")
        setShowChapterForm(false)
        router.refresh()
      } else setError(result.error)
    })
  }

  function handleDeleteChapter(chapterId: string) {
    startTransition(async () => {
      const result = await deleteChapter({ chapterId })
      if (result.success) router.refresh()
      else setError(result.error)
    })
  }

  function handleAddLesson(chapterId: string) {
    if (!lessonTitle.trim()) return
    startTransition(async () => {
      const result = await createLesson({ chapterId, title: lessonTitle, type: lessonType })
      if (result.success) {
        setLessonTitle("")
        setAddingLessonChapterId(null)
        router.refresh()
      } else setError(result.error)
    })
  }

  function handleDeleteLesson(lessonId: string) {
    startTransition(async () => {
      const result = await deleteLesson({ lessonId })
      if (result.success) router.refresh()
      else setError(result.error)
    })
  }

  function handlePublish() {
    startTransition(async () => {
      const result = await publishCourse({ courseId: course.id })
      if (result.success) router.refresh()
      else setError(result.error)
    })
  }

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveCourse({ courseId: course.id })
      if (result.success) router.refresh()
      else setError(result.error)
    })
  }

  const lessonTypeIcons: Record<string, string> = {
    VIDEO: "play_circle",
    TEXT: "article",
    QUIZ: "quiz",
    ATTACHMENT: "attach_file",
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/instructor/courses" className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h2 className="text-2xl font-extrabold tracking-tight">Edit Course</h2>
          <CourseBadge label={course.status} variant="status" status={course.status as CourseStatus} />
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/instructor/courses/${course.id}/builder`}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined !text-base">build</span>
            Open Builder
          </Link>
          {course.status !== "PUBLISHED" && (
            <button onClick={handlePublish} disabled={isPending}
              className="bg-tertiary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50">
              Publish
            </button>
          )}
          {course.status === "PUBLISHED" && (
            <button onClick={handleArchive} disabled={isPending}
              className="border border-outline-variant bg-surface-container-low text-on-surface px-4 py-2 rounded-lg font-bold text-sm hover:bg-surface-container transition-all disabled:opacity-50">
              Archive
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && <div className="bg-error-container border border-error/30 rounded-lg px-4 py-3 text-on-error-container text-sm">{error}</div>}
      {message && <div className="bg-tertiary-container border border-tertiary/30 rounded-lg px-4 py-3 text-on-tertiary-container text-sm">{message}</div>}

      {/* Course Info Form */}
      <form onSubmit={handleUpdateCourse} className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-5">
        <h3 className="font-bold text-lg">Course Information</h3>

        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-on-surface">Title</label>
          <input id="title" name="title" defaultValue={course.title} required minLength={3}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" />
        </div>

        <div className="space-y-2">
          <label htmlFor="shortDesc" className="text-sm font-medium text-on-surface">Short Description</label>
          <input id="shortDesc" name="shortDesc" defaultValue={course.shortDesc} required
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-on-surface">Description</label>
          <textarea id="description" name="description" defaultValue={course.description} required rows={4}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background resize-none" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium text-on-surface">Price (IDR)</label>
            <input id="price" name="price" type="number" min={0} step={1000} defaultValue={course.price}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" />
          </div>
          <div className="space-y-2">
            <label htmlFor="level" className="text-sm font-medium text-on-surface">Level</label>
            <select id="level" name="level" defaultValue={course.level}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="categoryId" className="text-sm font-medium text-on-surface">Category</label>
            <select id="categoryId" name="categoryId" defaultValue={course.categoryId}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-on-surface">Thumbnail</label>
          <ThumbnailUploader value={thumbnailUrl} onChange={setThumbnailUrl} />
        </div>

        <button type="submit" disabled={isPending}
          className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Chapters & Lessons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Curriculum</h3>
          <div className="text-sm text-on-surface-variant">{course.totalLessons} lessons · {Math.round(course.totalDuration / 60)} min</div>
        </div>

        {course.chapters.map((chapter) => (
          <div key={chapter.id} className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-surface-container-high/50">
              <div>
                <h4 className="font-bold text-sm">{chapter.title}</h4>
                {chapter.description && <p className="text-xs text-on-surface-variant mt-0.5">{chapter.description}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant">{chapter.lessons.length} lessons</span>
                <button onClick={() => handleDeleteChapter(chapter.id)} disabled={isPending}
                  className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-50">
                  <span className="material-symbols-outlined !text-lg">delete</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-outline-variant">
              {chapter.lessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined !text-lg text-on-surface-variant">{lessonTypeIcons[lesson.type] ?? "article"}</span>
                    <span className="text-sm">{lesson.title}</span>
                    <span className="text-[10px] text-on-surface-variant uppercase">{lesson.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {lesson.duration && <span className="text-xs text-on-surface-variant">{Math.round(lesson.duration / 60)}m</span>}
                    <button onClick={() => handleDeleteLesson(lesson.id)} disabled={isPending}
                      className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-50">
                      <span className="material-symbols-outlined !text-base">close</span>
                    </button>
                  </div>
                </div>
              ))}

              {addingLessonChapterId === chapter.id ? (
                <div className="px-5 py-3 flex items-center gap-2">
                  <input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="Lesson title"
                    className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                  <select value={lessonType} onChange={(e) => setLessonType(e.target.value as "VIDEO" | "TEXT" | "QUIZ")}
                    className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface">
                    <option value="VIDEO">Video</option>
                    <option value="TEXT">Text</option>
                    <option value="QUIZ">Quiz</option>
                  </select>
                  <button onClick={() => handleAddLesson(chapter.id)} disabled={isPending}
                    className="bg-primary text-on-primary px-3 py-2 rounded-lg text-sm font-bold disabled:opacity-50">Add</button>
                  <button onClick={() => setAddingLessonChapterId(null)}
                    className="text-on-surface-variant hover:text-on-surface px-2 py-2">
                    <span className="material-symbols-outlined !text-base">close</span>
                  </button>
                </div>
              ) : (
                <button onClick={() => { setAddingLessonChapterId(chapter.id); setLessonTitle("") }}
                  className="w-full px-5 py-3 text-left text-sm text-primary hover:bg-surface-container-high/30 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined !text-base">add</span>
                  Add Lesson
                </button>
              )}
            </div>
          </div>
        ))}

        {showChapterForm ? (
          <div className="flex items-center gap-2">
            <input value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} placeholder="Chapter title"
              className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
            <button onClick={handleAddChapter} disabled={isPending}
              className="bg-primary text-on-primary px-5 py-3 rounded-lg font-bold disabled:opacity-50">Add</button>
            <button onClick={() => setShowChapterForm(false)}
              className="text-on-surface-variant hover:text-on-surface px-3 py-3">Cancel</button>
          </div>
        ) : (
          <button onClick={() => { setShowChapterForm(true); setChapterTitle("") }}
            className="w-full border border-dashed border-outline-variant rounded-xl py-4 text-sm text-on-surface-variant hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined !text-lg">add</span>
            Add Chapter
          </button>
        )}
      </div>
    </div>
  )
}

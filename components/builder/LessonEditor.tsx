"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateLesson } from "@/lib/actions/course"
import { VideoUploader } from "@/components/upload/VideoUploader"
import { RichTextEditor } from "./RichTextEditor"
import { QuizBuilder } from "./QuizBuilder"
import type { BuilderLesson } from "./types"

interface LessonEditorProps {
  lesson: BuilderLesson
}

export function LessonEditor({ lesson }: LessonEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  const [title, setTitle] = useState(lesson.title)
  const [duration, setDuration] = useState<number>(lesson.duration ?? 0)
  const [content, setContent] = useState(lesson.content ?? "")
  const [videoUrl, setVideoUrl] = useState<string | null>(lesson.videoUrl)

  useEffect(() => {
    setTitle(lesson.title)
    setDuration(lesson.duration ?? 0)
    setContent(lesson.content ?? "")
    setVideoUrl(lesson.videoUrl)
    setSaved(false)
    setError("")
  }, [lesson.id, lesson.title, lesson.duration, lesson.content, lesson.videoUrl])

  function handleSave() {
    setError("")
    setSaved(false)
    startTransition(async () => {
      const result = await updateLesson({
        lessonId: lesson.id,
        title,
        duration: duration || undefined,
        content: content || undefined,
        videoUrl: videoUrl || undefined,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      setSaved(true)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
            {lesson.type} Lesson
          </span>
          <h3 className="text-xl font-bold tracking-tight">Edit Lesson</h3>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs text-tertiary">Saved</span>}
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Lesson"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-container border border-error/30 rounded-lg px-4 py-2 text-on-error-container text-sm">
          {error}
        </div>
      )}

      <div className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-on-surface">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-on-surface">Duration (seconds)</label>
          <input
            type="number"
            min={0}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {lesson.type === "VIDEO" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface">Video</label>
            <VideoUploader
              value={videoUrl}
              onChange={(url) => setVideoUrl(url)}
            />
            {videoUrl && (
              <p className="text-xs text-on-surface-variant break-all">URL: {videoUrl}</p>
            )}
          </div>
        )}

        {lesson.type === "TEXT" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-on-surface">Content</label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write the lesson content..."
            />
          </div>
        )}
      </div>

      {lesson.type === "QUIZ" && (
        <div className="bg-surface-container border border-outline-variant rounded-xl p-6">
          <QuizBuilder lessonId={lesson.id} quiz={lesson.quiz} />
        </div>
      )}
    </div>
  )
}

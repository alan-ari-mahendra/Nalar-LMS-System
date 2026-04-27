"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { markLessonComplete } from "@/lib/actions/progress"
import { submitQuizAttempt } from "@/lib/actions/quiz"
import { Avatar } from "@/components/shared/Avatar"
import { ProgressBar } from "@/components/shared/ProgressBar"
import { VideoPlayer } from "@/components/player/VideoPlayer"
import { DiscussionPanel } from "@/components/player/DiscussionPanel"
import { FALLBACK_SAMPLE_VIDEO } from "@/lib/upload/constants"
import { formatDuration } from "@/lib/utils"
import type { CourseDetail, Lesson, LessonProgress } from "@/type"
import type { DiscussionWithReplies } from "@/lib/queries"

type Tab = "overview" | "notes" | "discussion"

interface QuizData {
  id: string
  title: string
  passingScore: number
  questions: {
    id: string
    text: string
    explanation: string | null
    position: number
    options: { id: string; text: string; position: number }[]
  }[]
}

interface VideoPlayerPageProps {
  course: CourseDetail
  lesson: Lesson
  lessonProgress: LessonProgress[]
  quiz?: QuizData | null
  discussions: DiscussionWithReplies[]
  currentUserId: string | null
  isInstructorOrAdmin: boolean
}

export default function VideoPlayerPage({
  course,
  lesson,
  lessonProgress,
  quiz,
  discussions,
  currentUserId,
  isInstructorOrAdmin,
}: VideoPlayerPageProps) {
  const completedLessonIds = lessonProgress.filter((lp) => lp.isCompleted).map((lp) => lp.lessonId)
  const totalLessons = course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)
  const progressPct = Math.round((completedLessonIds.length / totalLessons) * 100)
  const [activeTab, setActiveTab] = useState<Tab>("overview")

  const router = useRouter()
  const [isCompleting, startComplete] = useTransition()
  const isLessonCompleted = lessonProgress.some(
    (lp) => lp.lessonId === lesson.id && lp.isCompleted
  )

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null)
  const [isSubmittingQuiz, startQuizSubmit] = useTransition()

  function handleSubmitQuiz() {
    if (!quiz) return
    const answers = Object.entries(selectedAnswers).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId,
    }))
    startQuizSubmit(async () => {
      const result = await submitQuizAttempt({ quizId: quiz.id, answers })
      if (result.success) {
        setQuizResult({ score: result.score, passed: result.passed })
        router.refresh()
      }
    })
  }

  function handleMarkComplete() {
    startComplete(async () => {
      const result = await markLessonComplete({ lessonId: lesson.id })
      if (result.success) {
        router.refresh()
      }
    })
  }
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedModules, setExpandedModules] = useState<string[]>([
    course.chapters[0]?.id,
    lesson.chapterId,
  ])

  function toggleModule(id: string) {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "notes", label: "Notes" },
    { key: "discussion", label: "Discussion" },
  ]

  // Find current chapter for top bar
  const currentChapter = course.chapters.find((ch) => ch.id === lesson.chapterId)

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ============================================================
          TOP BAR
          ============================================================ */}
      <header className="bg-background border-b border-outline-variant flex justify-between items-center px-4 lg:px-6 h-16 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href={`/courses/${course.slug}`}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </Link>
          <span className="text-lg font-bold text-on-surface leading-tight truncate max-w-[200px] lg:max-w-none">
            {course.title}
          </span>
        </div>

        {/* Module/lesson pill — desktop only */}
        <div className="hidden lg:flex items-center bg-surface-container-high px-4 py-1.5 rounded-full border border-outline-variant">
          <span className="text-sm font-medium text-on-surface-variant">
            {currentChapter?.title} — <span className="text-on-surface">{lesson.title}</span>
          </span>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          {/* Progress — desktop */}
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider">Course Progress</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-on-surface">
                {completedLessonIds.length} / {totalLessons} lessons ({progressPct}%)
              </span>
              <div className="w-24">
                <ProgressBar value={progressPct} size="sm" />
              </div>
            </div>
          </div>

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      {/* ============================================================
          MAIN CONTENT
          ============================================================ */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* Video + Content area */}
        <section className="flex-1 flex flex-col overflow-y-auto">
          {lesson.type === "QUIZ" && quiz ? (
                <div className="flex-1 overflow-y-auto p-8">
                  <div className="max-w-2xl mx-auto space-y-6">
                    <h2 className="text-2xl font-bold">{quiz.title}</h2>
                    <p className="text-sm text-on-surface-variant">Passing score: {quiz.passingScore}%</p>

                    {quizResult ? (
                      <div className={`p-6 rounded-xl border ${quizResult.passed ? "bg-tertiary-container/20 border-tertiary/30" : "bg-error-container border-error/30"}`}>
                        <h3 className="text-xl font-bold mb-2">{quizResult.passed ? "Passed!" : "Not Passed"}</h3>
                        <p className="text-lg">Score: {quizResult.score}%</p>
                        {!quizResult.passed && (
                          <button onClick={() => { setQuizResult(null); setSelectedAnswers({}) }}
                            className="mt-4 bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm">
                            Try Again
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {quiz.questions.map((q, qi) => (
                          <div key={q.id} className="bg-surface-container border border-outline-variant rounded-xl p-5 space-y-3">
                            <h4 className="font-bold">{qi + 1}. {q.text}</h4>
                            <div className="space-y-2">
                              {q.options.map((opt) => (
                                <label key={opt.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                  selectedAnswers[q.id] === opt.id ? "border-primary bg-primary/10" : "border-outline-variant hover:border-primary/50"
                                }`}>
                                  <input type="radio" name={q.id} value={opt.id} checked={selectedAnswers[q.id] === opt.id}
                                    onChange={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                                    className="accent-primary" />
                                  <span className="text-sm">{opt.text}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                        <button onClick={handleSubmitQuiz}
                          disabled={isSubmittingQuiz || Object.keys(selectedAnswers).length < quiz.questions.length}
                          className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                          {isSubmittingQuiz ? "Submitting..." : "Submit Quiz"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
          <>
          {/* Video player */}
          <div className="shrink-0">
            <VideoPlayer
              src={lesson.videoUrl ?? FALLBACK_SAMPLE_VIDEO}
              poster={course.thumbnailUrl}
              lessonId={lesson.id}
              initialWatchedSeconds={
                lessonProgress.find((lp) => lp.lessonId === lesson.id)?.watchedSeconds ?? 0
              }
              alreadyComplete={isLessonCompleted}
              onComplete={() => router.refresh()}
            />
          </div>

          {/* Content details */}
          <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-on-surface tracking-tight mb-2">
                  {lesson.title}
                </h1>
                <p className="text-on-surface-variant">
                  {lesson.description}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={handleMarkComplete}
                  disabled={isCompleting || isLessonCompleted}
                  className={`px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all ${
                    isLessonCompleted
                      ? "bg-tertiary text-on-primary cursor-default"
                      : "bg-primary text-on-primary hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  <span className="material-symbols-outlined !text-sm">check_circle</span>
                  {isCompleting ? "Completing..." : isLessonCompleted ? "Completed" : "Mark as Complete"}
                </button>
                <button className="text-primary font-medium hover:underline flex items-center gap-1.5">
                  <span className="material-symbols-outlined !text-sm">download</span>
                  Resources
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-outline-variant flex gap-8 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-4 font-medium transition-colors ${
                    activeTab === tab.key
                      ? "text-primary border-b-2 border-primary font-bold"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-surface-container rounded-xl p-6 border border-outline-variant">
                    <h3 className="text-lg font-bold mb-4">Lesson Summary</h3>
                    <p className="text-on-surface-variant leading-relaxed">
                      {lesson.content}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="bg-surface-container-high rounded-xl p-6 border border-outline-variant">
                    <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest mb-4">Instructor</h3>
                    <div className="flex items-center gap-4">
                      <Avatar src={course.instructor.avatarUrl} name={course.instructor.fullName} size="md" />
                      <div>
                        <p className="font-bold text-on-surface">{course.instructor.fullName}</p>
                        <p className="text-xs text-on-surface-variant">{course.instructor.headline}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-4">
                <textarea
                  className="w-full h-48 bg-surface-container border border-outline-variant rounded-xl p-4 text-on-surface placeholder:text-outline resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Write your notes for this lesson..."
                />
                <button className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold hover:brightness-110 transition-all">
                  Save Notes
                </button>
              </div>
            )}

            {activeTab === "discussion" && (
              currentUserId ? (
                <DiscussionPanel
                  lessonId={lesson.id}
                  currentUserId={currentUserId}
                  isInstructorOrAdmin={isInstructorOrAdmin}
                  discussions={discussions}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
                  <span className="material-symbols-outlined !text-5xl mb-4 opacity-40">forum</span>
                  <p className="text-sm">Sign in to participate in discussions.</p>
                </div>
              )
            )}

            {/* Bottom spacing for player bar */}
            <div className="h-32" />
          </div>
          </>
          )}
        </section>

        {/* ============================================================
            CURRICULUM SIDEBAR — Desktop
            ============================================================ */}
        <aside className="hidden lg:flex flex-col w-80 bg-surface border-l border-outline-variant shrink-0 h-full">
          <div className="p-6 border-b border-outline-variant">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface">layers</span>
              </div>
              <div>
                <h2 className="text-on-surface font-semibold">Course Content</h2>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                  {course.chapters.length} Modules &bull; {totalLessons} Lessons
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {course.chapters.map((chapter) => {
              const isOpen = expandedModules.includes(chapter.id)

              return (
                <div key={chapter.id} className="border-b border-outline-variant">
                  <button
                    onClick={() => toggleModule(chapter.id)}
                    className={`w-full px-6 py-4 flex items-center justify-between font-bold text-sm ${
                      chapter.id === lesson.chapterId ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    <span>{chapter.title}</span>
                    <span className="material-symbols-outlined !text-sm">
                      {isOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="bg-surface-container">
                      {chapter.lessons.map((l) => {
                        const isActive = l.id === lesson.id
                        const isCompleted = completedLessonIds.includes(l.id)

                        return (
                          <div
                            key={l.id}
                            className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition-all ${
                              isActive
                                ? "text-on-surface font-bold border-l-2 border-primary pl-4 bg-surface-container-high"
                                : "text-on-surface-variant hover:bg-secondary-container"
                            }`}
                          >
                            <span className={`material-symbols-outlined !text-lg ${
                              isActive
                                ? "text-primary"
                                : isCompleted
                                  ? "text-tertiary"
                                  : "text-outline"
                            }`}>
                              {isActive
                                ? "play_circle"
                                : isCompleted
                                  ? "check_circle"
                                  : "lock"}
                            </span>
                            <span className="flex-1 text-sm">{l.title}</span>
                            {l.duration && (
                              <span className="text-xs text-on-surface-variant">{formatDuration(l.duration)}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </aside>

        {/* ============================================================
            CURRICULUM SIDEBAR — Mobile overlay
            ============================================================ */}
        {sidebarOpen && (
          <div className="lg:hidden absolute inset-0 z-40 flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Panel */}
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-surface border-l border-outline-variant flex flex-col z-50">
              <div className="p-4 border-b border-outline-variant flex items-center justify-between">
                <h2 className="font-bold text-on-surface">Course Content</h2>
                <button onClick={() => setSidebarOpen(false)} className="p-1 text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {course.chapters.map((chapter) => {
                  const isOpen = expandedModules.includes(chapter.id)

                  return (
                    <div key={chapter.id} className="border-b border-outline-variant">
                      <button
                        onClick={() => toggleModule(chapter.id)}
                        className={`w-full px-4 py-3 flex items-center justify-between font-bold text-sm ${
                          chapter.id === lesson.chapterId ? "text-primary" : "text-on-surface"
                        }`}
                      >
                        <span>{chapter.title}</span>
                        <span className="material-symbols-outlined !text-sm">
                          {isOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="bg-surface-container">
                          {chapter.lessons.map((l) => {
                            const isActive = l.id === lesson.id
                            const isCompleted = completedLessonIds.includes(l.id)

                            return (
                              <div
                                key={l.id}
                                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all text-sm ${
                                  isActive
                                    ? "text-on-surface font-bold border-l-2 border-primary pl-3 bg-surface-container-high"
                                    : "text-on-surface-variant hover:bg-secondary-container"
                                }`}
                              >
                                <span className={`material-symbols-outlined !text-lg ${
                                  isActive ? "text-primary" : isCompleted ? "text-tertiary" : "text-outline"
                                }`}>
                                  {isActive ? "play_circle" : isCompleted ? "check_circle" : "lock"}
                                </span>
                                <span className="flex-1">{l.title}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  )
}

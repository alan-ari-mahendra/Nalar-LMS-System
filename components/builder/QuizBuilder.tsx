"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  upsertQuiz,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "@/lib/actions/quiz"
import type { BuilderQuiz, BuilderQuestion } from "./types"

interface QuizBuilderProps {
  lessonId: string
  quiz: BuilderQuiz | null
}

type DraftOption = { text: string; isCorrect: boolean }

function emptyDraft(): { text: string; explanation: string; points: number; options: DraftOption[] } {
  return {
    text: "",
    explanation: "",
    points: 1,
    options: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
    ],
  }
}

export function QuizBuilder({ lessonId, quiz }: QuizBuilderProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState(emptyDraft())
  const [adding, setAdding] = useState(false)

  const [title, setTitle] = useState(quiz?.title ?? "Quiz")
  const [passingScore, setPassingScore] = useState(quiz?.passingScore ?? 70)

  function handleSaveQuizMeta() {
    setError("")
    startTransition(async () => {
      const result = await upsertQuiz({
        lessonId,
        title,
        passingScore,
        allowRetake: quiz?.allowRetake ?? true,
      })
      if (!result.success) setError(result.error)
      else router.refresh()
    })
  }

  function startEdit(q: BuilderQuestion) {
    setEditingId(q.id)
    setAdding(false)
    setDraft({
      text: q.text,
      explanation: q.explanation ?? "",
      points: q.points,
      options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
    })
  }

  function startAdd() {
    setAdding(true)
    setEditingId(null)
    setDraft(emptyDraft())
  }

  function cancel() {
    setAdding(false)
    setEditingId(null)
    setDraft(emptyDraft())
  }

  function setOption(idx: number, patch: Partial<DraftOption>) {
    setDraft((d) => ({
      ...d,
      options: d.options.map((o, i) => (i === idx ? { ...o, ...patch } : o)),
    }))
  }

  function setCorrect(idx: number) {
    setDraft((d) => ({
      ...d,
      options: d.options.map((o, i) => ({ ...o, isCorrect: i === idx })),
    }))
  }

  function addOption() {
    setDraft((d) => {
      if (d.options.length >= 6) return d
      return { ...d, options: [...d.options, { text: "", isCorrect: false }] }
    })
  }

  function removeOption(idx: number) {
    setDraft((d) => {
      if (d.options.length <= 2) return d
      const next = d.options.filter((_, i) => i !== idx)
      if (!next.some((o) => o.isCorrect)) next[0].isCorrect = true
      return { ...d, options: next }
    })
  }

  function saveQuestion() {
    setError("")
    if (!quiz) {
      setError("Save quiz settings first")
      return
    }
    if (!draft.text.trim()) {
      setError("Question text required")
      return
    }
    if (draft.options.some((o) => !o.text.trim())) {
      setError("All option texts required")
      return
    }
    if (!draft.options.some((o) => o.isCorrect)) {
      setError("Mark at least one correct option")
      return
    }

    startTransition(async () => {
      const payload = {
        text: draft.text,
        explanation: draft.explanation || undefined,
        points: draft.points,
        options: draft.options,
      }

      const result = editingId
        ? await updateQuestion({ questionId: editingId, ...payload })
        : await createQuestion({ quizId: quiz.id, ...payload })

      if (!result.success) {
        setError(result.error)
        return
      }
      cancel()
      router.refresh()
    })
  }

  function handleDeleteQuestion(id: string) {
    if (!window.confirm("Delete this question?")) return
    startTransition(async () => {
      const result = await deleteQuestion({ questionId: id })
      if (!result.success) setError(result.error)
      else router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Quiz settings */}
      <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 space-y-3">
        <h4 className="font-bold text-sm">Quiz Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-on-surface-variant">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-on-surface-variant">Passing score (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className="w-full bg-surface-container border border-outline-variant rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleSaveQuizMeta}
          disabled={isPending}
          className="bg-primary text-on-primary px-4 py-2 rounded-md text-sm font-bold disabled:opacity-50"
        >
          {quiz ? "Update Quiz" : "Create Quiz"}
        </button>
      </div>

      {error && (
        <div className="bg-error-container border border-error/30 rounded-lg px-4 py-2 text-on-error-container text-sm">
          {error}
        </div>
      )}

      {/* Questions */}
      {quiz && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm">Questions ({quiz.questions.length})</h4>
            {!adding && !editingId && (
              <button
                type="button"
                onClick={startAdd}
                className="bg-primary text-on-primary px-3 py-1.5 rounded-md text-sm font-bold"
              >
                + Add Question
              </button>
            )}
          </div>

          {quiz.questions.map((q, idx) =>
            editingId === q.id ? (
              <QuestionForm
                key={q.id}
                idx={idx}
                draft={draft}
                onChange={setDraft}
                onSetOption={setOption}
                onSetCorrect={setCorrect}
                onAddOption={addOption}
                onRemoveOption={removeOption}
                onSave={saveQuestion}
                onCancel={cancel}
                isPending={isPending}
              />
            ) : (
              <div
                key={q.id}
                className="bg-surface-container-low border border-outline-variant rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-sm">
                    {idx + 1}. {q.text}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(q)}
                      className="text-on-surface-variant hover:text-primary"
                    >
                      <span className="material-symbols-outlined !text-base">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-on-surface-variant hover:text-error"
                    >
                      <span className="material-symbols-outlined !text-base">delete</span>
                    </button>
                  </div>
                </div>
                <ul className="text-xs space-y-1">
                  {q.options.map((o) => (
                    <li
                      key={o.id}
                      className={`flex items-center gap-2 ${
                        o.isCorrect ? "text-tertiary" : "text-on-surface-variant"
                      }`}
                    >
                      <span className="material-symbols-outlined !text-sm">
                        {o.isCorrect ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      {o.text}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}

          {adding && (
            <QuestionForm
              idx={quiz.questions.length}
              draft={draft}
              onChange={setDraft}
              onSetOption={setOption}
              onSetCorrect={setCorrect}
              onAddOption={addOption}
              onRemoveOption={removeOption}
              onSave={saveQuestion}
              onCancel={cancel}
              isPending={isPending}
            />
          )}
        </div>
      )}
    </div>
  )
}

interface QuestionFormProps {
  idx: number
  draft: { text: string; explanation: string; points: number; options: DraftOption[] }
  onChange: (
    update: (prev: {
      text: string
      explanation: string
      points: number
      options: DraftOption[]
    }) => { text: string; explanation: string; points: number; options: DraftOption[] }
  ) => void
  onSetOption: (idx: number, patch: Partial<DraftOption>) => void
  onSetCorrect: (idx: number) => void
  onAddOption: () => void
  onRemoveOption: (idx: number) => void
  onSave: () => void
  onCancel: () => void
  isPending: boolean
}

function QuestionForm({
  idx,
  draft,
  onChange,
  onSetOption,
  onSetCorrect,
  onAddOption,
  onRemoveOption,
  onSave,
  onCancel,
  isPending,
}: QuestionFormProps) {
  return (
    <div className="bg-surface-container border border-primary/30 rounded-lg p-4 space-y-3">
      <div className="space-y-1">
        <label className="text-xs text-on-surface-variant">Question {idx + 1}</label>
        <textarea
          value={draft.text}
          onChange={(e) => onChange((d) => ({ ...d, text: e.target.value }))}
          rows={2}
          className="w-full bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="What is...?"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-on-surface-variant">Options (mark one correct)</label>
        {draft.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSetCorrect(i)}
              aria-label={opt.isCorrect ? "Correct" : "Mark correct"}
              className={`shrink-0 ${opt.isCorrect ? "text-tertiary" : "text-on-surface-variant hover:text-primary"}`}
            >
              <span className="material-symbols-outlined !text-lg">
                {opt.isCorrect ? "check_circle" : "radio_button_unchecked"}
              </span>
            </button>
            <input
              value={opt.text}
              onChange={(e) => onSetOption(i, { text: e.target.value })}
              placeholder={`Option ${i + 1}`}
              className="flex-1 bg-surface-container-low border border-outline-variant rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {draft.options.length > 2 && (
              <button
                type="button"
                onClick={() => onRemoveOption(i)}
                aria-label="Remove option"
                className="text-on-surface-variant hover:text-error"
              >
                <span className="material-symbols-outlined !text-base">close</span>
              </button>
            )}
          </div>
        ))}
        {draft.options.length < 6 && (
          <button
            type="button"
            onClick={onAddOption}
            className="text-xs text-primary hover:underline"
          >
            + Add option
          </button>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-xs text-on-surface-variant">Explanation (optional)</label>
        <textarea
          value={draft.explanation}
          onChange={(e) => onChange((d) => ({ ...d, explanation: e.target.value }))}
          rows={2}
          className="w-full bg-surface-container-low border border-outline-variant rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Why this answer?"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={isPending}
          className="bg-primary text-on-primary px-4 py-1.5 rounded-md text-sm font-bold disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="text-on-surface-variant hover:text-on-surface px-3 py-1.5 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

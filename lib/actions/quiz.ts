// lib/actions/quiz.ts
"use server"

import { prisma } from "@/lib/db"
import { requireAuth, requireRole } from "@/lib/auth/guards"
import {
  QuizSubmitSchema,
  CreateQuestionSchema,
  UpdateQuestionSchema,
  DeleteQuestionSchema,
  ReorderQuestionsSchema,
  UpsertQuizSchema,
} from "./schemas"
import type {
  QuizSubmitInput,
  CreateQuestionInput,
  UpdateQuestionInput,
  DeleteQuestionInput,
  ReorderQuestionsInput,
  UpsertQuizInput,
} from "./schemas"
import { markLessonComplete } from "./progress"

type BuilderResult = { success: true; id?: string } | { success: false; error: string }

async function ensureLessonOwnership(userId: string, role: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId, deletedAt: null },
    select: { chapter: { select: { course: { select: { instructorId: true } } } } },
  })
  if (!lesson) return false
  return lesson.chapter.course.instructorId === userId || role === "ADMIN"
}

async function ensureQuizOwnership(userId: string, role: string, quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { lesson: { select: { chapter: { select: { course: { select: { instructorId: true } } } } } } },
  })
  if (!quiz) return false
  return quiz.lesson.chapter.course.instructorId === userId || role === "ADMIN"
}

async function ensureQuestionOwnership(userId: string, role: string, questionId: string) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      quiz: { select: { lesson: { select: { chapter: { select: { course: { select: { instructorId: true } } } } } } } },
    },
  })
  if (!question) return false
  return question.quiz.lesson.chapter.course.instructorId === userId || role === "ADMIN"
}

type ActionResult =
  | { success: true; score: number; passed: boolean }
  | { success: false; error: string }

export async function submitQuizAttempt(data: QuizSubmitInput): Promise<ActionResult> {
  const parsed = QuizSubmitSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const user = await requireAuth()
  const { quizId, answers } = parsed.data

  // Fetch quiz with questions and correct answers
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      lesson: {
        select: {
          id: true,
          chapter: { select: { courseId: true } },
        },
      },
      questions: {
        include: {
          options: { select: { id: true, isCorrect: true } },
        },
        orderBy: { position: "asc" },
      },
    },
  })

  if (!quiz) {
    return { success: false, error: "Quiz not found" }
  }

  // Verify enrollment
  const courseId = quiz.lesson.chapter.courseId
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  })

  if (!enrollment) {
    return { success: false, error: "You are not enrolled in this course" }
  }

  // Score the quiz
  const totalQuestions = quiz.questions.length
  let correctCount = 0

  const answersMap: Record<string, string> = {}
  for (const answer of answers) {
    answersMap[answer.questionId] = answer.selectedOptionId
  }

  for (const question of quiz.questions) {
    const selectedOptionId = answersMap[question.id]
    if (!selectedOptionId) continue

    const correctOption = question.options.find((o) => o.isCorrect)
    if (correctOption && correctOption.id === selectedOptionId) {
      correctCount++
    }
  }

  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const passed = score >= quiz.passingScore

  // Save attempt
  await prisma.quizAttempt.create({
    data: {
      userId: user.id,
      quizId,
      score,
      isPassed: passed,
      answers: answersMap,
      completedAt: new Date(),
    },
  })

  // Create notification
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: passed ? "QUIZ_PASSED" : "QUIZ_FAILED",
      title: passed ? "Quiz passed!" : "Quiz not passed",
      message: passed
        ? `You scored ${score}% on "${quiz.title}". Well done!`
        : `You scored ${score}% on "${quiz.title}". ${quiz.passingScore}% required to pass.`,
      metadata: { quizId, courseId },
    },
  })

  // Mark lesson complete if passed
  if (passed) {
    await markLessonComplete({ lessonId: quiz.lesson.id })
  }

  return { success: true, score, passed }
}

// --- Quiz Builder Actions ---

export async function upsertQuiz(data: UpsertQuizInput): Promise<BuilderResult> {
  const parsed = UpsertQuizSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { lessonId, ...fields } = parsed.data

  const owned = await ensureLessonOwnership(user.id, user.role, lessonId)
  if (!owned) return { success: false, error: "Lesson not found or you don't own it" }

  const quiz = await prisma.quiz.upsert({
    where: { lessonId },
    create: { lessonId, ...fields },
    update: fields,
  })

  return { success: true, id: quiz.id }
}

export async function createQuestion(data: CreateQuestionInput): Promise<BuilderResult> {
  const parsed = CreateQuestionSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { quizId, text, explanation, points, options } = parsed.data

  const owned = await ensureQuizOwnership(user.id, user.role, quizId)
  if (!owned) return { success: false, error: "Quiz not found or you don't own it" }

  if (!options.some((o) => o.isCorrect)) {
    return { success: false, error: "At least one option must be marked correct" }
  }

  const maxPos = await prisma.question.aggregate({
    where: { quizId },
    _max: { position: true },
  })

  const question = await prisma.question.create({
    data: {
      quizId,
      text,
      explanation: explanation ?? null,
      points,
      position: (maxPos._max.position ?? 0) + 1,
      options: {
        create: options.map((o, idx) => ({
          text: o.text,
          isCorrect: o.isCorrect,
          position: idx + 1,
        })),
      },
    },
  })

  return { success: true, id: question.id }
}

export async function updateQuestion(data: UpdateQuestionInput): Promise<BuilderResult> {
  const parsed = UpdateQuestionSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { questionId, options, ...fields } = parsed.data

  const owned = await ensureQuestionOwnership(user.id, user.role, questionId)
  if (!owned) return { success: false, error: "Question not found or you don't own it" }

  if (options && !options.some((o) => o.isCorrect)) {
    return { success: false, error: "At least one option must be marked correct" }
  }

  await prisma.$transaction(async (tx) => {
    await tx.question.update({
      where: { id: questionId },
      data: {
        ...(fields.text !== undefined && { text: fields.text }),
        ...(fields.explanation !== undefined && { explanation: fields.explanation }),
        ...(fields.points !== undefined && { points: fields.points }),
      },
    })

    if (options) {
      await tx.questionOption.deleteMany({ where: { questionId } })
      await tx.questionOption.createMany({
        data: options.map((o, idx) => ({
          questionId,
          text: o.text,
          isCorrect: o.isCorrect,
          position: idx + 1,
        })),
      })
    }
  })

  return { success: true }
}

export async function deleteQuestion(data: DeleteQuestionInput): Promise<BuilderResult> {
  const parsed = DeleteQuestionSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { questionId } = parsed.data

  const owned = await ensureQuestionOwnership(user.id, user.role, questionId)
  if (!owned) return { success: false, error: "Question not found or you don't own it" }

  await prisma.question.delete({ where: { id: questionId } })
  return { success: true }
}

export async function reorderQuestions(data: ReorderQuestionsInput): Promise<BuilderResult> {
  const parsed = ReorderQuestionsSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireRole(["TEACHER", "ADMIN"])
  const { quizId, orderedIds } = parsed.data

  const owned = await ensureQuizOwnership(user.id, user.role, quizId)
  if (!owned) return { success: false, error: "Quiz not found or you don't own it" }

  const existing = await prisma.question.findMany({
    where: { quizId },
    select: { id: true },
  })
  const existingIds = new Set(existing.map((q) => q.id))
  for (const id of orderedIds) {
    if (!existingIds.has(id)) {
      return { success: false, error: "Question not found in quiz" }
    }
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.question.update({ where: { id }, data: { position: index + 1 } })
    )
  )

  return { success: true }
}

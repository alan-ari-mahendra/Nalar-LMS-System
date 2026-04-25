// lib/actions/quiz.ts
"use server"

import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth/guards"
import { QuizSubmitSchema } from "./schemas"
import type { QuizSubmitInput } from "./schemas"
import { markLessonComplete } from "./progress"

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

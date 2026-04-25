import { z } from "zod/v4"

export const EnrollmentSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
})

export const LessonCompleteSchema = z.object({
  lessonId: z.string().min(1, "Lesson ID is required"),
})

export const WatchProgressSchema = z.object({
  lessonId: z.string().min(1, "Lesson ID is required"),
  watchedSeconds: z.number().int().min(0),
})

export const QuizSubmitSchema = z.object({
  quizId: z.string().min(1, "Quiz ID is required"),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        selectedOptionId: z.string().min(1),
      })
    )
    .min(1, "At least one answer is required"),
})

export const ReviewSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters").max(1000),
})

export const CourseStatusSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
})

export type EnrollmentInput = z.infer<typeof EnrollmentSchema>
export type LessonCompleteInput = z.infer<typeof LessonCompleteSchema>
export type WatchProgressInput = z.infer<typeof WatchProgressSchema>
export type QuizSubmitInput = z.infer<typeof QuizSubmitSchema>
export type ReviewInput = z.infer<typeof ReviewSchema>
export type CourseStatusInput = z.infer<typeof CourseStatusSchema>

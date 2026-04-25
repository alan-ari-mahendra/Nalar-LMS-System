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

// --- Course Builder Schemas ---

export const CreateCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10).max(5000),
  shortDesc: z.string().min(10).max(500),
  price: z.number().min(0),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  categoryId: z.string().min(1),
  thumbnailUrl: z.string().url("Must be a valid URL"),
})

export const UpdateCourseSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  shortDesc: z.string().min(10).max(500).optional(),
  price: z.number().min(0).optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  categoryId: z.string().min(1).optional(),
  thumbnailUrl: z.string().url().optional(),
})

export const CreateChapterSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1, "Chapter title required").max(200),
  description: z.string().max(1000).optional(),
})

export const UpdateChapterSchema = z.object({
  chapterId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
})

export const DeleteChapterSchema = z.object({
  chapterId: z.string().min(1),
})

export const CreateLessonSchema = z.object({
  chapterId: z.string().min(1),
  title: z.string().min(1, "Lesson title required").max(200),
  type: z.enum(["VIDEO", "TEXT", "QUIZ", "ATTACHMENT"]),
  content: z.string().max(50000).optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().int().min(0).optional(),
})

export const UpdateLessonSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  type: z.enum(["VIDEO", "TEXT", "QUIZ", "ATTACHMENT"]).optional(),
  content: z.string().max(50000).optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().int().min(0).optional(),
})

export const DeleteLessonSchema = z.object({
  lessonId: z.string().min(1),
})

// --- Admin Schemas ---

export const ToggleUserSchema = z.object({
  userId: z.string().min(1),
})

export const ChangeRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
})

export const RejectCourseSchema = z.object({
  courseId: z.string().min(1),
  reason: z.string().min(5, "Reason must be at least 5 characters").max(500),
})

// --- Order / Payment Schemas ---

export const PaymentMethodEnum = z.enum([
  "BANK_TRANSFER",
  "CREDIT_CARD",
  "GOPAY",
  "OVO",
  "QRIS",
])

export const CreateOrderSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),
  paymentMethod: PaymentMethodEnum,
})

export const OrderIdSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
})

export const RefundOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters").max(500),
})

export type PaymentMethod = z.infer<typeof PaymentMethodEnum>
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type OrderIdInput = z.infer<typeof OrderIdSchema>
export type RefundOrderInput = z.infer<typeof RefundOrderSchema>

export type CreateCourseInput = z.infer<typeof CreateCourseSchema>
export type UpdateCourseInput = z.infer<typeof UpdateCourseSchema>
export type CreateChapterInput = z.infer<typeof CreateChapterSchema>
export type UpdateChapterInput = z.infer<typeof UpdateChapterSchema>
export type DeleteChapterInput = z.infer<typeof DeleteChapterSchema>
export type CreateLessonInput = z.infer<typeof CreateLessonSchema>
export type UpdateLessonInput = z.infer<typeof UpdateLessonSchema>
export type DeleteLessonInput = z.infer<typeof DeleteLessonSchema>
export type ToggleUserInput = z.infer<typeof ToggleUserSchema>
export type ChangeRoleInput = z.infer<typeof ChangeRoleSchema>
export type RejectCourseInput = z.infer<typeof RejectCourseSchema>

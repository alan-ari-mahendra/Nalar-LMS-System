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

export const ReorderChaptersSchema = z.object({
  courseId: z.string().min(1),
  orderedIds: z.array(z.string().min(1)).min(1),
})

export const ReorderLessonsSchema = z.object({
  chapterId: z.string().min(1),
  orderedIds: z.array(z.string().min(1)).min(1),
})

const QuestionOptionInputSchema = z.object({
  text: z.string().min(1, "Option text required").max(500),
  isCorrect: z.boolean(),
})

export const CreateQuestionSchema = z.object({
  quizId: z.string().min(1),
  text: z.string().min(1, "Question text required").max(1000),
  explanation: z.string().max(2000).optional(),
  points: z.number().int().min(1).max(100).default(1),
  options: z.array(QuestionOptionInputSchema).min(2, "At least 2 options required").max(6),
})

export const UpdateQuestionSchema = z.object({
  questionId: z.string().min(1),
  text: z.string().min(1).max(1000).optional(),
  explanation: z.string().max(2000).optional(),
  points: z.number().int().min(1).max(100).optional(),
  options: z.array(QuestionOptionInputSchema).min(2).max(6).optional(),
})

export const DeleteQuestionSchema = z.object({
  questionId: z.string().min(1),
})

export const ReorderQuestionsSchema = z.object({
  quizId: z.string().min(1),
  orderedIds: z.array(z.string().min(1)).min(1),
})

export const UpsertQuizSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().min(1).max(200),
  passingScore: z.number().int().min(0).max(100).default(70),
  allowRetake: z.boolean().default(true),
  maxAttempts: z.number().int().min(1).max(100).optional(),
  timeLimit: z.number().int().min(0).optional(),
})

// --- Wishlist ---

export const WishlistCourseSchema = z.object({
  courseId: z.string().min(1),
})

// --- Discussion ---

export const CreateDiscussionSchema = z.object({
  lessonId: z.string().min(1),
  body: z.string().min(1, "Discussion body required").max(2000),
})

export const ReplyDiscussionSchema = z.object({
  discussionId: z.string().min(1),
  body: z.string().min(1, "Reply body required").max(2000),
})

export const DeleteDiscussionSchema = z.object({
  discussionId: z.string().min(1),
})

export const DeleteDiscussionReplySchema = z.object({
  replyId: z.string().min(1),
})

// --- Payout ---

export const RequestPayoutSchema = z.object({
  amount: z.number().min(100000, "Minimum payout Rp 100,000"),
  bankName: z.string().min(2).max(80),
  accountNumber: z.string().min(4).max(40),
  accountHolder: z.string().min(2).max(120),
  note: z.string().max(500).optional(),
})

export const ApprovePayoutSchema = z.object({
  payoutId: z.string().min(1),
})

export const RejectPayoutSchema = z.object({
  payoutId: z.string().min(1),
  reason: z.string().min(5).max(500),
})

// --- Coupon ---

export const CreateCouponSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[A-Z0-9_-]+$/, "Code must be uppercase letters, numbers, _ or -"),
  discountPercent: z.number().int().min(1).max(100),
  maxUses: z.number().int().min(1).max(100000).optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
})

export const UpdateCouponSchema = z.object({
  couponId: z.string().min(1),
  discountPercent: z.number().int().min(1).max(100).optional(),
  maxUses: z.number().int().min(1).max(100000).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
})

export const DeleteCouponSchema = z.object({
  couponId: z.string().min(1),
})

export const ValidateCouponSchema = z.object({
  code: z.string().min(1).max(40),
  courseId: z.string().min(1),
})

// --- Category ---

export const CreateCategorySchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional(),
  iconUrl: z.string().url().optional(),
})

export const UpdateCategorySchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(2).max(80).optional(),
  description: z.string().max(500).optional(),
  iconUrl: z.string().url().nullable().optional(),
})

export const DeleteCategorySchema = z.object({
  categoryId: z.string().min(1),
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
  couponCode: z.string().max(40).optional(),
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
export type ReorderChaptersInput = z.infer<typeof ReorderChaptersSchema>
export type ReorderLessonsInput = z.infer<typeof ReorderLessonsSchema>
export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>
export type UpdateQuestionInput = z.infer<typeof UpdateQuestionSchema>
export type DeleteQuestionInput = z.infer<typeof DeleteQuestionSchema>
export type ReorderQuestionsInput = z.infer<typeof ReorderQuestionsSchema>
export type UpsertQuizInput = z.infer<typeof UpsertQuizSchema>
export type WishlistCourseInput = z.infer<typeof WishlistCourseSchema>
export type CreateDiscussionInput = z.infer<typeof CreateDiscussionSchema>
export type ReplyDiscussionInput = z.infer<typeof ReplyDiscussionSchema>
export type DeleteDiscussionInput = z.infer<typeof DeleteDiscussionSchema>
export type DeleteDiscussionReplyInput = z.infer<typeof DeleteDiscussionReplySchema>
export type RequestPayoutInput = z.infer<typeof RequestPayoutSchema>
export type ApprovePayoutInput = z.infer<typeof ApprovePayoutSchema>
export type RejectPayoutInput = z.infer<typeof RejectPayoutSchema>
export type CreateCouponInput = z.infer<typeof CreateCouponSchema>
export type UpdateCouponInput = z.infer<typeof UpdateCouponSchema>
export type DeleteCouponInput = z.infer<typeof DeleteCouponSchema>
export type ValidateCouponInput = z.infer<typeof ValidateCouponSchema>
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>
export type DeleteCategoryInput = z.infer<typeof DeleteCategorySchema>

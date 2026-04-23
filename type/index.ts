// ============================================================
// Learnify — Shared TypeScript Types
// ============================================================

export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN"
export type CourseStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED"
export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
export type LessonType = "VIDEO" | "TEXT" | "QUIZ" | "ATTACHMENT"
export type OrderStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
export type NotificationType =
  | "ENROLLMENT"
  | "COURSE_APPROVED"
  | "COURSE_REJECTED"
  | "QUIZ_PASSED"
  | "QUIZ_FAILED"
  | "CERTIFICATE_ISSUED"
  | "NEW_REVIEW"
  | "COURSE_UPDATE"

// ---- Profile ------------------------------------------------

export interface Profile {
  id: string
  email: string
  fullName: string
  avatarUrl: string | null
  bio: string | null
  headline: string | null
  website: string | null
  role: Role
  isActive: boolean
  createdAt: string
}

// ---- Category -----------------------------------------------

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  iconUrl: string | null
}

// ---- Course -------------------------------------------------

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  shortDesc: string
  thumbnailUrl: string
  trailerUrl: string | null
  price: number                   // IDR
  isFree: boolean
  status: CourseStatus
  level: CourseLevel
  language: string
  totalDuration: number           // seconds
  totalLessons: number
  instructorId: string
  instructor: InstructorSummary
  categoryId: string
  category: Category
  requirements: string[]
  outcomes: string[]
  rating: number                  // 1-5
  reviewCount: number
  enrollmentCount: number
  createdAt: string
  publishedAt: string | null
}

export interface InstructorSummary {
  id: string
  fullName: string
  avatarUrl: string | null
  headline: string | null
  courseCount: number
  studentCount: number
  rating: number
  bio: string | null
}

// ---- Chapter + Lesson ---------------------------------------

export interface Chapter {
  id: string
  title: string
  description: string | null
  position: number
  isFree: boolean
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  description: string | null
  type: LessonType
  position: number
  isFree: boolean
  duration: number | null         // seconds
  videoUrl: string | null
  videoPlaybackId: string | null
  content: string | null
  chapterId: string
}

// ---- Course Detail (full) -----------------------------------

export interface CourseDetail extends Course {
  chapters: Chapter[]
  reviews: Review[]
  attachments: Attachment[]
}

// ---- Enrollment + Progress ----------------------------------

export interface Enrollment {
  id: string
  enrolledAt: string
  completedAt: string | null
  progressPercent: number
  courseId: string
  course: Course
  studentId: string
}

export interface LessonProgress {
  id: string
  isCompleted: boolean
  completedAt: string | null
  watchedSeconds: number
  lessonId: string
  studentId: string
}

// ---- Review -------------------------------------------------

export interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  student: {
    id: string
    fullName: string
    avatarUrl: string | null
  }
}

// ---- Certificate --------------------------------------------

export interface Certificate {
  id: string
  verifyCode: string
  issuedAt: string
  studentId: string
  student: Pick<Profile, "id" | "fullName" | "avatarUrl">
  courseId: string
  course: Pick<Course, "id" | "title" | "slug" | "thumbnailUrl">
  instructor: Pick<InstructorSummary, "id" | "fullName">
}

// ---- Notification -------------------------------------------

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  metadata: Record<string, string> | null
  createdAt: string
}

// ---- Attachment ---------------------------------------------

export interface Attachment {
  id: string
  name: string
  url: string
  size: number | null
  mimeType: string | null
}

// ---- Quiz ---------------------------------------------------

export interface Quiz {
  id: string
  title: string
  passingScore: number
  allowRetake: boolean
  maxAttempts: number | null
  timeLimit: number | null
  questions: Question[]
}

export interface Question {
  id: string
  text: string
  explanation: string | null
  position: number
  points: number
  options: QuestionOption[]
}

export interface QuestionOption {
  id: string
  text: string
  isCorrect: boolean
  position: number
}

export interface QuizAttempt {
  id: string
  score: number
  isPassed: boolean
  answers: Record<string, string>
  startedAt: string
  completedAt: string | null
  quizId: string
}

// ---- Instructor Analytics -----------------------------------

export interface InstructorStats {
  totalRevenue: number
  totalRevenueChange: number        // % vs last month
  totalStudents: number
  totalStudentsChange: number
  activeCourses: number
  avgRating: number
  monthlyRevenue: MonthlyRevenue[]
}

export interface MonthlyRevenue {
  month: string                     // e.g. "Jan", "Feb"
  revenue: number
}

export interface CoursePerformance {
  courseId: string
  title: string
  thumbnailUrl: string
  studentCount: number
  rating: number
  revenue: number
  status: CourseStatus
}

// ---- Student Dashboard Stats --------------------------------

export interface StudentStats {
  coursesEnrolled: number
  lessonsCompleted: number
  certificatesEarned: number
  currentStreak: number
}

export interface ActivityItem {
  id: string
  type: "LESSON_COMPLETED" | "CERTIFICATE_EARNED" | "QUIZ_PASSED" | "ENROLLED"
  message: string
  createdAt: string
  metadata: {
    courseTitle?: string
    lessonTitle?: string
    score?: number
  }
}
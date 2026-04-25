// Maps Prisma query results to frontend types from @/type
// Prisma uses `name` for user, frontend uses `fullName`
// Prisma returns Decimal for price, frontend uses number

import type { Course, CourseDetail, Category, Chapter, Lesson, Review, Attachment, Enrollment, Certificate, LessonProgress } from "@/type"

type PrismaInstructor = {
  id: string
  name: string | null
  avatarUrl: string | null
  _count?: { courses: number }
}

type PrismaCategory = {
  id: string
  name: string
  slug: string
  description?: string | null
}

type PrismaCourse = {
  id: string
  title: string
  slug: string
  description: string
  shortDesc: string
  thumbnailUrl: string
  trailerUrl: string | null
  price: { toNumber(): number } | number
  isFree: boolean
  status: string
  level: string
  language: string
  totalDuration: number
  totalLessons: number
  requirements: string[]
  outcomes: string[]
  rating: number
  reviewCount: number
  enrollmentCount: number
  createdAt: Date
  publishedAt: Date | null
  instructorId: string
  categoryId: string
  instructor: PrismaInstructor
  category: PrismaCategory
}

export function serializeCourse(c: PrismaCourse): Course {
  return {
    id: c.id,
    title: c.title,
    slug: c.slug,
    description: c.description,
    shortDesc: c.shortDesc,
    thumbnailUrl: c.thumbnailUrl,
    trailerUrl: c.trailerUrl,
    price: Number(c.price),
    isFree: c.isFree,
    status: c.status as Course["status"],
    level: c.level as Course["level"],
    language: c.language,
    totalDuration: c.totalDuration,
    totalLessons: c.totalLessons,
    instructorId: c.instructorId,
    instructor: {
      id: c.instructor.id,
      fullName: c.instructor.name ?? "",
      avatarUrl: c.instructor.avatarUrl,
      headline: null,
      courseCount: c.instructor._count?.courses ?? 0,
      studentCount: c.enrollmentCount,
      rating: 0,
      bio: null,
    },
    categoryId: c.categoryId,
    category: {
      id: c.category.id,
      name: c.category.name,
      slug: c.category.slug,
      description: c.category.description ?? null,
      iconUrl: null,
    },
    requirements: c.requirements,
    outcomes: c.outcomes,
    rating: c.rating,
    reviewCount: c.reviewCount,
    enrollmentCount: c.enrollmentCount,
    createdAt: c.createdAt.toISOString(),
    publishedAt: c.publishedAt?.toISOString() ?? null,
  }
}

export function serializeCourseDetail(c: PrismaCourse & {
  chapters: (PrismaChapter & { lessons: PrismaLesson[] })[]
  reviews: PrismaReview[]
  attachments: PrismaAttachment[]
}): CourseDetail {
  return {
    ...serializeCourse(c),
    chapters: c.chapters.map(serializeChapter),
    reviews: c.reviews.map(serializeReview),
    attachments: c.attachments.map(serializeAttachment),
  }
}

type PrismaChapter = {
  id: string
  title: string
  description: string | null
  position: number
  isFree: boolean
}

type PrismaLesson = {
  id: string
  title: string
  description: string | null
  type: string
  position: number
  isFree: boolean
  duration: number | null
  videoUrl: string | null
  videoPlaybackId: string | null
  content: string | null
  chapterId: string
}

function serializeChapter(ch: PrismaChapter & { lessons: PrismaLesson[] }): Chapter {
  return {
    id: ch.id,
    title: ch.title,
    description: ch.description,
    position: ch.position,
    isFree: ch.isFree,
    lessons: ch.lessons.map(serializeLesson),
  }
}

function serializeLesson(l: PrismaLesson): Lesson {
  return {
    id: l.id,
    title: l.title,
    description: l.description,
    type: l.type as Lesson["type"],
    position: l.position,
    isFree: l.isFree,
    duration: l.duration,
    videoUrl: l.videoUrl,
    videoPlaybackId: l.videoPlaybackId,
    content: l.content,
    chapterId: l.chapterId,
  }
}

type PrismaReview = {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  user: { id: string; name: string | null; avatarUrl: string | null }
}

function serializeReview(r: PrismaReview): Review {
  return {
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
    student: {
      id: r.user.id,
      fullName: r.user.name ?? "",
      avatarUrl: r.user.avatarUrl,
    },
  }
}

type PrismaAttachment = {
  id: string
  name: string
  url: string
  size: number | null
  mimeType: string | null
}

function serializeAttachment(a: PrismaAttachment): Attachment {
  return {
    id: a.id,
    name: a.name,
    url: a.url,
    size: a.size,
    mimeType: a.mimeType,
  }
}

export function serializeEnrollment(e: {
  id: string
  enrolledAt: Date
  completedAt: Date | null
  progressPercent: number
  courseId: string
  userId: string
  course: PrismaCourse
}): Enrollment {
  return {
    id: e.id,
    enrolledAt: e.enrolledAt.toISOString(),
    completedAt: e.completedAt?.toISOString() ?? null,
    progressPercent: e.progressPercent,
    courseId: e.courseId,
    course: serializeCourse(e.course),
    studentId: e.userId,
  }
}

export function serializeCertificate(c: {
  id: string
  verifyCode: string
  issuedAt: Date
  userId: string
  courseId: string
  user: { id: string; name: string | null; avatarUrl: string | null }
  course: {
    id: string
    title: string
    slug: string
    thumbnailUrl: string
    instructor: { id: string; name: string | null }
  }
}): Certificate {
  return {
    id: c.id,
    verifyCode: c.verifyCode,
    issuedAt: c.issuedAt.toISOString(),
    studentId: c.userId,
    student: {
      id: c.user.id,
      fullName: c.user.name ?? "",
      avatarUrl: c.user.avatarUrl,
    },
    courseId: c.courseId,
    course: {
      id: c.course.id,
      title: c.course.title,
      slug: c.course.slug,
      thumbnailUrl: c.course.thumbnailUrl,
    },
    instructor: {
      id: c.course.instructor.id,
      fullName: c.course.instructor.name ?? "",
    },
  }
}

export function serializeLessonProgress(lp: {
  id: string
  isCompleted: boolean
  completedAt: Date | null
  watchedSeconds: number
  lessonId: string
  userId: string
}): LessonProgress {
  return {
    id: lp.id,
    isCompleted: lp.isCompleted,
    completedAt: lp.completedAt?.toISOString() ?? null,
    watchedSeconds: lp.watchedSeconds,
    lessonId: lp.lessonId,
    studentId: lp.userId,
  }
}

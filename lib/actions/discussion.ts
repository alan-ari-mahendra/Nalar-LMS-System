"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth/guards"
import {
  CreateDiscussionSchema,
  ReplyDiscussionSchema,
  DeleteDiscussionSchema,
  DeleteDiscussionReplySchema,
} from "./schemas"
import type {
  CreateDiscussionInput,
  ReplyDiscussionInput,
  DeleteDiscussionInput,
  DeleteDiscussionReplyInput,
} from "./schemas"

type ActionResult = { success: true; id?: string } | { success: false; error: string }

async function ensureLessonAccess(userId: string, role: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId, deletedAt: null },
    select: {
      chapter: { select: { courseId: true, course: { select: { instructorId: true } } } },
    },
  })
  if (!lesson) return null

  const courseId = lesson.chapter.courseId
  const isInstructor = lesson.chapter.course.instructorId === userId

  if (isInstructor || role === "ADMIN") {
    return { courseId, isInstructor: true }
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  })
  if (!enrollment) return null

  return { courseId, isInstructor: false }
}

export async function createDiscussion(data: CreateDiscussionInput): Promise<ActionResult> {
  const parsed = CreateDiscussionSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireAuth()
  const { lessonId, body } = parsed.data

  const access = await ensureLessonAccess(user.id, user.role, lessonId)
  if (!access) return { success: false, error: "You don't have access to this lesson" }

  const discussion = await prisma.discussion.create({
    data: { lessonId, userId: user.id, body },
  })

  revalidatePath(`/learn/${access.courseId}/${lessonId}`)
  return { success: true, id: discussion.id }
}

export async function replyDiscussion(data: ReplyDiscussionInput): Promise<ActionResult> {
  const parsed = ReplyDiscussionSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireAuth()
  const { discussionId, body } = parsed.data

  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId, deletedAt: null },
    select: {
      userId: true,
      lessonId: true,
      lesson: {
        select: { title: true, chapter: { select: { courseId: true, course: { select: { title: true } } } } },
      },
    },
  })
  if (!discussion) return { success: false, error: "Discussion not found" }

  const access = await ensureLessonAccess(user.id, user.role, discussion.lessonId)
  if (!access) return { success: false, error: "You don't have access to this lesson" }

  const reply = await prisma.discussionReply.create({
    data: { discussionId, userId: user.id, body },
  })

  if (discussion.userId !== user.id) {
    await prisma.notification.create({
      data: {
        userId: discussion.userId,
        type: "DISCUSSION_REPLY",
        title: "New reply on your discussion",
        message: `${user.name ?? "Someone"} replied to your post on "${discussion.lesson.title}"`,
        metadata: {
          courseId: discussion.lesson.chapter.courseId,
          lessonId: discussion.lessonId,
          discussionId,
        },
      },
    })
  }

  revalidatePath(`/learn/${access.courseId}/${discussion.lessonId}`)
  return { success: true, id: reply.id }
}

export async function deleteDiscussion(data: DeleteDiscussionInput): Promise<ActionResult> {
  const parsed = DeleteDiscussionSchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireAuth()
  const { discussionId } = parsed.data

  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId, deletedAt: null },
    select: {
      userId: true,
      lessonId: true,
      lesson: { select: { chapter: { select: { courseId: true, course: { select: { instructorId: true } } } } } },
    },
  })
  if (!discussion) return { success: false, error: "Discussion not found" }

  const isAuthor = discussion.userId === user.id
  const isInstructor = discussion.lesson.chapter.course.instructorId === user.id
  const isAdmin = user.role === "ADMIN"
  if (!isAuthor && !isInstructor && !isAdmin) {
    return { success: false, error: "You can't delete this discussion" }
  }

  await prisma.discussion.update({
    where: { id: discussionId },
    data: { deletedAt: new Date() },
  })

  revalidatePath(`/learn/${discussion.lesson.chapter.courseId}/${discussion.lessonId}`)
  return { success: true }
}

export async function deleteDiscussionReply(
  data: DeleteDiscussionReplyInput
): Promise<ActionResult> {
  const parsed = DeleteDiscussionReplySchema.safeParse(data)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const user = await requireAuth()
  const { replyId } = parsed.data

  const reply = await prisma.discussionReply.findUnique({
    where: { id: replyId, deletedAt: null },
    select: {
      userId: true,
      discussion: {
        select: {
          lessonId: true,
          lesson: { select: { chapter: { select: { courseId: true, course: { select: { instructorId: true } } } } } },
        },
      },
    },
  })
  if (!reply) return { success: false, error: "Reply not found" }

  const isAuthor = reply.userId === user.id
  const isInstructor = reply.discussion.lesson.chapter.course.instructorId === user.id
  const isAdmin = user.role === "ADMIN"
  if (!isAuthor && !isInstructor && !isAdmin) {
    return { success: false, error: "You can't delete this reply" }
  }

  await prisma.discussionReply.update({
    where: { id: replyId },
    data: { deletedAt: new Date() },
  })

  revalidatePath(`/learn/${reply.discussion.lesson.chapter.courseId}/${reply.discussion.lessonId}`)
  return { success: true }
}

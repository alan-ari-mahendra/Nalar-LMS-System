import type { Prisma } from "@prisma/client"

/**
 * Creates an Enrollment + increments course.enrollmentCount + creates ENROLLMENT
 * notification. Must be called inside an active prisma.$transaction.
 *
 * Used by:
 * - enrollInFreeCourse (free path)
 * - mockConfirmPayment (paid path, after Order → COMPLETED)
 */
export async function createEnrollmentTx(
  tx: Prisma.TransactionClient,
  args: { userId: string; courseId: string; courseTitle: string }
): Promise<void> {
  const { userId, courseId, courseTitle } = args

  await tx.enrollment.create({
    data: { userId, courseId, progressPercent: 0 },
  })

  await tx.course.update({
    where: { id: courseId },
    data: { enrollmentCount: { increment: 1 } },
  })

  await tx.notification.create({
    data: {
      userId,
      type: "ENROLLMENT",
      title: "Enrolled successfully",
      message: `You have enrolled in "${courseTitle}"`,
      metadata: { courseId },
    },
  })
}

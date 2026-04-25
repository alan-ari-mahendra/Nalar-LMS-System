import { redirect, notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { requireAuth } from "@/lib/auth/guards"
import { prisma } from "@/lib/db"
import { getPendingOrderForCourse } from "@/lib/queries/order"
import { formatPrice, formatDuration } from "@/lib/utils"
import { CheckoutClient } from "./CheckoutClient"

export default async function CheckoutSummaryPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const user = await requireAuth()
  const { courseId } = await params

  const course = await prisma.course.findUnique({
    where: { id: courseId, status: "PUBLISHED", deletedAt: null },
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnailUrl: true,
      shortDesc: true,
      price: true,
      isFree: true,
      totalDuration: true,
      totalLessons: true,
      instructorId: true,
      instructor: { select: { name: true, avatarUrl: true } },
    },
  })

  if (!course) notFound()

  if (course.isFree || Number(course.price) === 0) {
    redirect(`/courses/${course.slug}`)
  }

  if (course.instructorId === user.id) {
    redirect(`/courses/${course.slug}`)
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    select: { id: true },
  })
  if (enrollment) {
    redirect(`/dashboard/courses`)
  }

  const pending = await getPendingOrderForCourse(user.id, courseId)
  if (pending) {
    redirect(`/checkout/order/${pending.id}/pay`)
  }

  const price = Number(course.price)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-outline-variant">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">bolt</span>
            <span className="font-bold tracking-tight text-on-surface">Learnify</span>
          </Link>
          <Link
            href={`/courses/${course.slug}`}
            className="text-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1"
          >
            <span className="material-symbols-outlined !text-base">close</span>
            Back to course
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">Checkout</h1>
        <p className="text-on-surface-variant text-sm mb-8">
          Choose how you&apos;d like to pay. This is a mock gateway — no real payment is processed.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Left: payment picker */}
          <CheckoutClient courseId={course.id} courseSlug={course.slug} />

          {/* Right: order summary */}
          <aside className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden h-fit lg:sticky lg:top-6">
            <div className="relative aspect-video">
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h2 className="font-bold text-on-surface line-clamp-2">{course.title}</h2>
                <p className="text-xs text-on-surface-variant mt-1">{course.instructor.name}</p>
              </div>

              <ul className="text-xs text-on-surface-variant space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined !text-base">play_circle</span>
                  {formatDuration(course.totalDuration)} of content
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined !text-base">menu_book</span>
                  {course.totalLessons} lessons
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined !text-base">workspace_premium</span>
                  Certificate of completion
                </li>
              </ul>

              <div className="border-t border-outline-variant pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="text-on-surface">{formatPrice(price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Platform fee</span>
                  <span className="text-tertiary">Free</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-outline-variant">
                  <span className="text-on-surface">Total</span>
                  <span className="text-on-surface">{formatPrice(price)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

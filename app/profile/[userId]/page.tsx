import { notFound } from "next/navigation"
import Link from "next/link"
import { getPublicProfile } from "@/lib/queries"
import { Avatar } from "@/components/shared/Avatar"
import { CourseCard } from "@/components/course/CourseCard"

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const profile = await getPublicProfile(userId)
  if (!profile) notFound()

  const { user, stats, authoredCourses } = profile

  const roleLabel =
    user.role === "TEACHER" ? "Instructor" : user.role === "ADMIN" ? "Admin" : "Student"

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors text-sm"
          >
            <span className="material-symbols-outlined !text-lg">arrow_back</span>
            Home
          </Link>
        </div>

        {/* Profile card */}
        <div className="bg-surface-container border border-outline-variant rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar src={user.avatarUrl} name={user.name ?? "User"} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
                  {user.name ?? "User"}
                </h1>
                <span className="text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-2 py-1 rounded font-bold">
                  {roleLabel}
                </span>
              </div>
              {user.headline && (
                <p className="text-on-surface-variant mt-1">{user.headline}</p>
              )}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-primary text-sm hover:underline mt-2"
                >
                  <span className="material-symbols-outlined !text-base">link</span>
                  Website
                </a>
              )}
            </div>
          </div>

          {user.bio && (
            <div className="mt-6 pt-6 border-t border-outline-variant">
              <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                About
              </h2>
              <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">
                {user.bio}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 pt-6 border-t border-outline-variant grid grid-cols-3 gap-4">
            <Stat label="Enrollments" value={stats.enrollmentCount} />
            <Stat label="Certificates" value={stats.certificateCount} />
            {(user.role === "TEACHER" || user.role === "ADMIN") && (
              <Stat label="Courses Authored" value={stats.authoredCount} />
            )}
          </div>
        </div>

        {/* Authored courses */}
        {authoredCourses.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-on-surface">Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {authoredCourses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-3xl font-extrabold tracking-tight text-on-surface">{value}</p>
      <p className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">{label}</p>
    </div>
  )
}

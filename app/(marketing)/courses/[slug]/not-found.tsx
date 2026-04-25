import Link from "next/link"

export default function CourseNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <span className="material-symbols-outlined !text-5xl text-on-surface-variant mb-4 opacity-40">search_off</span>
      <h2 className="text-xl font-bold text-on-surface mb-2">Course not found</h2>
      <p className="text-sm text-on-surface-variant mb-6">
        The course you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/courses"
        className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold hover:brightness-110 transition-all"
      >
        Browse Courses
      </Link>
    </div>
  )
}

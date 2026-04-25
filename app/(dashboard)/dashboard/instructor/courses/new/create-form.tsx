"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createCourse } from "@/lib/actions/course"

interface CreateCourseFormProps {
  categories: { id: string; name: string }[]
}

export function CreateCourseForm({ categories }: CreateCourseFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    const fd = new FormData(e.currentTarget)
    const data = {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      shortDesc: fd.get("shortDesc") as string,
      price: Number(fd.get("price") || 0),
      level: fd.get("level") as "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
      categoryId: fd.get("categoryId") as string,
      thumbnailUrl: (fd.get("thumbnailUrl") as string) || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    }

    startTransition(async () => {
      const result = await createCourse(data)
      if (result.success && result.id) {
        router.push(`/dashboard/instructor/courses/${result.id}`)
      } else if (!result.success) {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-5">
      {error && (
        <div className="bg-error-container border border-error/30 rounded-lg px-4 py-3 text-on-error-container text-sm">{error}</div>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-on-surface">Course Title</label>
        <input id="title" name="title" required minLength={3} maxLength={200} placeholder="e.g. Full-Stack Next.js Masterclass"
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" />
      </div>

      <div className="space-y-2">
        <label htmlFor="shortDesc" className="text-sm font-medium text-on-surface">Short Description</label>
        <input id="shortDesc" name="shortDesc" required minLength={10} maxLength={500} placeholder="Brief summary shown on course cards"
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-on-surface">Full Description</label>
        <textarea id="description" name="description" required minLength={10} maxLength={5000} rows={5} placeholder="Detailed course description..."
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium text-on-surface">Price (IDR)</label>
          <input id="price" name="price" type="number" min={0} step={1000} defaultValue={0} placeholder="0 = Free"
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" />
        </div>
        <div className="space-y-2">
          <label htmlFor="level" className="text-sm font-medium text-on-surface">Level</label>
          <select id="level" name="level" defaultValue="BEGINNER"
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="categoryId" className="text-sm font-medium text-on-surface">Category</label>
        <select id="categoryId" name="categoryId" required
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
          <option value="">Select category...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="thumbnailUrl" className="text-sm font-medium text-on-surface">Thumbnail URL</label>
        <input id="thumbnailUrl" name="thumbnailUrl" type="url" placeholder="https://images.unsplash.com/..."
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background" />
      </div>

      <button type="submit" disabled={isPending}
        className="w-full bg-primary text-on-primary py-3 rounded-lg font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        {isPending ? "Creating..." : "Create Course"}
      </button>
    </form>
  )
}

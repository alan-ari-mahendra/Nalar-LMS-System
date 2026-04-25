"use client"

import { useState, useTransition } from "react"
import { Avatar } from "@/components/shared/Avatar"
import { updateProfile } from "@/lib/auth/actions"

interface ProfileFormProps {
  user: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
    headline: string
    bio: string
    website: string
  }
}

const inputClass =
  "w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"

export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess(false)

    const fd = new FormData(e.currentTarget)
    const payload = {
      name: String(fd.get("name") ?? ""),
      headline: String(fd.get("headline") ?? ""),
      bio: String(fd.get("bio") ?? ""),
      website: String(fd.get("website") ?? ""),
    }

    startTransition(async () => {
      const result = await updateProfile(payload)
      if (result.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <section className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-on-surface">Profile</h2>
        <p className="text-on-surface-variant text-sm mt-1">
          Update how others see you on Learnify.
        </p>
      </div>

      <div className="flex items-center gap-4 pb-6 border-b border-outline-variant">
        <Avatar src={user.avatarUrl} name={user.name || "User"} size="lg" />
        <div>
          <button
            type="button"
            disabled
            title="Coming soon"
            className="px-4 py-2 border border-outline-variant bg-surface-container-low text-on-surface-variant text-sm font-bold rounded-lg cursor-not-allowed opacity-60"
          >
            Change Photo
          </button>
          <p className="text-xs text-on-surface-variant mt-1.5">
            PNG, JPG up to 2MB (coming soon)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-error-container border border-error/30 rounded-lg px-4 py-3 text-on-error-container text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-tertiary-container border border-tertiary/30 rounded-lg px-4 py-3 text-on-tertiary-container text-sm flex items-center gap-2">
            <span className="material-symbols-outlined !text-base">check_circle</span>
            Profile updated successfully
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-on-surface">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={user.name}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-on-surface">
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              disabled
              value={user.email}
              className={`${inputClass} opacity-60 cursor-not-allowed pr-10`}
            />
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant !text-lg">
              lock
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">Email cannot be changed</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="headline" className="text-sm font-medium text-on-surface">
            Headline
          </label>
          <input
            id="headline"
            name="headline"
            type="text"
            maxLength={160}
            defaultValue={user.headline}
            placeholder="e.g. Frontend Developer · Lifelong Learner"
            className={inputClass}
          />
          <p className="text-xs text-on-surface-variant">A short tagline (max 160 chars)</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bio" className="text-sm font-medium text-on-surface">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            maxLength={2000}
            defaultValue={user.bio}
            placeholder="Tell us about yourself..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="website" className="text-sm font-medium text-on-surface">
            Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            defaultValue={user.website}
            placeholder="https://yoursite.com"
            className={inputClass}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  )
}

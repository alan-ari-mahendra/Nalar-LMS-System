import { requireAuth } from "@/lib/auth/guards"
import { ProfileForm } from "./ProfileForm"
import { PasswordForm } from "./PasswordForm"

export default async function SettingsPage() {
  const user = await requireAuth()

  return (
    <div className="space-y-10 max-w-3xl">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Settings</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Manage your profile and account security.
        </p>
      </header>

      <ProfileForm
        user={{
          id: user.id,
          name: user.name ?? "",
          email: user.email,
          avatarUrl: user.avatarUrl,
          headline: user.headline ?? "",
          bio: user.bio ?? "",
          website: user.website ?? "",
        }}
      />

      <PasswordForm />
    </div>
  )
}

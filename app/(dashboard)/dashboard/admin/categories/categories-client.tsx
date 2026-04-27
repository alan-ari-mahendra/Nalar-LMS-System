"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/category"
import { ThumbnailUploader } from "@/components/upload/ThumbnailUploader"

interface CategoryRow {
  id: string
  name: string
  slug: string
  description: string | null
  iconUrl: string | null
  courseCount: number
  createdAt: string
}

export function CategoriesClient({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [iconUrl, setIconUrl] = useState<string | null>(null)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editIcon, setEditIcon] = useState<string | null>(null)

  function resetCreate() {
    setName("")
    setDescription("")
    setIconUrl(null)
    setCreating(false)
  }

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const result = await createCategory({
        name,
        description: description || undefined,
        iconUrl: iconUrl ?? undefined,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      resetCreate()
      router.refresh()
    })
  }

  function startEdit(c: CategoryRow) {
    setEditingId(c.id)
    setEditName(c.name)
    setEditDesc(c.description ?? "")
    setEditIcon(c.iconUrl)
  }

  function handleUpdate(id: string) {
    setError("")
    startTransition(async () => {
      const result = await updateCategory({
        categoryId: id,
        name: editName,
        description: editDesc,
        iconUrl: editIcon,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      setEditingId(null)
      router.refresh()
    })
  }

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete category "${name}"?`)) return
    setError("")
    startTransition(async () => {
      const result = await deleteCategory({ categoryId: id })
      if (!result.success) setError(result.error)
      else router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Categories</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Course categories — {categories.length} total
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(!creating)}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all"
        >
          {creating ? "Cancel" : "+ New Category"}
        </button>
      </div>

      {error && (
        <div className="bg-error-container border border-error/30 rounded-lg px-4 py-2 text-on-error-container text-sm">
          {error}
        </div>
      )}

      {creating && (
        <form
          onSubmit={handleCreate}
          className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-4"
        >
          <h3 className="font-bold">New Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Icon (optional)</label>
            <ThumbnailUploader value={iconUrl} onChange={(u) => setIconUrl(u)} />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-on-primary px-5 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create Category"}
          </button>
        </form>
      )}

      <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-high/40">
            <tr className="text-xs uppercase tracking-wider text-on-surface-variant">
              <th className="text-left px-5 py-3 font-bold">Name</th>
              <th className="text-left px-5 py-3 font-bold">Slug</th>
              <th className="text-left px-5 py-3 font-bold">Courses</th>
              <th className="text-right px-5 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) =>
              editingId === c.id ? (
                <tr key={c.id} className="border-t border-outline-variant bg-surface-container-low">
                  <td colSpan={4} className="px-5 py-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-surface-container border border-outline-variant rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <input
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Description"
                        className="bg-surface-container border border-outline-variant rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <ThumbnailUploader value={editIcon} onChange={setEditIcon} />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdate(c.id)}
                        disabled={isPending}
                        className="bg-primary text-on-primary px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-xs text-on-surface-variant hover:text-on-surface px-2 py-1.5"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={c.id} className="border-t border-outline-variant">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {c.iconUrl ? (
                        <span className="w-8 h-8 rounded-md overflow-hidden bg-surface-container-high inline-flex items-center justify-center">
                          <span
                            className="block w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${c.iconUrl})` }}
                          />
                        </span>
                      ) : (
                        <span className="w-8 h-8 rounded-md bg-surface-container-high inline-flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined !text-base">category</span>
                        </span>
                      )}
                      <div>
                        <p className="font-bold">{c.name}</p>
                        {c.description && (
                          <p className="text-xs text-on-surface-variant">{c.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-on-surface-variant font-mono text-xs">{c.slug}</td>
                  <td className="px-5 py-3">{c.courseCount}</td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, c.name)}
                      disabled={isPending}
                      className="text-xs text-error hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

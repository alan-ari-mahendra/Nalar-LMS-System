"use client"

import { useState, useTransition } from "react"
import { addToWishlist, removeFromWishlist } from "@/lib/actions/wishlist"

interface WishlistButtonProps {
  courseId: string
  initialActive: boolean
  variant?: "card" | "detail"
}

export function WishlistButton({ courseId, initialActive, variant = "card" }: WishlistButtonProps) {
  const [active, setActive] = useState(initialActive)
  const [isPending, startTransition] = useTransition()

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()
    const next = !active
    setActive(next)
    startTransition(async () => {
      const result = next
        ? await addToWishlist({ courseId })
        : await removeFromWishlist({ courseId })
      if (!result.success) {
        setActive(!next)
      }
    })
  }

  if (variant === "detail") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border transition-colors ${
          active
            ? "border-primary bg-primary/10 text-primary"
            : "border-outline-variant bg-surface-container-low text-on-surface hover:border-primary/50"
        } disabled:opacity-50`}
      >
        <span className="material-symbols-outlined !text-base">
          {active ? "favorite" : "favorite_border"}
        </span>
        {active ? "Saved" : "Save"}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${
        active
          ? "bg-primary/30 text-primary"
          : "bg-black/40 text-white hover:bg-black/60"
      } disabled:opacity-60`}
    >
      <span className="material-symbols-outlined !text-lg">
        {active ? "favorite" : "favorite_border"}
      </span>
    </button>
  )
}

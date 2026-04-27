"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createCoupon, updateCoupon, deleteCoupon } from "@/lib/actions/coupon"

interface CouponRow {
  id: string
  code: string
  discountPercent: number
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

export function CouponsClient({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [creating, setCreating] = useState(false)

  const [code, setCode] = useState("")
  const [discount, setDiscount] = useState(10)
  const [maxUses, setMaxUses] = useState<number | "">("")
  const [expires, setExpires] = useState("")

  function resetForm() {
    setCode("")
    setDiscount(10)
    setMaxUses("")
    setExpires("")
    setCreating(false)
  }

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const result = await createCoupon({
        code: code.toUpperCase(),
        discountPercent: discount,
        maxUses: typeof maxUses === "number" && maxUses > 0 ? maxUses : undefined,
        expiresAt: expires ? new Date(expires).toISOString() : undefined,
        isActive: true,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      resetForm()
      router.refresh()
    })
  }

  function toggleActive(id: string, isActive: boolean) {
    setError("")
    startTransition(async () => {
      const result = await updateCoupon({ couponId: id, isActive: !isActive })
      if (!result.success) setError(result.error)
      else router.refresh()
    })
  }

  function handleDelete(id: string, code: string) {
    if (!window.confirm(`Delete coupon "${code}"? Used coupons will be deactivated instead.`)) return
    setError("")
    startTransition(async () => {
      const result = await deleteCoupon({ couponId: id })
      if (!result.success) setError(result.error)
      else router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Coupons</h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Discount codes — {coupons.length} total
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(!creating)}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all"
        >
          {creating ? "Cancel" : "+ New Coupon"}
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
          <h3 className="font-bold">New Coupon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Code (uppercase, A-Z 0-9 _ -)</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                pattern="[A-Z0-9_\-]+"
                minLength={3}
                placeholder="LAUNCH50"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Discount %</label>
              <input
                type="number"
                min={1}
                max={100}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                required
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Uses (optional)</label>
              <input
                type="number"
                min={1}
                value={maxUses}
                onChange={(e) =>
                  setMaxUses(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="Unlimited"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Expires At (optional)</label>
              <input
                type="datetime-local"
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-on-primary px-5 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create Coupon"}
          </button>
        </form>
      )}

      <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-high/40">
            <tr className="text-xs uppercase tracking-wider text-on-surface-variant">
              <th className="text-left px-5 py-3 font-bold">Code</th>
              <th className="text-left px-5 py-3 font-bold">Discount</th>
              <th className="text-left px-5 py-3 font-bold">Uses</th>
              <th className="text-left px-5 py-3 font-bold">Expires</th>
              <th className="text-left px-5 py-3 font-bold">Status</th>
              <th className="text-right px-5 py-3 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm text-on-surface-variant"
                >
                  No coupons yet.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="border-t border-outline-variant">
                  <td className="px-5 py-3 font-mono font-bold">{c.code}</td>
                  <td className="px-5 py-3">{c.discountPercent}%</td>
                  <td className="px-5 py-3 text-on-surface-variant">
                    {c.usedCount} / {c.maxUses ?? "∞"}
                  </td>
                  <td className="px-5 py-3 text-on-surface-variant">
                    {c.expiresAt
                      ? new Date(c.expiresAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Never"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                        c.isActive
                          ? "bg-tertiary-container text-tertiary"
                          : "bg-secondary-container text-on-secondary-container"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => toggleActive(c.id, c.isActive)}
                      disabled={isPending}
                      className="text-xs text-primary hover:underline disabled:opacity-50"
                    >
                      {c.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, c.code)}
                      disabled={isPending}
                      className="text-xs text-error hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

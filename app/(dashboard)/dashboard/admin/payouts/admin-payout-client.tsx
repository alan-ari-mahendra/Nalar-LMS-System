"use client"

import { useState, useTransition, useMemo } from "react"
import { useRouter } from "next/navigation"
import { approvePayout, rejectPayout } from "@/lib/actions/payout"
import { Avatar } from "@/components/shared/Avatar"
import { formatPrice } from "@/lib/utils"

interface PayoutRow {
  id: string
  amount: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  bankName: string
  accountNumber: string
  accountHolder: string
  note: string | null
  rejectReason: string | null
  requestedAt: string
  processedAt: string | null
  instructor: {
    id: string
    name: string | null
    email: string
    avatarUrl: string | null
  }
}

const STATUS_STYLE: Record<PayoutRow["status"], string> = {
  PENDING: "bg-amber-500/20 text-amber-500",
  APPROVED: "bg-tertiary-container text-tertiary",
  REJECTED: "bg-error-container text-on-error-container",
}

export function AdminPayoutClient({ payouts }: { payouts: PayoutRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<"ALL" | PayoutRow["status"]>("PENDING")
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const filtered = useMemo(
    () => (filter === "ALL" ? payouts : payouts.filter((p) => p.status === filter)),
    [payouts, filter]
  )

  function handleApprove(id: string) {
    if (!window.confirm("Approve this payout? This action cannot be undone.")) return
    setError("")
    startTransition(async () => {
      const result = await approvePayout({ payoutId: id })
      if (!result.success) setError(result.error)
      else router.refresh()
    })
  }

  function handleReject(id: string) {
    if (!rejectReason.trim() || rejectReason.trim().length < 5) {
      setError("Reject reason must be at least 5 characters")
      return
    }
    setError("")
    startTransition(async () => {
      const result = await rejectPayout({ payoutId: id, reason: rejectReason.trim() })
      if (!result.success) {
        setError(result.error)
        return
      }
      setRejectingId(null)
      setRejectReason("")
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Payout Approvals</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Review instructor withdrawal requests.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${
              filter === s
                ? "bg-primary text-on-primary"
                : "bg-surface-container border border-outline-variant text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-error-container border border-error/30 rounded-lg px-4 py-2 text-on-error-container text-sm">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-surface-container border border-outline-variant rounded-xl py-12 text-center text-sm text-on-surface-variant">
          No payouts match this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-surface-container border border-outline-variant rounded-xl p-5"
            >
              <div className="flex items-start gap-4 flex-wrap">
                <Avatar
                  src={p.instructor.avatarUrl}
                  name={p.instructor.name ?? "Instructor"}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold">{p.instructor.name ?? "Instructor"}</p>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${STATUS_STYLE[p.status]}`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">{p.instructor.email}</p>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider">
                        Amount
                      </p>
                      <p className="font-bold font-mono">{formatPrice(p.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider">
                        Bank
                      </p>
                      <p className="font-medium">{p.bankName}</p>
                      <p className="font-mono text-xs">{p.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant uppercase tracking-wider">
                        Holder
                      </p>
                      <p className="font-medium">{p.accountHolder}</p>
                    </div>
                  </div>
                  {p.note && (
                    <p className="text-xs text-on-surface-variant mt-2">Note: {p.note}</p>
                  )}
                  {p.rejectReason && (
                    <p className="text-xs text-error mt-2">Rejected: {p.rejectReason}</p>
                  )}
                  <p className="text-xs text-on-surface-variant mt-2">
                    Requested {new Date(p.requestedAt).toLocaleString()}
                  </p>
                </div>
                {p.status === "PENDING" && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApprove(p.id)}
                      disabled={isPending}
                      className="bg-tertiary text-on-primary px-3 py-1.5 rounded-md text-xs font-bold hover:brightness-110 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingId(rejectingId === p.id ? null : p.id)
                        setRejectReason("")
                      }}
                      disabled={isPending}
                      className="border border-outline-variant bg-surface-container-low text-on-surface px-3 py-1.5 rounded-md text-xs font-bold hover:bg-surface-container disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
              {rejectingId === p.id && (
                <div className="mt-4 pt-4 border-t border-outline-variant flex items-center gap-2">
                  <input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason (min 5 chars)"
                    autoFocus
                    className="flex-1 bg-surface-container-low border border-outline-variant rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => handleReject(p.id)}
                    disabled={isPending}
                    className="bg-error text-on-primary px-3 py-1.5 rounded-md text-xs font-bold disabled:opacity-50"
                  >
                    Confirm Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

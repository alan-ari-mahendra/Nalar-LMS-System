"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { requestPayout } from "@/lib/actions/payout"
import { formatPrice } from "@/lib/utils"

interface PayoutItem {
  id: string
  amount: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  bankName: string
  accountNumber: string
  accountHolder: string
  rejectReason: string | null
  requestedAt: string
  processedAt: string | null
}

interface PayoutClientProps {
  balance: number
  defaultName: string
  payouts: PayoutItem[]
}

const STATUS_STYLE: Record<PayoutItem["status"], string> = {
  PENDING: "bg-amber-500/20 text-amber-500",
  APPROVED: "bg-tertiary-container text-tertiary",
  REJECTED: "bg-error-container text-on-error-container",
}

export function PayoutClient({ balance, defaultName, payouts }: PayoutClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState<number>(0)
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountHolder, setAccountHolder] = useState(defaultName)
  const [note, setNote] = useState("")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const result = await requestPayout({
        amount,
        bankName,
        accountNumber,
        accountHolder,
        note: note || undefined,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      setShowForm(false)
      setAmount(0)
      setBankName("")
      setAccountNumber("")
      setNote("")
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Payouts</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Request withdrawals from your earnings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container border border-outline-variant rounded-xl p-5 md:col-span-2">
          <p className="text-xs text-on-surface-variant uppercase tracking-wider">
            Available Balance
          </p>
          <p className="text-3xl font-extrabold mt-1 font-mono">{formatPrice(balance)}</p>
          <p className="text-xs text-on-surface-variant mt-2">
            Earned from completed orders, minus pending and approved payouts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          disabled={balance < 100000 && !showForm}
          className="bg-primary text-on-primary rounded-xl px-5 py-4 font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined !text-base">payments</span>
          {showForm ? "Cancel" : "Request Payout"}
        </button>
      </div>

      {balance < 100000 && !showForm && (
        <p className="text-xs text-on-surface-variant">
          Minimum payout is Rp 100,000. Earn more to enable withdrawals.
        </p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-surface-container border border-outline-variant rounded-xl p-6 space-y-4"
        >
          <h3 className="font-bold">New Payout Request</h3>
          {error && (
            <div className="bg-error-container border border-error/30 rounded-lg px-4 py-2 text-on-error-container text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (IDR)</label>
            <input
              type="number"
              min={100000}
              max={balance}
              step={1000}
              value={amount || ""}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
              placeholder="100000"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bank Name</label>
              <input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
                minLength={2}
                placeholder="BCA, Mandiri, BNI..."
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Account Number</label>
              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
                minLength={4}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Account Holder Name</label>
            <input
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              required
              minLength={2}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Note (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={500}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={isPending || amount < 100000 || amount > balance}
            className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      )}

      <div className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-outline-variant">
          <h3 className="font-bold text-sm">History</h3>
        </div>
        {payouts.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-on-surface-variant">
            No payout requests yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-container-high/40">
              <tr className="text-xs uppercase tracking-wider text-on-surface-variant">
                <th className="text-left px-5 py-3 font-bold">Requested</th>
                <th className="text-left px-5 py-3 font-bold">Amount</th>
                <th className="text-left px-5 py-3 font-bold">Bank</th>
                <th className="text-left px-5 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-t border-outline-variant">
                  <td className="px-5 py-3 text-on-surface-variant">
                    {new Date(p.requestedAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3 font-bold font-mono">{formatPrice(p.amount)}</td>
                  <td className="px-5 py-3">
                    <span className="font-medium">{p.bankName}</span>
                    <span className="block text-xs text-on-surface-variant font-mono">
                      {p.accountNumber}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${STATUS_STYLE[p.status]}`}
                    >
                      {p.status}
                    </span>
                    {p.rejectReason && (
                      <p className="text-xs text-error mt-1">{p.rejectReason}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

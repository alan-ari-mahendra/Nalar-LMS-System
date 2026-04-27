"use client"

export function InvoicePrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:brightness-110 transition-all flex items-center gap-2"
    >
      <span className="material-symbols-outlined !text-base">print</span>
      Print / Save PDF
    </button>
  )
}

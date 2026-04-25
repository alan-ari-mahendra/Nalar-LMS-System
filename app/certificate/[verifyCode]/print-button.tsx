"use client"

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:brightness-110 transition-all print:hidden"
    >
      <span className="material-symbols-outlined !text-lg">print</span>
      Print Certificate
    </button>
  )
}

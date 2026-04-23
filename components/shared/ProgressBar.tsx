interface ProgressBarProps {
  value: number
  size?: "sm" | "md"
  showLabel?: boolean
}

export function ProgressBar({ value, size = "md", showLabel = false }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const height = size === "sm" ? "h-1.5" : "h-2.5"

  return (
    <div className="flex items-center gap-2">
      <div className={`flex-1 ${height} rounded-full bg-surface-container-highest overflow-hidden`}>
        <div
          className={`${height} rounded-full bg-primary transition-all duration-300`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-on-surface-variant font-medium shrink-0">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  )
}

export default ProgressBar

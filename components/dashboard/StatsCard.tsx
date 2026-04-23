interface StatsCardProps {
  title: string
  value: string | number
  icon: string
  trend?: number
  suffix?: string
}

export function StatsCard({ title, value, icon, trend, suffix }: StatsCardProps) {
  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">
            {title}
          </p>
          <p className="text-2xl font-bold text-on-surface mt-1">
            {value}
            {suffix && (
              <span className="text-sm font-normal text-on-surface-variant ml-1">
                {suffix}
              </span>
            )}
          </p>
          {trend !== undefined && (
            <p
              className={`text-xs font-medium mt-1 ${
                trend >= 0 ? "text-tertiary" : "text-error"
              }`}
            >
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
              <span className="text-on-surface-variant ml-1">vs last month</span>
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary">{icon}</span>
        </div>
      </div>
    </div>
  )
}

export default StatsCard

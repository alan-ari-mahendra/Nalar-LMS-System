import { requireRole } from "@/lib/auth/guards"
import { getInstructorRevenue } from "@/lib/actions/instructor"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { RevenueChart } from "@/components/dashboard/RevenueChart"
import { Avatar } from "@/components/shared/Avatar"
import { formatPrice } from "@/lib/utils"
import type { InstructorOrder } from "@/lib/actions/instructor"

export default async function InstructorRevenuePage() {
  await requireRole(["TEACHER", "ADMIN"])
  const data = await getInstructorRevenue()
  const hasOrders = data.totalOrders > 0

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">Revenue</h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Earnings, orders, and per-course breakdown.
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Revenue"
          value={formatPrice(data.totalRevenue)}
          icon="payments"
        />
        <StatsCard
          title="This Month"
          value={formatPrice(data.thisMonthRevenue)}
          icon="calendar_month"
        />
        <StatsCard title="Total Orders" value={data.totalOrders} icon="receipt_long" />
      </section>

      {/* Chart */}
      <section className="bg-surface-container border border-outline-variant rounded-xl p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Revenue Trend</h2>
            <p className="text-sm text-on-surface-variant">Last 12 months</p>
          </div>
        </div>
        {data.monthlyBreakdown.length > 0 ? (
          <RevenueChart data={data.monthlyBreakdown} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined !text-5xl mb-4 opacity-40">show_chart</span>
            <p className="text-sm">No revenue data yet</p>
          </div>
        )}
      </section>

      {/* Per-course table */}
      <section className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <h2 className="font-bold text-on-surface">Revenue by Course</h2>
        </div>
        {data.perCourse.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined !text-5xl mb-4 opacity-40">menu_book</span>
            <p className="text-sm">No courses yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-high/50 text-[11px] uppercase tracking-wider text-on-surface-variant">
                  <th className="px-6 py-4 font-semibold">Course</th>
                  <th className="px-6 py-4 font-semibold">Students</th>
                  <th className="px-6 py-4 font-semibold">Revenue</th>
                  <th className="px-6 py-4 font-semibold">Avg Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {data.perCourse.map((c) => (
                  <tr key={c.courseId} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-on-surface line-clamp-1">
                        {c.title}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface">{c.studentCount}</td>
                    <td className="px-6 py-4 text-sm font-bold text-on-surface">
                      {c.revenue > 0 ? formatPrice(c.revenue) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">
                      {c.avgOrder > 0 ? formatPrice(c.avgOrder) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent transactions */}
      <section className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
        <div className="p-6 border-b border-outline-variant">
          <h2 className="font-bold text-on-surface">Recent Transactions</h2>
        </div>
        {!hasOrders ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined !text-5xl mb-4 opacity-40">receipt_long</span>
            <p className="text-sm text-center max-w-sm px-4">
              Revenue data will appear after your first sale.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {data.recentOrders.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function OrderRow({ order }: { order: InstructorOrder }) {
  const date = new Date(order.paidAt ?? order.createdAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  return (
    <li className="px-6 py-4 flex items-center gap-4 hover:bg-surface-container-high/30 transition-colors">
      <Avatar src={order.student.avatarUrl} name={order.student.name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-on-surface truncate">{order.student.name}</p>
        <p className="text-xs text-on-surface-variant truncate">{order.course.title}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-on-surface">{formatPrice(order.amount)}</p>
        <p className="text-xs text-on-surface-variant">{date}</p>
      </div>
      <OrderStatusBadge status={order.status} />
    </li>
  )
}

function OrderStatusBadge({ status }: { status: InstructorOrder["status"] }) {
  const cls = {
    COMPLETED: "bg-tertiary-container text-tertiary",
    PENDING: "bg-amber-500/20 text-amber-500",
    REFUNDED: "bg-error-container text-on-error-container",
    FAILED: "bg-error-container text-on-error-container",
  }[status]

  return (
    <span
      className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${cls}`}
    >
      {status}
    </span>
  )
}

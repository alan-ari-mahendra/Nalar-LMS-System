"use client"

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"
import { formatPrice } from "@/lib/utils"

interface AnalyticsData {
  summary: {
    totalUsers: number
    totalCourses: number
    totalEnrollments: number
    totalRevenue: number
  }
  usersByRole: { role: string; count: number }[]
  courseStatus: { status: string; count: number }[]
  dailyTrend: { day: string; revenue: number; enrollments: number }[]
}

const ROLE_COLORS = ["#a78bfa", "#34d399", "#f59e0b", "#ef4444"]
const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "#34d399",
  DRAFT: "#71717a",
  PENDING_REVIEW: "#f59e0b",
  ARCHIVED: "#52525b",
}

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const trendData = data.dailyTrend.map((d) => ({
    ...d,
    label: d.day.slice(5),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Analytics</h1>
        <p className="text-on-surface-variant text-sm mt-1">Last 30 days</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Users" value={data.summary.totalUsers.toLocaleString()} icon="group" />
        <SummaryCard label="Total Courses" value={data.summary.totalCourses.toLocaleString()} icon="menu_book" />
        <SummaryCard
          label="Enrollments"
          value={data.summary.totalEnrollments.toLocaleString()}
          icon="school"
        />
        <SummaryCard
          label="Total Revenue"
          value={formatPrice(data.summary.totalRevenue)}
          icon="payments"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue trend */}
        <div className="bg-surface-container border border-outline-variant rounded-xl p-5">
          <h3 className="font-bold mb-4">Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="label" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    background: "#121215",
                    border: "1px solid #27272a",
                    borderRadius: 8,
                    color: "#fafafa",
                  }}
                  formatter={(v) => formatPrice(Number(v))}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enrollment trend */}
        <div className="bg-surface-container border border-outline-variant rounded-xl p-5">
          <h3 className="font-bold mb-4">Enrollments per Day</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="label" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#121215",
                    border: "1px solid #27272a",
                    borderRadius: 8,
                    color: "#fafafa",
                  }}
                />
                <Bar dataKey="enrollments" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Users by role */}
        <div className="bg-surface-container border border-outline-variant rounded-xl p-5">
          <h3 className="font-bold mb-4">Users by Role</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.usersByRole}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                >
                  {data.usersByRole.map((_, idx) => (
                    <Cell key={idx} fill={ROLE_COLORS[idx % ROLE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#121215",
                    border: "1px solid #27272a",
                    borderRadius: 8,
                    color: "#fafafa",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course status */}
        <div className="bg-surface-container border border-outline-variant rounded-xl p-5">
          <h3 className="font-bold mb-4">Courses by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.courseStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis type="number" stroke="#71717a" fontSize={11} />
                <YAxis type="category" dataKey="status" stroke="#71717a" fontSize={11} width={120} />
                <Tooltip
                  contentStyle={{
                    background: "#121215",
                    border: "1px solid #27272a",
                    borderRadius: 8,
                    color: "#fafafa",
                  }}
                />
                <Bar dataKey="count">
                  {data.courseStatus.map((s, idx) => (
                    <Cell key={idx} fill={STATUS_COLORS[s.status] ?? "#a78bfa"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl p-5">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary !text-xl">{icon}</span>
        <p className="text-xs text-on-surface-variant uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-extrabold mt-2">{value}</p>
    </div>
  )
}

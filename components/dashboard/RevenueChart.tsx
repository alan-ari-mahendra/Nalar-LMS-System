"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { MonthlyRevenue } from "@/type"

interface RevenueChartProps {
  data: MonthlyRevenue[]
}

function formatChartValue(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(value)
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis
          dataKey="month"
          stroke="#a1a1aa"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#a1a1aa"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatChartValue}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "8px",
            color: "#fafafa",
            fontSize: "12px",
          }}
          formatter={(value) => [
            `Rp ${Number(value).toLocaleString("id-ID")}`,
            "Revenue",
          ]}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#a78bfa"
          strokeWidth={2}
          dot={{ fill: "#a78bfa", r: 4 }}
          activeDot={{ r: 6, fill: "#a78bfa" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default RevenueChart

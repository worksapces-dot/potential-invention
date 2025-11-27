'use client'

import { Card } from '@/components/ui/card'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

type Props = {
  data: {
    date: string
    revenue: number
    sales: number
  }[]
}

export default function RevenueChart({ data }: Props) {
  return (
    <div className="border-2 border-[#3352CC] rounded-2xl p-6 bg-[#1A1A1D]">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-1">Revenue Overview</h3>
        <p className="text-sm text-[#9D9D9D]">Your earnings over time</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3352CC" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3352CC" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="date"
            stroke="#9D9D9D"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#9D9D9D"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1A1D',
              border: '2px solid #3352CC',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: any) => [`$${value}`, 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3352CC"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

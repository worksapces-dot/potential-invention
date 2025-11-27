'use client'

import { Card } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

type Props = {
  data: {
    name: string
    sales: number
    revenue: number
  }[]
}

const COLORS = ['#3352CC', '#5577FF', '#7799FF', '#99BBFF', '#BBDDFF']

export default function SalesChart({ data }: Props) {
  return (
    <div className="border-2 border-[#3352CC] rounded-2xl p-6 bg-[#1A1A1D]">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-1">Top Products</h3>
        <p className="text-sm text-[#9D9D9D]">Best selling products</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis type="number" stroke="#9D9D9D" style={{ fontSize: '12px' }} />
          <YAxis
            dataKey="name"
            type="category"
            stroke="#9D9D9D"
            style={{ fontSize: '12px' }}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A1A1D',
              border: '2px solid #3352CC',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: any, name: string) => {
              if (name === 'sales') return [value, 'Sales']
              if (name === 'revenue') return [`$${value}`, 'Revenue']
              return [value, name]
            }}
          />
          <Bar dataKey="sales" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

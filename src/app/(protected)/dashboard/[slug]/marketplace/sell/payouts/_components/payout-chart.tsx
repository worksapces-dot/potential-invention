'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

type Props = {
  data: any[]
}

export default function PayoutChart({ data }: Props) {
  // Transform Stripe payout data for chart
  const chartData = data
    .filter(payout => payout.status === 'paid')
    .slice(-7) // Last 7 payouts
    .map(payout => ({
      date: new Date(payout.created * 1000).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      amount: payout.amount / 100, // Convert from cents
    }))

  if (chartData.length === 0) {
    return (
      <div className="border-2 border-[#3352CC] rounded-2xl p-6 bg-[#1A1A1D]">
        <h2 className="text-xl font-bold mb-4">Payout History</h2>
        <div className="flex items-center justify-center h-64 text-[#9D9D9D]">
          No payout data available
        </div>
      </div>
    )
  }

  return (
    <div className="border-2 border-[#3352CC] rounded-2xl p-6 bg-[#1A1A1D]">
      <h2 className="text-xl font-bold mb-4">Payout History</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3352CC" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="#9D9D9D"
              fontSize={12}
            />
            <YAxis 
              stroke="#9D9D9D"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1A1A1D',
                border: '1px solid #3352CC',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: any) => [`$${value.toFixed(2)}`, 'Payout']}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#3352CC" 
              strokeWidth={3}
              dot={{ fill: '#3352CC', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3352CC', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
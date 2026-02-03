'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useCurrency } from '@/contexts/CurrencyContext'

interface TrendData {
  month: string
  expenses: number
  savings: number
}

interface TrendChartProps {
  data: TrendData[]
}

export function TrendChart({ data }: TrendChartProps) {
  const { formatCompact } = useCurrency()
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card px-4 py-3 rounded-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCompact(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="month" 
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
        />
        <YAxis 
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          tickFormatter={(value: number) => formatCompact(value)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ paddingTop: '10px' }}
          formatter={(value: string) => <span className="text-gray-300 text-sm">{value}</span>}
        />
        <Area
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke="#f43f5e"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#expenseGradient)"
        />
        <Area
          type="monotone"
          dataKey="savings"
          name="Savings"
          stroke="#10b981"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#savingsGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

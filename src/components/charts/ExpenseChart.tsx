'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useCurrency } from '@/contexts/CurrencyContext'

interface ExpenseData {
  category: string
  label: string
  total: number
  color: string
}

interface ExpenseChartProps {
  data: ExpenseData[]
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  const { formatCompact } = useCurrency()
  const total = data.reduce((sum, item) => sum + item.total, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      const percentage = ((item.total / total) * 100).toFixed(1)
      return (
        <div className="glass-card px-3 py-2 rounded-lg">
          <p className="text-white font-medium">{item.label}</p>
          <p className="text-gray-300 text-sm">
            {formatCompact(item.total)} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const renderLegend = () => {
    return (
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.slice(0, 6).map((item) => (
          <div key={item.category} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-300 text-xs truncate">{item.label}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Center Total */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-20px' }}>
        <div className="text-center">
          <p className="text-gray-400 text-xs">Total</p>
          <p className="text-white text-lg font-bold">{formatCompact(total)}</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="total"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      {renderLegend()}
    </div>
  )
}

import { useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Column, Row } from '../types/spreadsheet'

interface ChartViewProps {
  columns: Column[]
  rows: Row[]
}

type ChartType = 'bar' | 'line'

export function ChartView({ columns, rows }: ChartViewProps) {
  const [chartType, setChartType] = useState<ChartType>('bar')
  const [xKey, setXKey] = useState<string>(columns[0]?.key ?? '')
  const [yKey, setYKey] = useState<string>(columns[1]?.key ?? columns[0]?.key ?? '')

  if (columns.length === 0) {
    return (
      <p className="text-center text-gray-400 text-sm py-12">Нет данных для визуализации</p>
    )
  }

  const data = rows.map((row) => ({
    x: row[xKey] != null ? String(row[xKey]) : '',
    y: typeof row[yKey] === 'number' ? (row[yKey] as number) : Number(row[yKey]) || 0,
  }))

  const xCol = columns.find((c) => c.key === xKey)
  const yCol = columns.find((c) => c.key === yKey)

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Тип графика</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="bar">Столбчатый</option>
            <option value="line">Линейный</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Ось X</label>
          <select
            value={xKey}
            onChange={(e) => setXKey(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            {columns.map((col) => (
              <option key={col.key} value={col.key}>
                {col.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Ось Y</label>
          <select
            value={yKey}
            onChange={(e) => setYKey(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            {columns.map((col) => (
              <option key={col.key} value={col.key}>
                {col.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <ResponsiveContainer width="100%" height={360}>
          {chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="x"
                tick={{ fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                label={{ value: xCol?.label ?? '', position: 'insideBottom', offset: -30, fontSize: 12 }}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                label={{ value: yCol?.label ?? '', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip />
              <Bar dataKey="y" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="x"
                tick={{ fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                label={{ value: xCol?.label ?? '', position: 'insideBottom', offset: -30, fontSize: 12 }}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                label={{ value: yCol?.label ?? '', angle: -90, position: 'insideLeft', fontSize: 12 }}
              />
              <Tooltip />
              <Line type="monotone" dataKey="y" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { useQuery } from 'react-query'
import api from '../api'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { formatCurrency, formatDate } from '../Utils/formatters'
import toast from 'react-hot-toast'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4']

const REPORT_TYPES = [
  { id: 'profit-loss', label: 'Profit & Loss', icon: '📊', desc: 'Income vs expenses overview' },
  { id: 'cash-flow', label: 'Cash Flow', icon: '💧', desc: 'Money in and out over time' },
  { id: 'expense-breakdown', label: 'Expense Analysis', icon: '🔍', desc: 'Spending by category' },
  { id: 'income-breakdown', label: 'Income Analysis', icon: '💰', desc: 'Revenue by category' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-xl text-sm">
        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Reports() {
  const [reportType, setReportType] = useState('profit-loss')
  const [dateRange, setDateRange] = useState('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const { data, isLoading, refetch } = useQuery(
    ['report', reportType, dateRange, startDate, endDate],
    async () => {
      const params = new URLSearchParams({ range: dateRange })
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      const res = await api.get(`/reports/profit-loss?${params}`)
      return res.data
    }
  )

  const handleExport = (format) => {
    toast.success(`Exporting ${format.toUpperCase()} report...`)
  }

  const { total_income = 0, total_expenses = 0, profit = 0, profit_margin = 0, expense_breakdown = [], income_breakdown = [], monthly_data = [] } = data || {}

  const summaryCards = [
    { label: 'Total Revenue', value: formatCurrency(total_income), gradient: 'from-emerald-500 to-teal-600', icon: '💰' },
    { label: 'Total Expenses', value: formatCurrency(total_expenses), gradient: 'from-red-500 to-rose-600', icon: '💸' },
    { label: 'Net Profit', value: formatCurrency(profit), gradient: profit >= 0 ? 'from-blue-500 to-indigo-600' : 'from-orange-500 to-red-600', icon: '📈' },
    { label: 'Profit Margin', value: `${Number(profit_margin || 0).toFixed(1)}%`, gradient: 'from-purple-500 to-violet-600', icon: '🎯' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Analyze your financial performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => handleExport('pdf')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>PDF</span>
          </button>
          <button onClick={() => handleExport('excel')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {REPORT_TYPES.map((rt) => (
          <button key={rt.id} onClick={() => setReportType(rt.id)}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              reportType === rt.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
            }`}>
            <div className="text-2xl mb-2">{rt.icon}</div>
            <p className={`text-sm font-semibold ${reportType === rt.id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
              {rt.label}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{rt.desc}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex rounded-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
            {[['week', 'Week'], ['month', 'Month'], ['quarter', 'Quarter'], ['year', 'Year']].map(([val, label]) => (
              <button key={val} onClick={() => setDateRange(val)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  dateRange === val ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>or custom:</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span>to</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-2xl" />)}
          </div>
          <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {summaryCards.map((card) => (
              <div key={card.label} className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-5 text-white shadow-lg`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white/80">{card.label}</p>
                  <span className="text-xl">{card.icon}</span>
                </div>
                <p className="text-xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Main Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">
              {REPORT_TYPES.find(r => r.id === reportType)?.label} Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: 'Income', value: total_income, fill: '#10b981' },
                { name: 'Expenses', value: total_expenses, fill: '#ef4444' },
                { name: 'Profit', value: Math.max(profit, 0), fill: '#3b82f6' },
              ]} barSize={56}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {[{ fill: '#10b981' }, { fill: '#ef4444' }, { fill: '#3b82f6' }].map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Expense by Category</h3>
              {expense_breakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={expense_breakdown} dataKey="total" nameKey="category.name" cx="50%" cy="50%" innerRadius={50} outerRadius={85}>
                        {expense_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {expense_breakdown.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-gray-600 dark:text-gray-400">{item.category?.name || 'Other'}</span>
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No expense data available</div>
              )}
            </div>

            {/* Income Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Income by Category</h3>
              {income_breakdown && income_breakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={income_breakdown} dataKey="total" nameKey="category.name" cx="50%" cy="50%" innerRadius={50} outerRadius={85}>
                        {income_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {income_breakdown.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-gray-600 dark:text-gray-400">{item.category?.name || 'Other'}</span>
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No income breakdown available</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

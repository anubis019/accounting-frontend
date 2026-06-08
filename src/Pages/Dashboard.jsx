import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../api'
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { formatCurrency, formatDate } from '../Utils/formatters'
import { useAuth } from '../Contexts/AuthContext'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

function StatCard({ title, value, change, icon, gradient, textColor }) {
  const isPositive = change >= 0
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 ${gradient} shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/80 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${textColor || 'text-white'}`}>{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-xs font-medium ${isPositive ? 'text-emerald-200' : 'text-red-200'}`}>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isPositive ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
              </svg>
              {Math.abs(change)}% vs last period
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl">
          {icon}
        </div>
      </div>
      {/* Decorative circle */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/10" />
    </div>
  )
}

function QuickAction({ to, icon, label, color }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed ${color} hover:scale-105 transition-transform cursor-pointer`}
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">{label}</span>
    </Link>
  )
}

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

export default function Dashboard() {
  const [dateRange, setDateRange] = useState('month')
  const { user } = useAuth()

  const { data, isLoading } = useQuery(['dashboard', dateRange], async () => {
    const response = await api.get(`/reports/profit-loss?range=${dateRange}`)
    return response.data
  })

  const { data: txData } = useQuery('recent-transactions', async () => {
    const response = await api.get('/transactions?per_page=5')
    return response.data
  })

  const { data: budgetData } = useQuery('budgets-summary', async () => {
    const response = await api.get('/budgets')
    return response.data
  })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        </div>
      </div>
    )
  }

  const { total_income = 0, total_expenses = 0, profit = 0, profit_margin = 0, expense_breakdown = [] } = data || {}

  const barData = [
    { name: 'Income', amount: total_income, fill: '#10b981' },
    { name: 'Expenses', amount: total_expenses, fill: '#ef4444' },
    { name: 'Profit', amount: Math.max(profit, 0), fill: '#3b82f6' },
  ]

  const recentTxns = txData?.data || txData || []
  const budgets = budgetData?.data || budgetData || []

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Here's what's happening with your finances today.
          </p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="self-start sm:self-auto px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Income"
          value={formatCurrency(total_income)}
          change={12}
          icon="💰"
          gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(total_expenses)}
          change={-5}
          icon="💸"
          gradient="bg-gradient-to-br from-red-500 to-rose-600"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(profit)}
          change={profit >= 0 ? 8 : -8}
          icon="📈"
          gradient={profit >= 0 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-orange-500 to-red-600'}
        />
        <StatCard
          title="Profit Margin"
          value={`${Number(profit_margin || 0).toFixed(1)}%`}
          change={3}
          icon="🎯"
          gradient="bg-gradient-to-br from-purple-500 to-violet-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Financial Overview</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Income, expenses & profit comparison</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Expense Breakdown</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">By category</p>
          </div>
          {expense_breakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={expense_breakdown}
                    dataKey="total"
                    nameKey="category.name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                  >
                    {expense_breakdown.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {expense_breakdown.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600 dark:text-gray-400 truncate max-w-[100px]">
                        {item.category?.name || 'Other'}
                      </span>
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <svg className="w-12 h-12 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <p className="text-sm">No expense data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest financial activity</p>
            </div>
            <Link to="/transactions" className="text-xs font-medium text-blue-600 hover:text-blue-500 flex items-center space-x-1">
              <span>View all</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {recentTxns.length > 0 ? (
            <div className="space-y-3">
              {recentTxns.slice(0, 5).map((txn, i) => (
                <div key={txn.id || i} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                      txn.type === 'income'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                    }`}>
                      {txn.type === 'income' ? '↑' : '↓'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[180px]">
                        {txn.description || 'Transaction'}
                      </p>
                      <p className="text-xs text-gray-400">{formatDate(txn.transaction_date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${txn.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      txn.type === 'income'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {txn.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm mb-2">No transactions yet</p>
              <Link to="/transactions" className="text-xs text-blue-600 hover:text-blue-500 font-medium">
                Add your first transaction →
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions + Budget Summary */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction to="/transactions" icon="💳" label="Add Transaction" color="border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20" />
              <QuickAction to="/inventory" icon="📦" label="Add Product" color="border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20" />
              <QuickAction to="/budgets" icon="🎯" label="Set Budget" color="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" />
              <QuickAction to="/reports" icon="📊" label="View Reports" color="border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20" />
            </div>
          </div>

          {/* Budget Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Budget Status</h3>
              <Link to="/budgets" className="text-xs text-blue-600 hover:text-blue-500 font-medium">Manage</Link>
            </div>
            {budgets.length > 0 ? (
              <div className="space-y-3">
                {budgets.slice(0, 3).map((budget, i) => {
                  const spent = budget.spent || 0
                  const limit = budget.amount || 1
                  const pct = Math.min((spent / limit) * 100, 100)
                  const isOver = pct >= 90
                  return (
                    <div key={budget.id || i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                          {budget.category?.name || budget.name || 'Budget'}
                        </span>
                        <span className={`font-semibold ${isOver ? 'text-red-500' : 'text-gray-500'}`}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${isOver ? 'bg-red-500' : pct > 70 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                <p className="text-sm mb-1">No budgets set</p>
                <Link to="/budgets" className="text-xs text-blue-600 hover:text-blue-500 font-medium">
                  Create a budget →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../api'
import { formatCurrency } from '../Utils/formatters'
import toast from 'react-hot-toast'

const CATEGORIES = ['Food & Dining', 'Transport', 'Utilities', 'Rent', 'Salaries', 'Marketing', 'Supplies', 'Entertainment', 'Healthcare', 'Other']

const emptyForm = { name: '', category: '', amount: '', period: 'monthly', start_date: '', end_date: '' }

function BudgetCard({ budget, onDelete }) {
  const spent = Number(budget.spent || 0)
  const limit = Number(budget.amount || 1)
  const pct = Math.min((spent / limit) * 100, 100)
  const remaining = limit - spent
  const isOver = pct >= 100
  const isWarning = pct >= 80 && pct < 100

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border ${isOver ? 'border-red-200 dark:border-red-800' : isWarning ? 'border-orange-200 dark:border-orange-800' : 'border-gray-200 dark:border-gray-700'} p-5 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{budget.name || budget.category?.name || 'Budget'}</h3>
          <div className="flex items-center space-x-2 mt-1">
            {budget.category?.name && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                {budget.category.name}
              </span>
            )}
            <span className="text-xs text-gray-400 capitalize">{budget.period || 'monthly'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isOver && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Over Budget
            </span>
          )}
          {isWarning && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
              Near Limit
            </span>
          )}
          <button onClick={() => onDelete(budget.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-500">Spent: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(spent)}</span></span>
          <span className={`font-bold ${isOver ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-gray-600 dark:text-gray-400'}`}>
            {pct.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-emerald-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-0.5">Budget</p>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{formatCurrency(limit)}</p>
        </div>
        <div className={`rounded-xl p-3 ${isOver ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
          <p className="text-xs text-gray-400 mb-0.5">Remaining</p>
          <p className={`text-sm font-bold ${isOver ? 'text-red-600' : 'text-emerald-600'}`}>
            {isOver ? `-${formatCurrency(Math.abs(remaining))}` : formatCurrency(remaining)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Budgets() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery('budgets', async () => {
    const res = await api.get('/budgets')
    return res.data
  })

  const createMutation = useMutation(
    (payload) => api.post('/budgets', payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('budgets')
        queryClient.invalidateQueries('budgets-summary')
        toast.success('Budget created!')
        setForm(emptyForm)
        setShowForm(false)
      },
      onError: (err) => toast.error(err.response?.data?.error || 'Failed to create budget'),
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/budgets/${id}`),
    {
      onSuccess: () => { queryClient.invalidateQueries('budgets'); toast.success('Budget deleted') },
      onError: () => toast.error('Failed to delete'),
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.amount || !form.name) { toast.error('Name and amount are required'); return }
    createMutation.mutate({ ...form, amount: parseFloat(form.amount) })
  }

  const budgets = data?.data || data || []
  const totalBudget = budgets.reduce((s, b) => s + Number(b.amount || 0), 0)
  const totalSpent = budgets.reduce((s, b) => s + Number(b.spent || 0), 0)
  const overBudgetCount = budgets.filter(b => Number(b.spent || 0) >= Number(b.amount || 0)).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Set and track your spending limits</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Budget</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-sm text-white/80 mb-1">Total Budgeted</p>
          <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-sm text-white/80 mb-1">Total Spent</p>
          <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
          <p className="text-xs text-white/70 mt-1">
            {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(0)}% of budget` : '—'}
          </p>
        </div>
        <div className={`bg-gradient-to-br ${overBudgetCount > 0 ? 'from-red-500 to-rose-600' : 'from-purple-500 to-violet-600'} rounded-2xl p-5 text-white shadow-lg`}>
          <p className="text-sm text-white/80 mb-1">Over Budget</p>
          <p className="text-2xl font-bold">{overBudgetCount}</p>
          <p className="text-xs text-white/70 mt-1">{overBudgetCount > 0 ? 'Needs attention' : 'All on track'}</p>
        </div>
      </div>

      {/* Overall progress */}
      {budgets.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Overall Budget Usage</h3>
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
              {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${
                totalSpent >= totalBudget ? 'bg-red-500' : totalSpent / totalBudget > 0.8 ? 'bg-orange-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>{formatCurrency(totalSpent)} spent</span>
            <span>{formatCurrency(totalBudget - totalSpent)} remaining</span>
          </div>
        </div>
      )}

      {/* Add Budget Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Create Budget</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Budget Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g. Monthly Marketing" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Budget Amount (KES) *</label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Period</label>
              <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Start Date</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">End Date</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm) }}
                className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={createMutation.isLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-600 disabled:opacity-60 transition-all">
                {createMutation.isLoading ? 'Creating...' : 'Create Budget'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center py-16 text-gray-400">
          <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-base font-medium mb-1">No budgets yet</p>
          <p className="text-sm">Create your first budget to start tracking spending</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} onDelete={(id) => deleteMutation.mutate(id)} />
          ))}
        </div>
      )}
    </div>
  )
}

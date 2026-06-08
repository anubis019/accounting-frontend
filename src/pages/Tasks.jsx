import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../api'
import { formatDate } from '../Utils/formatters'
import toast from 'react-hot-toast'

const PRIORITIES = ['low', 'medium', 'high', 'urgent']
const STATUSES = ['pending', 'in_progress', 'completed', 'cancelled']

const PRIORITY_STYLES = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-500',
}

const emptyForm = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  due_date: '',
  assigned_to: '',
}

export default function Tasks() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery('tasks', async () => {
    const res = await api.get('/tasks')
    return res.data
  })

  const createMutation = useMutation(
    (payload) => api.post('/tasks', payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('tasks')
        toast.success('Task created!')
        setForm(emptyForm)
        setShowForm(false)
      },
      onError: (err) => toast.error(err.response?.data?.error || 'Failed to create task'),
    }
  )

  const updateMutation = useMutation(
    ({ id, ...payload }) => api.put(`/tasks/${id}`, payload),
    {
      onSuccess: () => { queryClient.invalidateQueries('tasks'); toast.success('Task updated') },
      onError: () => toast.error('Failed to update task'),
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/tasks/${id}`),
    {
      onSuccess: () => { queryClient.invalidateQueries('tasks'); toast.success('Task deleted') },
      onError: () => toast.error('Failed to delete'),
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title) { toast.error('Task title is required'); return }
    createMutation.mutate(form)
  }

  const toggleComplete = (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    updateMutation.mutate({ id: task.id, status: newStatus })
  }

  const tasks = data?.data || data || []

  const filtered = tasks.filter((t) => {
    const matchStatus = filterStatus === 'all' || t.status === filterStatus
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority
    return matchStatus && matchPriority
  })

  const counts = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    urgent: tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length,
  }

  const isOverdue = (task) => {
    if (!task.due_date || task.status === 'completed') return false
    return new Date(task.due_date) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your to-dos and action items</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Task</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-sm text-white/80 mb-1">Total Tasks</p>
          <p className="text-2xl font-bold">{counts.total}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-sm text-white/80 mb-1">Completed</p>
          <p className="text-2xl font-bold">{counts.completed}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-sm text-white/80 mb-1">Pending</p>
          <p className="text-2xl font-bold">{counts.pending}</p>
        </div>
        <div className={`bg-gradient-to-br ${counts.urgent > 0 ? 'from-red-500 to-rose-600' : 'from-purple-500 to-violet-600'} rounded-2xl p-5 text-white shadow-lg`}>
          <p className="text-sm text-white/80 mb-1">Urgent</p>
          <p className="text-2xl font-bold">{counts.urgent}</p>
        </div>
      </div>

      {/* Progress bar */}
      {counts.total > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Overall Progress</span>
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
              {counts.total > 0 ? `${Math.round((counts.completed / counts.total) * 100)}%` : '0%'}
            </span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700"
              style={{ width: `${counts.total > 0 ? (counts.completed / counts.total) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{counts.completed} of {counts.total} tasks completed</p>
        </div>
      )}

      {/* Add Task Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">New Task</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Task Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Prepare monthly financial report" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Optional description..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Priority</label>
              <div className="grid grid-cols-4 gap-1.5">
                {PRIORITIES.map((p) => (
                  <button key={p} type="button" onClick={() => setForm({ ...form, priority: p })}
                    className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all capitalize ${
                      form.priority === p ? PRIORITY_STYLES[p] + ' border-current' : 'border-gray-200 dark:border-gray-700 text-gray-500'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Due Date</label>
              <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="sm:col-span-2 flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm) }}
                className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={createMutation.isLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-blue-600 disabled:opacity-60 transition-all">
                {createMutation.isLoading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex rounded-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
            {['all', ...STATUSES].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 text-xs font-medium transition-colors capitalize ${
                  filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}>
                {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex rounded-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
            {['all', ...PRIORITIES].map((p) => (
              <button key={p} onClick={() => setFilterPriority(p)}
                className={`px-3 py-2 text-xs font-medium transition-colors capitalize ${
                  filterPriority === p ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p className="text-base font-medium mb-1">No tasks found</p>
            <p className="text-sm">Create your first task to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {filtered.map((task) => {
              const overdue = isOverdue(task)
              return (
                <div key={task.id} className={`flex items-start p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${task.status === 'completed' ? 'opacity-60' : ''}`}>
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleComplete(task)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      task.status === 'completed'
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-gray-300 dark:border-gray-600 hover:border-emerald-500'
                    }`}
                  >
                    {task.status === 'completed' && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                        {task.title}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_STYLES[task.priority] || ''}`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[task.status] || ''}`}>
                        {task.status === 'in_progress' ? 'In Progress' : task.status}
                      </span>
                      {overdue && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Overdue
                        </span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-gray-400 truncate">{task.description}</p>
                    )}
                    {task.due_date && (
                      <p className={`text-xs mt-1 flex items-center space-x-1 ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Due {formatDate(task.due_date)}</span>
                      </p>
                    )}
                  </div>

                  <div className="ml-3 flex items-center space-x-1">
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => updateMutation.mutate({ id: task.id, status: 'in_progress' })}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Mark in progress"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                    <button onClick={() => deleteMutation.mutate(task.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

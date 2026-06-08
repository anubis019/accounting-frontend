import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../api'
import { formatCurrency, formatNumber } from '../Utils/formatters'
import toast from 'react-hot-toast'

const emptyForm = {
  name: '',
  sku: '',
  description: '',
  quantity: '',
  unit_price: '',
  cost_price: '',
  reorder_level: '',
  category: '',
}

function StockBadge({ qty, reorder }) {
  if (qty === 0) return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Out of Stock</span>
  if (qty <= (reorder || 5)) return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Low Stock</span>
  return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">In Stock</span>
}

export default function Inventory() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [filterStock, setFilterStock] = useState('all')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery('inventory', async () => {
    const res = await api.get('/inventory')
    return res.data
  })

  const createMutation = useMutation(
    (payload) => api.post('/inventory', payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('inventory')
        toast.success('Product added!')
        setForm(emptyForm)
        setShowForm(false)
      },
      onError: (err) => toast.error(err.response?.data?.error || 'Failed to add product'),
    }
  )

  const deleteMutation = useMutation(
    (id) => api.delete(`/inventory/${id}`),
    {
      onSuccess: () => { queryClient.invalidateQueries('inventory'); toast.success('Product deleted') },
      onError: () => toast.error('Failed to delete'),
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.quantity || !form.unit_price) {
      toast.error('Name, quantity and price are required')
      return
    }
    createMutation.mutate({
      ...form,
      quantity: parseInt(form.quantity),
      unit_price: parseFloat(form.unit_price),
      cost_price: form.cost_price ? parseFloat(form.cost_price) : undefined,
      reorder_level: form.reorder_level ? parseInt(form.reorder_level) : 5,
    })
  }

  const products = data?.data || data || []

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
    const matchStock =
      filterStock === 'all' ||
      (filterStock === 'low' && p.quantity > 0 && p.quantity <= (p.reorder_level || 5)) ||
      (filterStock === 'out' && p.quantity === 0) ||
      (filterStock === 'ok' && p.quantity > (p.reorder_level || 5))
    return matchSearch && matchStock
  })

  const totalValue = products.reduce((s, p) => s + Number(p.quantity) * Number(p.unit_price || 0), 0)
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= (p.reorder_level || 5)).length
  const outOfStockCount = products.filter(p => p.quantity === 0).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your products and stock levels</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Product</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-sm text-white/80 mb-1">Total Products</p>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-sm text-white/80 mb-1">Inventory Value</p>
          <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-sm text-white/80 mb-1">Low Stock Items</p>
          <p className="text-2xl font-bold">{lowStockCount}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-sm text-white/80 mb-1">Out of Stock</p>
          <p className="text-2xl font-bold">{outOfStockCount}</p>
        </div>
      </div>

      {/* Low stock alert banner */}
      {lowStockCount > 0 && (
        <div className="flex items-center space-x-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-orange-700 dark:text-orange-400 font-medium">
            {lowStockCount} product{lowStockCount > 1 ? 's are' : ' is'} running low on stock. Consider restocking soon.
          </p>
        </div>
      )}

      {/* Add Product Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-5">New Product</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Product Name *', key: 'name', type: 'text', placeholder: 'e.g. Office Chair' },
              { label: 'SKU / Barcode', key: 'sku', type: 'text', placeholder: 'e.g. SKU-001' },
              { label: 'Category', key: 'category', type: 'text', placeholder: 'e.g. Furniture' },
              { label: 'Quantity *', key: 'quantity', type: 'number', placeholder: '0' },
              { label: 'Selling Price (KES) *', key: 'unit_price', type: 'number', placeholder: '0.00' },
              { label: 'Cost Price (KES)', key: 'cost_price', type: 'number', placeholder: '0.00' },
              { label: 'Reorder Level', key: 'reorder_level', type: 'number', placeholder: '5' },
              { label: 'Description', key: 'description', type: 'text', placeholder: 'Optional description' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
                <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder={placeholder} min={type === 'number' ? '0' : undefined} step={key.includes('price') ? '0.01' : undefined} />
              </div>
            ))}
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm) }}
                className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={createMutation.isLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-purple-500/25 hover:from-purple-700 hover:to-purple-600 disabled:opacity-60 transition-all">
                {createMutation.isLoading ? 'Saving...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search products..." />
          </div>
          <div className="flex rounded-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
            {[['all', 'All'], ['ok', 'In Stock'], ['low', 'Low Stock'], ['out', 'Out of Stock']].map(([val, label]) => (
              <button key={val} onClick={() => setFilterStock(val)}
                className={`px-3 py-2.5 text-sm font-medium transition-colors ${
                  filterStock === val ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 dark:bg-gray-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center py-16 text-gray-400">
          <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-base font-medium mb-1">No products found</p>
          <p className="text-sm">Add your first product to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => {
            const stockPct = product.reorder_level ? Math.min((product.quantity / (product.reorder_level * 4)) * 100, 100) : 100
            const isLow = product.quantity > 0 && product.quantity <= (product.reorder_level || 5)
            const isOut = product.quantity === 0
            return (
              <div key={product.id} className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border ${isOut ? 'border-red-200 dark:border-red-800' : isLow ? 'border-orange-200 dark:border-orange-800' : 'border-gray-200 dark:border-gray-700'} p-5 hover:shadow-md transition-shadow`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{product.name}</h3>
                    {product.sku && (
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">{product.sku}</p>
                    )}
                  </div>
                  <StockBadge qty={product.quantity} reorder={product.reorder_level} />
                </div>

                {product.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-medium">
                    {product.category}
                  </span>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Quantity</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(product.quantity)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Unit Price</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(product.unit_price)}</p>
                  </div>
                </div>

                {/* Stock bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${isOut ? 'bg-red-500' : isLow ? 'bg-orange-500' : 'bg-emerald-500'}`}
                      style={{ width: `${stockPct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Value: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(product.quantity * (product.unit_price || 0))}</span>
                  </p>
                  <button onClick={() => deleteMutation.mutate(product.id)}
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
  )
}

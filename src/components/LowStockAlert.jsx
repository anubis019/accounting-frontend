import React from 'react';
import { Link } from 'react-router-dom';

export default function LowStockAlert({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Low Stock Alerts</h3>
        <p className="text-gray-500 text-sm">No low stock items.</p>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-md font-medium text-red-600 dark:text-red-400 mb-3">⚠️ Low Stock Alerts</h3>
      <div className="space-y-2">
        {products.map(p => (
          <div key={p.id} className="flex justify-between items-center">
            <span className="text-sm">{p.name}</span>
            <span className="text-sm font-bold text-red-600">{p.quantity} left</span>
          </div>
        ))}
      </div>
      <Link to="/inventory" className="text-primary-600 text-sm mt-2 inline-block">Manage inventory →</Link>
    </div>
  );
}
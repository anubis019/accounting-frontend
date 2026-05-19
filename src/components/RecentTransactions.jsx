import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function RecentTransactions({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Recent Transactions</h3>
        <p className="text-gray-500 text-sm">No transactions yet.</p>
        <Link to="/transactions" className="text-primary-600 text-sm">Add your first transaction →</Link>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-medium text-gray-900 dark:text-white">Recent Transactions</h3>
        <Link to="/transactions" className="text-primary-600 text-sm">View all</Link>
      </div>
      <div className="space-y-2">
        {transactions.slice(0,5).map(txn => (
          <div key={txn.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{txn.description || 'Transaction'}</p>
              <p className="text-xs text-gray-400">{formatDate(txn.transaction_date)}</p>
            </div>
            <p className={`text-sm font-semibold ${txn.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
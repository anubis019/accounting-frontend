import React, { useState } from 'react'
import { useAuth } from '../Contexts/AuthContext'
import { useDarkMode } from '../Contexts/DarkModeContext'
import toast from 'react-hot-toast'
import api from '../api'

function Section({ title, description, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h3>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

export default function Settings() {
  const { user, logout } = useAuth()
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    business_name: user?.business_name || '',
  })

  const [notifications, setNotifications] = useState({
    email_reports: true,
    low_stock_alerts: true,
    budget_alerts: true,
    task_reminders: false,
    weekly_summary: true,
  })

  const [security, setSecurity] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const [currency, setCurrency] = useState('KES')
  const [language, setLanguage] = useState('en')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await api.put('/profile', profile)
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (security.new_password !== security.confirm_password) {
      toast.error('New passwords do not match')
      return
    }
    if (security.new_password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setSavingPassword(true)
    try {
      await api.put('/profile/password', {
        current_password: security.current_password,
        new_password: security.new_password,
      })
      toast.success('Password changed successfully!')
      setSecurity({ current_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    } finally {
      setSavingPassword(false)
    }
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name || 'User'}</h2>
            <p className="text-blue-200 text-sm">{user?.email}</p>
            <span className="mt-1 inline-block text-xs px-2.5 py-0.5 rounded-full bg-white/20 font-medium capitalize">
              {user?.role || 'individual'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <Section title="Profile Information" description="Update your personal details">
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
            { label: 'Email Address', key: 'email', type: 'email', placeholder: 'your@email.com' },
            { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+254 700 000 000' },
            { label: 'Business Name', key: 'business_name', type: 'text', placeholder: 'Your business name' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
              <input
                type={type}
                value={profile[key]}
                onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={placeholder}
              />
            </div>
          ))}
          <div className="sm:col-span-2 flex justify-end">
            <button type="submit" disabled={savingProfile}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-blue-600 disabled:opacity-60 transition-all">
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Section>

      {/* Preferences */}
      <Section title="Preferences" description="Customize your experience">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="KES">KES — Kenyan Shilling</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="TZS">TZS — Tanzanian Shilling</option>
              <option value="UGX">UGX — Ugandan Shilling</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="en">English</option>
              <option value="sw">Swahili</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <Toggle
            checked={isDarkMode}
            onChange={toggleDarkMode}
            label="Dark Mode"
            description="Use dark theme across the application"
          />
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" description="Control what alerts you receive">
        <div>
          <Toggle
            checked={notifications.email_reports}
            onChange={(v) => setNotifications({ ...notifications, email_reports: v })}
            label="Email Reports"
            description="Receive monthly financial reports via email"
          />
          <Toggle
            checked={notifications.low_stock_alerts}
            onChange={(v) => setNotifications({ ...notifications, low_stock_alerts: v })}
            label="Low Stock Alerts"
            description="Get notified when inventory runs low"
          />
          <Toggle
            checked={notifications.budget_alerts}
            onChange={(v) => setNotifications({ ...notifications, budget_alerts: v })}
            label="Budget Alerts"
            description="Alerts when spending approaches budget limits"
          />
          <Toggle
            checked={notifications.task_reminders}
            onChange={(v) => setNotifications({ ...notifications, task_reminders: v })}
            label="Task Reminders"
            description="Reminders for upcoming and overdue tasks"
          />
          <Toggle
            checked={notifications.weekly_summary}
            onChange={(v) => setNotifications({ ...notifications, weekly_summary: v })}
            label="Weekly Summary"
            description="Weekly digest of your financial activity"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={() => toast.success('Notification preferences saved!')}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-blue-600 transition-all">
            Save Preferences
          </button>
        </div>
      </Section>

      {/* Security */}
      <Section title="Security" description="Change your password and manage account security">
        <form onSubmit={handleChangePassword} className="space-y-4">
          {[
            { label: 'Current Password', key: 'current_password', placeholder: 'Enter current password' },
            { label: 'New Password', key: 'new_password', placeholder: 'Min. 8 characters' },
            { label: 'Confirm New Password', key: 'confirm_password', placeholder: 'Repeat new password' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
              <input
                type="password"
                value={security[key]}
                onChange={(e) => setSecurity({ ...security, [key]: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={placeholder}
              />
            </div>
          ))}
          <div className="flex justify-end">
            <button type="submit" disabled={savingPassword}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-blue-600 disabled:opacity-60 transition-all">
              {savingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </Section>

      {/* Danger Zone */}
      <Section title="Account Management" description="Manage your account data">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Export Data</p>
              <p className="text-xs text-gray-400">Download all your financial data as CSV</p>
            </div>
            <button onClick={() => toast.success('Preparing data export...')}
              className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 dark:border-blue-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              Export
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Sign Out</p>
              <p className="text-xs text-red-400">Sign out from your account on this device</p>
            </div>
            <button onClick={logout}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 dark:border-red-700 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </Section>
    </div>
  )
}

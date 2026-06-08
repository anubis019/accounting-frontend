import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../Contexts/AuthContext'

const inputClass = (error) =>
  `w-full pl-10 pr-4 py-3 rounded-xl border ${
    error
      ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
  } text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm`

export default function Register() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'individual',
    business_name: '',
    phone: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { register } = useAuth()
  const navigate = useNavigate()

  const update = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const validateStep1 = () => {
    const errs = {}
    if (!formData.name.trim()) errs.name = 'Full name is required'
    if (!formData.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email'
    if (!formData.phone.trim()) errs.phone = 'Phone number is required'
    return errs
  }

  const validateStep2 = () => {
    const errs = {}
    if (!formData.password) errs.password = 'Password is required'
    else if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (formData.password !== formData.password_confirmation)
      errs.password_confirmation = 'Passwords do not match'
    if (formData.role === 'business' && !formData.business_name.trim())
      errs.business_name = 'Business name is required'
    if (!acceptTerms) errs.terms = 'You must accept the terms'
    return errs
  }

  const handleNext = () => {
    const errs = validateStep1()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateStep2()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    const success = await register(formData)
    if (success) navigate('/login')
    setLoading(false)
  }

  const passwordStrength = () => {
    const p = formData.password
    if (!p) return { score: 0, label: '', color: '' }
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    const map = [
      { label: 'Weak', color: 'bg-red-500' },
      { label: 'Fair', color: 'bg-orange-500' },
      { label: 'Good', color: 'bg-yellow-500' },
      { label: 'Strong', color: 'bg-green-500' },
      { label: 'Very Strong', color: 'bg-emerald-500' },
    ]
    return { score, ...map[score] }
  }

  const strength = passwordStrength()

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-purple-700 via-purple-800 to-blue-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
          <div className="absolute bottom-1/4 -left-10 w-56 h-56 bg-purple-400/15 rounded-full" />
          <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-blue-400/10 rounded-full" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-white text-xl font-bold">AcctSys</span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Start your financial<br />journey today
          </h2>
          <p className="text-purple-200 text-lg leading-relaxed mb-10">
            Join thousands of businesses managing their finances smarter with AcctSys.
          </p>

          <div className="space-y-4">
            {[
              { icon: '✅', text: 'Free to get started — no credit card required' },
              { icon: '🔒', text: 'Bank-grade security for your financial data' },
              { icon: '📊', text: 'Real-time reports and analytics' },
              { icon: '🤖', text: 'AI-powered financial insights' },
            ].map((item) => (
              <div key={item.text} className="flex items-center space-x-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-purple-100 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur rounded-2xl p-5">
          <p className="text-white/80 text-sm italic mb-3">
            "AcctSys transformed how we manage our business finances. The reports are incredible!"
          </p>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">JM</div>
            <div>
              <p className="text-white text-sm font-medium">James Mwangi</p>
              <p className="text-purple-300 text-xs">CEO, TechVentures Ltd</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">AcctSys</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center mb-8">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  step >= s
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}>
                  {step > s ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s}
                </div>
                {s < 2 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${step > s ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {step === 1 ? 'Create your account' : 'Set up your profile'}
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
              {step === 1 ? 'Step 1 of 2 — Personal information' : 'Step 2 of 2 — Security & preferences'}
            </p>
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input type="text" value={formData.name} onChange={(e) => update('name', e.target.value)}
                    className={inputClass(errors.name)} placeholder="John Doe" />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input type="email" value={formData.email} onChange={(e) => update('email', e.target.value)}
                    className={inputClass(errors.email)} placeholder="you@example.com" />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input type="tel" value={formData.phone} onChange={(e) => update('phone', e.target.value)}
                    className={inputClass(errors.phone)} placeholder="+254 700 000 000" />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Continue</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account type toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['individual', 'business'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => update('role', type)}
                      className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                        formData.role === type
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xl mb-1">{type === 'individual' ? '👤' : '🏢'}</div>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Business name */}
              {formData.role === 'business' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Business Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <input type="text" value={formData.business_name} onChange={(e) => update('business_name', e.target.value)}
                      className={inputClass(errors.business_name)} placeholder="Your Business Name" />
                  </div>
                  {errors.business_name && <p className="mt-1 text-xs text-red-500">{errors.business_name}</p>}
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input type={showPassword ? 'text' : 'password'} value={formData.password}
                    onChange={(e) => update('password', e.target.value)}
                    className={inputClass(errors.password)} placeholder="Min. 8 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                    </svg>
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex space-x-1 mb-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength.score ? strength.color : 'bg-gray-200 dark:bg-gray-700'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">{strength.label} password</p>
                  </div>
                )}
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input type="password" value={formData.password_confirmation}
                    onChange={(e) => update('password_confirmation', e.target.value)}
                    className={inputClass(errors.password_confirmation)} placeholder="Repeat your password" />
                </div>
                {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation}</p>}
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input type="checkbox" checked={acceptTerms} onChange={(e) => { setAcceptTerms(e.target.checked); setErrors({ ...errors, terms: '' }) }}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    I agree to the{' '}
                    <button type="button" className="text-purple-600 hover:text-purple-500 font-medium">Terms of Service</button>
                    {' '}and{' '}
                    <button type="button" className="text-purple-600 hover:text-purple-500 font-medium">Privacy Policy</button>
                  </span>
                </label>
                {errors.terms && <p className="mt-1 text-xs text-red-500">{errors.terms}</p>}
              </div>

              <div className="flex space-x-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 hover:text-purple-500 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
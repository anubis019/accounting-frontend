export const formatCurrency = (amount, currency = 'KES') => {
  if (amount === undefined || amount === null) return 'KES 0.00'
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatNumber = (num) => {
  if (!num) return '0'
  return new Intl.NumberFormat('en-KE').format(num)
}

export const formatPercentage = (value) => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
}
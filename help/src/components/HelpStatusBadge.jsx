const STATUS_STYLES = {
  draft:     'bg-gray-100 text-gray-600',
  sent:      'bg-blue-100 text-blue-700',
  paid:      'bg-green-100 text-green-700',
  overdue:   'bg-red-100 text-red-700',
  partial:   'bg-yellow-100 text-yellow-700',
  void:      'bg-gray-100 text-gray-500 line-through',
  pending:   'bg-yellow-100 text-yellow-700',
  approved:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  active:    'bg-emerald-100 text-emerald-700',
  inactive:  'bg-gray-100 text-gray-500',
  completed: 'bg-green-100 text-green-700',
  upcoming:  'bg-blue-100 text-blue-700',
  default:   'bg-gray-100 text-gray-600',
}

export default function HelpStatusBadge({ status }) {
  const key = (status || '').toLowerCase()
  const style = STATUS_STYLES[key] || STATUS_STYLES.default
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {status}
    </span>
  )
}

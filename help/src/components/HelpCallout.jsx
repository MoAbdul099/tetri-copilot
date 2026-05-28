const VARIANTS = {
  tip: {
    bg: 'bg-blue-50 border-blue-200',
    icon: '💡',
    label: 'Tip',
    textColor: 'text-blue-800',
    labelColor: 'text-blue-700',
  },
  info: {
    bg: 'bg-sky-50 border-sky-200',
    icon: 'ℹ️',
    label: 'Note',
    textColor: 'text-sky-800',
    labelColor: 'text-sky-700',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: '⚠️',
    label: 'Important',
    textColor: 'text-amber-800',
    labelColor: 'text-amber-700',
  },
  danger: {
    bg: 'bg-red-50 border-red-200',
    icon: '🚨',
    label: 'Warning',
    textColor: 'text-red-800',
    labelColor: 'text-red-700',
  },
}

export default function HelpCallout({ variant = 'info', content }) {
  const v = VARIANTS[variant] || VARIANTS.info
  return (
    <div className={`flex gap-3 rounded-xl border p-4 my-4 ${v.bg}`}>
      <span className="text-lg flex-shrink-0 mt-0.5">{v.icon}</span>
      <div>
        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${v.labelColor}`}>{v.label}</p>
        <p className={`text-sm leading-relaxed ${v.textColor}`}>{content}</p>
      </div>
    </div>
  )
}

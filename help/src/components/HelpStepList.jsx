export default function HelpStepList({ title, items }) {
  if (!items || items.length === 0) return null
  return (
    <div className="my-6">
      {title && <h3 className="text-base font-semibold text-tetri-text mb-4">{title}</h3>}
      <ol className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-tetri-blue text-white text-xs font-bold flex items-center justify-center mt-0.5">
              {index + 1}
            </span>
            <p className="text-sm text-tetri-muted leading-relaxed flex-1">{item}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

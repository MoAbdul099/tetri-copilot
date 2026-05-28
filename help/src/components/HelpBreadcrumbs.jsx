import { Link } from 'react-router-dom'

export default function HelpBreadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm mb-6">
      <Link to="/" className="text-tetri-neutral hover:text-tetri-blue transition-colors">
        Help Center
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          <span className="text-tetri-border">/</span>
          {item.href ? (
            <Link to={item.href} className="text-tetri-neutral hover:text-tetri-blue transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-tetri-text font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

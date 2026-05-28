import { useState, useEffect } from 'react'

function getSectionLabel(section) {
  if (section.type === 'overview') return 'Overview'
  if (section.type === 'steps') return section.title || 'Steps'
  if (section.type === 'fields') return section.title || 'Fields'
  if (section.type === 'callout') return null
  if (section.type === 'text') return section.title || null
  if (section.type === 'related') return 'Related Articles'
  return section.title || null
}

function getSectionId(section, index) {
  return `section-${index}`
}

export default function HelpTableOfContents({ sections }) {
  const [active, setActive] = useState(null)

  const tocItems = sections
    .map((s, i) => ({ label: getSectionLabel(s), id: getSectionId(s, i) }))
    .filter((item) => item.label)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0% -70% 0%' }
    )

    tocItems.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [sections])

  if (tocItems.length < 2) return null

  return (
    <nav className="sticky top-6" aria-label="Table of contents">
      <p className="text-xs font-bold uppercase tracking-wider text-tetri-neutral mb-3">On this page</p>
      <ul className="space-y-1">
        {tocItems.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block text-sm py-1 pl-3 border-l-2 transition-colors ${
                active === item.id
                  ? 'border-tetri-blue text-tetri-blue font-medium'
                  : 'border-tetri-border text-tetri-muted hover:text-tetri-text hover:border-tetri-neutral'
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

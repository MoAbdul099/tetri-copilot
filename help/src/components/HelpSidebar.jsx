import { useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { navigation } from '../data/navigation.js'

function ChevronIcon({ open }) {
  return (
    <svg
      className={`w-4 h-4 text-tetri-neutral transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function SidebarGroup({ group, currentCategory, onNavigate }) {
  const isActive = group.slug === currentCategory
  const [open, setOpen] = useState(isActive)

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
          isActive
            ? 'bg-[#eff4ff] text-tetri-blue'
            : 'text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text'
        }`}
      >
        <span className="flex items-center gap-2 text-left">
          <span className="text-base">{group.icon}</span>
          <span>{group.label}</span>
        </span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="mt-0.5 ml-6 space-y-0.5">
          {group.items.map((item) => (
            <NavLink
              key={item.slug}
              to={`/${group.slug}/${item.slug}`}
              onClick={onNavigate}
              className={({ isActive: linkActive }) =>
                `block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  linkActive
                    ? 'bg-[#eff4ff] text-tetri-blue font-medium'
                    : 'text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function HelpSidebar({ onNavigate }) {
  const { categorySlug } = useParams()

  return (
    <nav className="py-6 px-3" aria-label="Help navigation">
      <p className="text-xs font-bold uppercase tracking-wider text-tetri-neutral px-3 mb-3">
        Help Topics
      </p>
      <div className="space-y-0.5">
        {navigation.map((group) => (
          <SidebarGroup
            key={group.slug}
            group={group}
            currentCategory={categorySlug}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </nav>
  )
}

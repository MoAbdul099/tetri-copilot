import { useState } from 'react'
import { Link } from 'react-router-dom'
import HelpSearch from './HelpSearch.jsx'

export default function HelpHeader({ onMenuToggle }) {
  return (
    <header className="bg-white border-b border-tetri-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg transition-colors"
          aria-label="Open navigation menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <img src="/logo.svg" alt="Tetri Copilot" className="h-10 w-auto" />
          <span className="text-sm font-semibold text-tetri-muted hidden sm:block">Help Center</span>
        </Link>

        {/* Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          <Link to="/" className="px-3 py-1.5 text-sm text-tetri-muted hover:text-tetri-text hover:bg-tetri-bg rounded-lg transition-colors">
            Home
          </Link>
          <Link to="/getting-started/welcome" className="px-3 py-1.5 text-sm text-tetri-muted hover:text-tetri-text hover:bg-tetri-bg rounded-lg transition-colors">
            Getting Started
          </Link>
          <Link to="/workflows/first-customer" className="px-3 py-1.5 text-sm text-tetri-muted hover:text-tetri-text hover:bg-tetri-bg rounded-lg transition-colors">
            Workflows
          </Link>
          <Link to="/faq/general" className="px-3 py-1.5 text-sm text-tetri-muted hover:text-tetri-text hover:bg-tetri-bg rounded-lg transition-colors">
            FAQ
          </Link>
          <Link to="/support/contact" className="px-3 py-1.5 text-sm text-tetri-muted hover:text-tetri-text hover:bg-tetri-bg rounded-lg transition-colors">
            Support
          </Link>
        </nav>

        {/* Search (desktop) */}
        <div className="flex-1 max-w-xs ml-auto hidden sm:block">
          <HelpSearch placeholder="Search docs…" />
        </div>

        {/* Open App button */}
        <a
          href="https://staging-app.tetrisuite.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 px-4 py-1.5 bg-tetri-blue text-white text-sm font-semibold rounded-xl hover:bg-tetri-blue-hover transition-colors"
        >
          Open App
        </a>
      </div>
    </header>
  )
}

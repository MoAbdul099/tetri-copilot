import { useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import HelpHeader from './HelpHeader.jsx'
import HelpSidebar from './HelpSidebar.jsx'
import HelpFooter from './HelpFooter.jsx'

export default function HelpLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-tetri-bg flex flex-col">
      <HelpHeader onMenuToggle={() => setMobileOpen((v) => !v)} />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-tetri-border bg-white overflow-y-auto">
          <HelpSidebar />
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/30"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative w-72 bg-white border-r border-tetri-border overflow-y-auto z-10">
              <div className="flex items-center justify-between px-4 py-4 border-b border-tetri-border">
                <span className="text-sm font-semibold text-tetri-text">Navigation</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg text-tetri-neutral hover:bg-tetri-bg"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <HelpSidebar onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8">
          <Outlet />
        </main>
      </div>

      <HelpFooter />
    </div>
  )
}

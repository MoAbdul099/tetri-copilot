import { Outlet } from 'react-router-dom'
import HelpHeader from './HelpHeader.jsx'
import HelpSidebar from './HelpSidebar.jsx'
import HelpFooter from './HelpFooter.jsx'

export default function HelpLayout() {
  return (
    <div className="min-h-screen bg-tetri-bg flex flex-col">
      <HelpHeader />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-tetri-border bg-white overflow-y-auto">
          <HelpSidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8">
          <Outlet />
        </main>
      </div>

      <HelpFooter />
    </div>
  )
}

import { Link } from 'react-router-dom'
import HelpHeader from '../components/HelpHeader.jsx'
import HelpFooter from '../components/HelpFooter.jsx'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-tetri-bg flex flex-col">
      <HelpHeader />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-6xl mb-6">📄</p>
        <h1 className="text-3xl font-bold text-tetri-text mb-3">Article Not Found</h1>
        <p className="text-tetri-muted max-w-md mb-8 leading-relaxed">
          The article you are looking for does not exist or may have been moved. Use the search to find what you need.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            to="/"
            className="px-5 py-2.5 bg-tetri-blue text-white text-sm font-semibold rounded-xl hover:bg-tetri-blue-hover transition-colors"
          >
            Help Center Home
          </Link>
          <Link
            to="/search"
            className="px-5 py-2.5 bg-white border border-tetri-border text-tetri-text text-sm font-semibold rounded-xl hover:bg-tetri-bg transition-colors"
          >
            Search Articles
          </Link>
        </div>
      </main>
      <HelpFooter />
    </div>
  )
}

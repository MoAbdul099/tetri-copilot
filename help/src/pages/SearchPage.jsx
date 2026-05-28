import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Fuse from 'fuse.js'
import { searchIndex } from '../data/searchIndex.js'
import HelpHeader from '../components/HelpHeader.jsx'
import HelpFooter from '../components/HelpFooter.jsx'
import HelpSearch from '../components/HelpSearch.jsx'

const fuse = new Fuse(searchIndex, {
  keys: [
    { name: 'title', weight: 3 },
    { name: 'description', weight: 2 },
    { name: 'keywords', weight: 2 },
    { name: 'category', weight: 1 },
    { name: 'body', weight: 0.5 },
  ],
  threshold: 0.3,
  includeScore: true,
})

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])

  useEffect(() => {
    if (query.trim().length >= 2) {
      setResults(fuse.search(query.trim()))
    } else {
      setResults([])
    }
    document.title = query ? `Search: "${query}" — Tetri Copilot Help` : 'Search — Tetri Copilot Help'
  }, [query])

  return (
    <div className="min-h-screen bg-tetri-bg flex flex-col">
      <HelpHeader />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-tetri-text mb-4">Search</h1>
          <HelpSearch placeholder="Search documentation…" autoFocus className="max-w-xl" />
        </div>

        {query && (
          <p className="text-sm text-tetri-neutral mb-6">
            {results.length > 0
              ? `${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`
              : `No results found for "${query}"`}
          </p>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map(({ item }) => {
              const [cat, art] = item.slug.split('/')
              const href = art ? `/${cat}/${art}` : `/${cat}`
              return (
                <Link
                  key={item.slug}
                  to={href}
                  className="block bg-white border border-tetri-border rounded-xl p-5 hover:border-tetri-blue hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-tetri-blue bg-[#eff4ff] px-2 py-0.5 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-tetri-text group-hover:text-tetri-blue transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-tetri-muted mt-1 leading-relaxed">{item.description}</p>
                </Link>
              )
            })}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <h2 className="text-xl font-bold text-tetri-text mb-2">No results found</h2>
            <p className="text-tetri-muted mb-6">
              Try different keywords, or browse the categories below.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-tetri-blue text-white text-sm font-semibold rounded-xl hover:bg-tetri-blue-hover transition-colors"
            >
              Browse Help Center
            </Link>
          </div>
        )}
      </main>
      <HelpFooter />
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'
import { searchIndex } from '../data/searchIndex.js'

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

export default function HelpSearch({ placeholder = 'Search articles…', className = '', autoFocus = false, onSearch }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus()
  }, [autoFocus])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setOpen(false)
      return
    }
    const r = fuse.search(q).slice(0, 6)
    setResults(r)
    setOpen(r.length > 0)
  }, [query])

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (query.trim()) {
      setOpen(false)
      if (onSearch) onSearch(query.trim())
      else navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  function handleSelect(article) {
    setOpen(false)
    setQuery('')
    const [cat, art] = article.slug.split('/')
    navigate(art ? `/${cat}/${art}` : `/${cat}`)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-tetri-neutral pointer-events-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-tetri-border rounded-xl text-tetri-text placeholder:text-tetri-neutral focus:outline-none focus:ring-2 focus:ring-tetri-blue/30 focus:border-tetri-blue transition-colors"
          />
        </div>
      </form>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-tetri-border rounded-xl shadow-lg z-50 py-1 max-h-80 overflow-y-auto">
          {results.map(({ item }) => (
            <button
              key={item.slug}
              onClick={() => handleSelect(item)}
              className="w-full flex flex-col items-start px-4 py-2.5 hover:bg-tetri-bg transition-colors text-left"
            >
              <span className="text-sm font-medium text-tetri-text">{item.title}</span>
              <span className="text-xs text-tetri-neutral mt-0.5">{item.category}</span>
            </button>
          ))}
          <div className="border-t border-tetri-border px-4 py-2">
            <button
              onClick={handleSubmit}
              className="text-xs text-tetri-blue hover:underline"
            >
              See all results for "{query}"
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

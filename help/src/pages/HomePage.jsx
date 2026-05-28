import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import HelpHeader from '../components/HelpHeader.jsx'
import HelpFooter from '../components/HelpFooter.jsx'
import HelpSearch from '../components/HelpSearch.jsx'
import { navigation } from '../data/navigation.js'

const POPULAR = [
  { slug: 'getting-started/welcome', title: 'Welcome to Tetri Copilot', category: 'Getting Started' },
  { slug: 'invoices-payments/create-invoice', title: 'Create an Invoice', category: 'Invoices & Payments' },
  { slug: 'expenses/add-expense', title: 'Add an Expense', category: 'Expenses' },
  { slug: 'customers/add-customer', title: 'Add a Customer', category: 'Customers' },
  { slug: 'invoices-payments/record-payment', title: 'Record a Payment', category: 'Invoices & Payments' },
  { slug: 'compliance/calendar', title: 'Compliance Calendar', category: 'Compliance' },
  { slug: 'ai-assistant/ai-chat', title: 'AI Chat Workspace', category: 'AI Assistant' },
  { slug: 'troubleshooting/login-issues', title: 'Login Issues', category: 'Troubleshooting' },
]

export default function HomePage() {
  useEffect(() => {
    document.title = 'Tetri Copilot Help Center'
  }, [])

  return (
    <div className="min-h-screen bg-tetri-bg flex flex-col">
      <HelpHeader />

      {/* Hero section */}
      <section className="bg-white border-b border-tetri-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-[#eff4ff] text-tetri-blue text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span>✦</span>
            <span>Tetri Copilot Help Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-tetri-text mb-4 leading-tight">
            How can we help you?
          </h1>
          <p className="text-tetri-muted text-lg mb-8 max-w-2xl mx-auto">
            Find guides, workflows, and answers for every part of Tetri Copilot.
          </p>
          <div className="max-w-xl mx-auto">
            <HelpSearch
              placeholder="Search articles, guides, and how-tos…"
              className="w-full"
            />
          </div>
          <p className="text-xs text-tetri-neutral mt-4">
            Popular:{' '}
            {['Create Invoice', 'Add Expense', 'AI Assistant', 'Compliance Calendar'].map((term, i) => (
              <span key={term}>
                <Link
                  to={`/search?q=${encodeURIComponent(term)}`}
                  className="text-tetri-blue hover:underline"
                >
                  {term}
                </Link>
                {i < 3 && <span className="mx-1.5 text-tetri-border">·</span>}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* Category grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        <h2 className="text-xl font-bold text-tetri-text mb-6">Browse by Topic</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {navigation.map((group) => (
            <Link
              key={group.slug}
              to={`/${group.slug}/${group.items[0].slug}`}
              className="bg-white border border-tetri-border rounded-2xl p-5 hover:border-tetri-blue hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#eff4ff] flex items-center justify-center flex-shrink-0 text-xl group-hover:bg-tetri-blue/10 transition-colors">
                  {group.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-tetri-text group-hover:text-tetri-blue transition-colors mb-1">
                    {group.label}
                  </h3>
                  <p className="text-xs text-tetri-neutral leading-relaxed">
                    {group.description}
                  </p>
                  <p className="text-xs text-tetri-blue mt-2 font-medium">
                    {group.items.length} article{group.items.length !== 1 ? 's' : ''} →
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular articles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 w-full">
        <h2 className="text-xl font-bold text-tetri-text mb-6">Popular Articles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {POPULAR.map((article) => {
            const [cat, art] = article.slug.split('/')
            const href = art ? `/${cat}/${art}` : `/${cat}`
            return (
              <Link
                key={article.slug}
                to={href}
                className="bg-white border border-tetri-border rounded-xl p-4 hover:border-tetri-blue hover:shadow-sm transition-all group"
              >
                <p className="text-xs font-semibold text-tetri-blue mb-1.5">{article.category}</p>
                <p className="text-sm font-medium text-tetri-text group-hover:text-tetri-blue transition-colors leading-snug">
                  {article.title}
                </p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-white border-t border-tetri-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <h2 className="text-xl font-bold text-tetri-text mb-3">Ready to get started?</h2>
          <p className="text-tetri-muted mb-6">
            Open the Tetri Copilot app and put these guides into action.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a
              href="https://app.tetrisuite.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-tetri-blue text-white text-sm font-semibold rounded-xl hover:bg-tetri-blue-hover transition-colors"
            >
              Open Tetri Copilot App
            </a>
            <Link
              to="/support/contact"
              className="px-6 py-2.5 bg-white border border-tetri-border text-tetri-text text-sm font-semibold rounded-xl hover:bg-tetri-bg transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      <HelpFooter />
    </div>
  )
}

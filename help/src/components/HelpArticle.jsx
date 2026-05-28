import { Link } from 'react-router-dom'
import HelpCallout from './HelpCallout.jsx'
import HelpStepList from './HelpStepList.jsx'
import HelpFieldTable from './HelpFieldTable.jsx'
import HelpStatusBadge from './HelpStatusBadge.jsx'

function Section({ section, index }) {
  const id = `section-${index}`

  if (section.type === 'overview') {
    return (
      <section id={id} className="mb-8">
        <h2 className="text-lg font-bold text-tetri-text mb-3">Overview</h2>
        <p className="text-tetri-muted leading-relaxed">{section.content}</p>
      </section>
    )
  }

  if (section.type === 'text') {
    return (
      <section id={id} className="mb-8">
        {section.title && <h2 className="text-lg font-bold text-tetri-text mb-3">{section.title}</h2>}
        <p className="text-tetri-muted leading-relaxed">{section.content}</p>
      </section>
    )
  }

  if (section.type === 'steps') {
    return (
      <section id={id} className="mb-8">
        <HelpStepList title={section.title} items={section.items} />
      </section>
    )
  }

  if (section.type === 'fields') {
    return (
      <section id={id} className="mb-8">
        <HelpFieldTable title={section.title} rows={section.rows} />
      </section>
    )
  }

  if (section.type === 'callout') {
    return (
      <section id={id} className="mb-6">
        <HelpCallout variant={section.variant} content={section.content} />
      </section>
    )
  }

  if (section.type === 'related') {
    return (
      <section id={id} className="mb-8">
        <h2 className="text-lg font-bold text-tetri-text mb-4">Related Articles</h2>
        <div className="grid gap-2">
          {section.links.map((link, i) => {
            const [cat, art] = link.slug.split('/')
            const href = art ? `/${cat}/${art}` : `/${cat}`
            return (
              <Link
                key={i}
                to={href}
                className="flex items-center gap-3 p-3 rounded-xl border border-tetri-border hover:border-tetri-blue hover:bg-[#eff4ff] transition-colors group"
              >
                <span className="w-7 h-7 rounded-lg bg-[#eff4ff] flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors">
                  <span className="text-tetri-blue text-xs">→</span>
                </span>
                <span className="text-sm font-medium text-tetri-muted group-hover:text-tetri-blue transition-colors">
                  {link.title}
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    )
  }

  return null
}

export default function HelpArticle({ article }) {
  if (!article) return null

  return (
    <article className="max-w-3xl">
      {/* Article header */}
      <div className="mb-8 pb-6 border-b border-tetri-border">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-tetri-blue bg-[#eff4ff] px-2 py-1 rounded-full">
            {article.category}
          </span>
          {article.lastUpdated && (
            <span className="text-xs text-tetri-neutral">Updated {article.lastUpdated}</span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-tetri-text mb-2">{article.title}</h1>
        <p className="text-tetri-muted text-base leading-relaxed">{article.description}</p>

        {article.roles && article.roles.length > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-tetri-neutral font-medium">Access:</span>
            {article.roles.map((role) => (
              <span key={role} className="text-xs bg-tetri-bg border border-tetri-border text-tetri-muted px-2 py-0.5 rounded-full">
                {role}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sections */}
      {article.sections.map((section, index) => (
        <Section key={index} section={section} index={index} />
      ))}

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-tetri-border">
        <p className="text-sm text-tetri-neutral">
          Was this article helpful?{' '}
          <button className="text-tetri-blue hover:underline ml-1">Yes</button>
          {' · '}
          <button className="text-tetri-blue hover:underline">No</button>
        </p>
      </div>
    </article>
  )
}

import { useParams } from 'react-router-dom'
import { getArticleBySlug } from '../data/searchIndex.js'
import { findArticle, navigation } from '../data/navigation.js'
import HelpArticle from '../components/HelpArticle.jsx'
import HelpBreadcrumbs from '../components/HelpBreadcrumbs.jsx'
import HelpTableOfContents from '../components/HelpTableOfContents.jsx'
import NotFoundPage from './NotFoundPage.jsx'

export default function ArticlePage() {
  const { categorySlug, articleSlug } = useParams()

  // Resolve article slug — if only categorySlug, use first article in that category
  const nav = findArticle(categorySlug, articleSlug)
  if (!nav) return <NotFoundPage />

  const resolvedSlug = articleSlug || nav.item?.slug
  const article = getArticleBySlug(categorySlug, resolvedSlug)

  if (!article) return <NotFoundPage />

  const breadcrumbs = [
    { label: nav.category.label, href: `/${categorySlug}` },
    { label: article.title },
  ]

  return (
    <div className="flex gap-8">
      {/* Main article */}
      <div className="flex-1 min-w-0">
        <HelpBreadcrumbs items={breadcrumbs} />
        <HelpArticle article={article} />
      </div>

      {/* Right TOC (desktop) */}
      <div className="hidden xl:block w-56 flex-shrink-0">
        <HelpTableOfContents sections={article.sections} />
      </div>
    </div>
  )
}

import { articles as gettingStarted } from '../content/getting-started.js'
import { articles as account } from '../content/account.js'
import { articles as workspace } from '../content/workspace.js'
import { articles as dashboard } from '../content/dashboard.js'
import { articles as customers } from '../content/customers.js'
import { articles as invoicesPayments } from '../content/invoices-payments.js'
import { articles as expenses } from '../content/expenses.js'
import { articles as compliance } from '../content/compliance.js'
import { articles as notifications } from '../content/notifications.js'
import { articles as reportsAnalytics } from '../content/reports-analytics.js'
import { articles as logs } from '../content/logs.js'
import { articles as billing } from '../content/billing.js'
import { articles as aiAssistant } from '../content/ai-assistant.js'
import { articles as settings } from '../content/settings.js'
import { articles as workflows } from '../content/workflows.js'
import { articles as troubleshooting } from '../content/troubleshooting.js'
import { articles as faq } from '../content/faq.js'
import { articles as support } from '../content/support.js'

export const allArticles = [
  ...gettingStarted,
  ...account,
  ...workspace,
  ...dashboard,
  ...customers,
  ...invoicesPayments,
  ...expenses,
  ...compliance,
  ...notifications,
  ...reportsAnalytics,
  ...logs,
  ...billing,
  ...aiAssistant,
  ...settings,
  ...workflows,
  ...troubleshooting,
  ...faq,
  ...support,
]

// Build a flattened search index from article metadata and section content
export const searchIndex = allArticles.map((article) => {
  const sectionText = article.sections
    .map((s) => {
      let text = ''
      if (s.content) text += s.content + ' '
      if (s.title) text += s.title + ' '
      if (s.items) text += s.items.join(' ') + ' '
      if (s.rows) text += s.rows.map((r) => `${r.field} ${r.description}`).join(' ') + ' '
      return text
    })
    .join(' ')

  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    category: article.category,
    categorySlug: article.categorySlug,
    keywords: (article.keywords || []).join(' '),
    roles: (article.roles || []).join(' '),
    body: sectionText,
  }
})

export function getArticleBySlug(categorySlug, articleSlug) {
  const fullSlug = articleSlug ? `${categorySlug}/${articleSlug}` : categorySlug
  return allArticles.find((a) => a.slug === fullSlug) || null
}

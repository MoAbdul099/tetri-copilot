import { Link } from 'react-router-dom'

export default function HelpFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-white border-t border-tetri-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <img src="/logo.svg" alt="Tetri Copilot" className="h-7 w-auto mb-3" />
            <p className="text-sm text-tetri-neutral leading-relaxed">
              AI-powered finance and operations for growing businesses.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-tetri-neutral mb-3">Get Started</p>
            <ul className="space-y-2">
              <li><Link to="/getting-started/welcome" className="text-sm text-tetri-muted hover:text-tetri-blue transition-colors">Welcome Guide</Link></li>
              <li><Link to="/getting-started/first-login" className="text-sm text-tetri-muted hover:text-tetri-blue transition-colors">First Login</Link></li>
              <li><Link to="/getting-started/user-roles" className="text-sm text-tetri-muted hover:text-tetri-blue transition-colors">User Roles</Link></li>
              <li><Link to="/workflows/send-invoice" className="text-sm text-tetri-muted hover:text-tetri-blue transition-colors">Send an Invoice</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-tetri-neutral mb-3">Popular Topics</p>
            <ul className="space-y-2">
              <li><Link to="/invoices-payments/create-invoice" className="text-sm text-tetri-muted hover:text-tetri-blue transition-colors">Create Invoice</Link></li>
              <li><Link to="/expenses/add-expense" className="text-sm text-tetri-muted hover:text-tetri-blue transition-colors">Add Expense</Link></li>
              <li><Link to="/compliance/calendar" className="text-sm text-tetri-muted hover:text-tetri-blue transition-colors">Compliance Calendar</Link></li>
              <li><Link to="/ai-assistant/overview" className="text-sm text-tetri-muted hover:text-tetri-blue transition-colors">AI Assistant</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-tetri-neutral mb-3">Support</p>
            <ul className="space-y-2">
              <li><Link to="/faq/general" className="text-sm text-tetri-muted hover:text-tetri-blue transition-colors">FAQ</Link></li>
              <li><Link to="/troubleshooting/login-issues" className="text-sm text-tetri-muted hover:text-tetri-blue transition-colors">Troubleshooting</Link></li>
              <li><Link to="/support/contact" className="text-sm text-tetri-muted hover:text-tetri-blue transition-colors">Contact Support</Link></li>
              <li>
                <a href="https://app.tetrisuite.com" target="_blank" rel="noopener noreferrer" className="text-sm text-tetri-muted hover:text-tetri-blue transition-colors">
                  Open App ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-tetri-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-tetri-neutral">© {year} Tetri Copilot. All rights reserved.</p>
          <p className="text-xs text-tetri-neutral">
            Help Center · <a href="https://app.tetrisuite.com" className="hover:text-tetri-blue transition-colors">App</a>
          </p>
        </div>
      </div>
    </footer>
  )
}

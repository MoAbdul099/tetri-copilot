import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HelpLayout from './components/HelpLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import ArticlePage from './pages/ArticlePage.jsx'
import SearchPage from './pages/SearchPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route element={<HelpLayout />}>
          <Route path="/:categorySlug/:articleSlug" element={<ArticlePage />} />
          <Route path="/:categorySlug" element={<ArticlePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

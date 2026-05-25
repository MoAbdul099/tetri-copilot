import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BarChart2, Bookmark, Clock, Star, Play, Trash2, RefreshCw } from 'lucide-react';
import { useReportCatalog, useSavedReports, useScheduledReports } from '../hooks/useReports.js';
import ReportCard from '../components/ReportCard.jsx';
import reportsService from '../services/reportsService.js';

const TABS = ['All Reports', 'Saved', 'Schedules'];

const CATEGORIES = [
  'All',
  'Financial Reports',
  'Receivables Reports',
  'Payments Reports',
  'Expenses Reports',
  'Customers Reports',
  'Compliance Reports',
  'Activity Reports',
  'Subscription & Usage Reports',
];

export default function ReportsPage() {
  const [tab,      setTab]      = useState('All Reports');
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('All');
  const [favorites, setFavorites] = useState(new Set());

  const catalog   = useReportCatalog();
  const saved     = useSavedReports();
  const schedules = useScheduledReports();

  const handleFavorite = (code, fav) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      fav ? next.add(code) : next.delete(code);
      return next;
    });
  };

  const handleDeleteSaved = async (id) => {
    await reportsService.deleteSaved(id);
    saved.refresh();
  };

  const handleDeleteSchedule = async (id) => {
    await reportsService.deleteSchedule(id);
    schedules.refresh();
  };

  const handleRunNow = async (id) => {
    await reportsService.runNow(id);
    schedules.refresh();
  };

  const filteredCatalog = (catalog.data || []).filter((r) => {
    const matchSearch   = !search || r.reportName.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || r.category === category;
    return matchSearch && matchCategory;
  });

  const favReports = filteredCatalog.filter((r) => favorites.has(r.reportCode));

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-tetri-text">Reports</h1>
          <p className="text-sm text-tetri-muted mt-0.5">Generate, export, and schedule business reports.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${tab === t ? 'bg-white text-tetri-text shadow-sm' : 'text-tetri-muted hover:text-tetri-text'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ALL REPORTS TAB */}
      {tab === 'All Reports' && (
        <div className="space-y-5">
          {/* Search + Category filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reports…"
                className="w-full pl-9 pr-4 py-2 text-sm border border-tetri-border rounded-xl focus:outline-none focus:ring-1 focus:ring-tetri-blue"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-tetri-border rounded-xl px-3 py-2 text-sm text-tetri-text focus:outline-none focus:ring-1 focus:ring-tetri-blue"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Favorites strip */}
          {favReports.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-tetri-muted uppercase tracking-wide mb-2">
                <Star className="inline w-3 h-3 mr-1 fill-amber-400 text-amber-400" /> Favorites
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {favReports.map((r) => (
                  <ReportCard key={r.reportCode} report={r} isFavorite={favorites.has(r.reportCode)} onFavorite={handleFavorite} />
                ))}
              </div>
            </div>
          )}

          {/* Main catalog */}
          {catalog.loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-card border border-tetri-border p-4 animate-pulse">
                  <div className="h-3 bg-slate-100 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-slate-100 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-full mb-1" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : filteredCatalog.length === 0 ? (
            <div className="bg-white rounded-card border border-tetri-border p-12 text-center">
              <BarChart2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-tetri-muted">No reports available for your role or search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredCatalog.map((r) => (
                <ReportCard key={r.reportCode} report={r} isFavorite={favorites.has(r.reportCode)} onFavorite={handleFavorite} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* SAVED TAB */}
      {tab === 'Saved' && (
        <div>
          {saved.loading ? (
            <div className="space-y-2 animate-pulse">
              {[1,2,3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
            </div>
          ) : (saved.data || []).length === 0 ? (
            <div className="bg-white rounded-card border border-tetri-border p-12 text-center">
              <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-tetri-muted">No saved reports yet. Run a report and click Save.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(saved.data || []).map((s) => (
                <div key={s.id} className="bg-white rounded-card border border-tetri-border p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {s.isFavorite && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />}
                      <p className="text-sm font-semibold text-tetri-text truncate">{s.savedName}</p>
                      <span className="text-[10px] bg-slate-100 text-tetri-muted px-1.5 py-0.5 rounded-full uppercase">{s.reportCode.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] bg-slate-100 text-tetri-muted px-1.5 py-0.5 rounded-full">{s.visibility}</span>
                    </div>
                    <p className="text-[11px] text-tetri-muted mt-0.5">
                      Saved {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/reports/${s.reportCode}?savedId=${s.id}`}
                      className="flex items-center gap-1 text-xs font-medium text-tetri-blue hover:underline"
                    >
                      <Play className="w-3 h-3" /> Open
                    </Link>
                    <button
                      onClick={() => handleDeleteSaved(s.id)}
                      className="p-1 text-tetri-muted hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SCHEDULES TAB */}
      {tab === 'Schedules' && (
        <div>
          {schedules.loading ? (
            <div className="space-y-2 animate-pulse">
              {[1,2,3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
            </div>
          ) : (schedules.data || []).length === 0 ? (
            <div className="bg-white rounded-card border border-tetri-border p-12 text-center">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-tetri-muted">No scheduled reports yet. Open a report and click Schedule.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(schedules.data || []).map((s) => (
                <div key={s.id} className="bg-white rounded-card border border-tetri-border p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-tetri-text">{s.scheduleName}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${s.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-tetri-muted'}`}>
                        {s.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <p className="text-[11px] text-tetri-muted">
                      {s.frequency} · {s.deliveryTime} · {s.exportFormat.toUpperCase()} ·{' '}
                      Next: {s.nextRunAt ? new Date(s.nextRunAt).toLocaleString() : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRunNow(s.id)}
                      className="flex items-center gap-1 text-xs font-medium text-tetri-blue border border-tetri-blue/30 px-2 py-1 rounded-lg hover:bg-[#eff4ff]"
                    >
                      <Play className="w-3 h-3" /> Run Now
                    </button>
                    <button
                      onClick={() => schedules.refresh()}
                      className="p-1 text-tetri-muted hover:text-tetri-blue"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSchedule(s.id)}
                      className="p-1 text-tetri-muted hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

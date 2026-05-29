import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Search, Archive, ArchiveRestore, Bot, Sparkles, Clock,
  MessageSquare, Pencil, Trash2, Download, Check, X,
  MoreHorizontal, Menu,
} from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import RecommendationsPanel from '../components/RecommendationsPanel';
import assistantService from '../services/assistantService';
import api from '../../../lib/api';
import PageHeader from '../../../components/shared/PageHeader';

// ── Helpers ───────────────────────────────────────────────────────────────────

function relativeDate(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins < 2)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function lastPreview(session) {
  const last = session.messages?.[0];
  if (!last) return null;
  const text = last.message || '';
  return text.length > 60 ? text.slice(0, 60) + '…' : text;
}

// ── Session item ──────────────────────────────────────────────────────────────

function SessionItem({ session, active, isArchived, onClick, onRename, onArchive, onRestore, onDelete, onExport }) {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [renaming,    setRenaming]    = useState(false);
  const [renameValue, setRenameValue] = useState(session.title || '');
  const renameRef = useRef(null);
  const menuRef   = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const startRename = (e) => {
    e.stopPropagation();
    setMenuOpen(false);
    setRenameValue(session.title || '');
    setRenaming(true);
    setTimeout(() => renameRef.current?.select(), 50);
  };

  const commitRename = async () => {
    setRenaming(false);
    if (renameValue.trim() && renameValue !== session.title) {
      await onRename(session.id, renameValue.trim());
    }
  };

  const msgCount = session._count?.messages ?? 0;
  const preview  = lastPreview(session);

  return (
    <div className={`relative group/item rounded-xl transition-colors ${active ? 'bg-[#eff4ff]' : 'hover:bg-tetri-bg'}`}>
      {renaming ? (
        <div className="flex items-center gap-1 px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
          <input
            ref={renameRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') setRenaming(false);
            }}
            onBlur={commitRename}
            className="flex-1 text-xs rounded-lg border border-tetri-blue px-2 py-1 text-tetri-text focus:outline-none bg-white"
          />
          <button onClick={commitRename}   className="p-0.5 text-tetri-blue"><Check className="w-3 h-3" /></button>
          <button onClick={() => setRenaming(false)} className="p-0.5 text-tetri-muted"><X className="w-3 h-3" /></button>
        </div>
      ) : (
        <button onClick={onClick} className="w-full text-left px-3 py-2.5 flex items-start gap-2.5">
          <MessageSquare className={`w-4 h-4 flex-shrink-0 mt-0.5 ${active ? 'text-tetri-blue' : 'text-tetri-muted'}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-medium truncate ${active ? 'text-tetri-blue' : 'text-tetri-text'}`}>
              {session.title || 'Untitled'}
            </p>
            {preview && (
              <p className="text-xs text-tetri-muted truncate mt-0.5">{preview}</p>
            )}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-tetri-muted">{msgCount} msg{msgCount !== 1 ? 's' : ''}</span>
              <span className="text-xs text-tetri-muted">· {relativeDate(session.updatedAt)}</span>
            </div>
          </div>
        </button>
      )}

      {/* Actions menu */}
      {!renaming && (
        <div ref={menuRef} className="absolute right-1.5 top-1/2 -translate-y-1/2">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="p-1 rounded-lg opacity-0 group-hover/item:opacity-100 text-tetri-muted hover:bg-white hover:text-tetri-text transition-all"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-40 bg-white border border-tetri-border rounded-xl shadow-lg overflow-hidden py-1">
              {!isArchived && (
                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); startRename(e); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-tetri-text hover:bg-tetri-bg flex items-center gap-2">
                  <Pencil className="w-3 h-3" /> Rename
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onExport(session.id, 'md'); }}
                className="w-full text-left px-3 py-1.5 text-xs text-tetri-text hover:bg-tetri-bg flex items-center gap-2">
                <Download className="w-3 h-3" /> Export (.md)
              </button>
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onExport(session.id, 'txt'); }}
                className="w-full text-left px-3 py-1.5 text-xs text-tetri-text hover:bg-tetri-bg flex items-center gap-2">
                <Download className="w-3 h-3" /> Export (.txt)
              </button>
              <div className="my-1 border-t border-tetri-border" />
              {isArchived ? (
                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onRestore(session.id); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-tetri-text hover:bg-tetri-bg flex items-center gap-2">
                  <ArchiveRestore className="w-3 h-3" /> Restore
                </button>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onArchive(session.id); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-tetri-text hover:bg-tetri-bg flex items-center gap-2">
                  <Archive className="w-3 h-3" /> Archive
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(session.id); }}
                className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuickPromptChip({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-tetri-border text-xs text-tetri-muted hover:border-tetri-blue hover:text-tetri-blue hover:bg-[#eff4ff] transition-colors bg-tetri-surface font-medium"
    >
      <Sparkles className="w-3 h-3" />
      {label}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AssistantPage() {
  const [sessions,      setSessions]      = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [quickPrompts,  setQuickPrompts]  = useState([]);
  const [suggestions,   setSuggestions]   = useState([]);
  const [search,        setSearch]        = useState('');
  const [tab,           setTab]           = useState('active'); // 'active' | 'archived'
  const [creating,      setCreating]      = useState(false);
  const [createError,   setCreateError]   = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const loadSessions = useCallback(async (q, currentTab) => {
    try {
      const status = currentTab || tab;
      const data   = q
        ? await assistantService.listSessions({ search: q, status })
        : await assistantService.listSessions({ status });
      setSessions(data || []);
    } catch {
      setSessions([]);
    }
  }, [tab]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [sess, prompts, sugg] = await Promise.all([
          assistantService.listSessions({ status: 'active' }),
          assistantService.getQuickPrompts(),
          assistantService.getSuggestions(),
        ]);
        setSessions(sess    || []);
        setQuickPrompts(prompts || []);
        setSuggestions(sugg  || []);
      } catch {
        // load what we can
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Re-load sessions when tab changes
  useEffect(() => {
    loadSessions(search, tab);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => loadSessions(search, tab), 300);
    return () => clearTimeout(t);
  }, [search, loadSessions, tab]);

  // ── CRUD helpers ─────────────────────────────────────────────────────────────

  const createSession = async (title) => {
    if (creating) return;
    setCreating(true);
    setCreateError(null);
    try {
      const session = await assistantService.createSession({ title });
      setSessions((prev) => [session, ...prev]);
      setActiveSession(session);
    } catch (err) {
      setCreateError(err?.response?.data?.error || 'Failed to start conversation. Please try again.');
      setPendingPrompt(null);
    } finally {
      setCreating(false);
    }
  };

  const startWithPrompt = async (prompt) => {
    if (!prompt) return;
    const title = prompt.length > 55 ? prompt.slice(0, 55) + '…' : prompt;
    setPendingPrompt(prompt);
    await createSession(title);
  };

  const renameSession = async (id, title) => {
    try {
      await assistantService.renameSession(id, title);
      setSessions((prev) => prev.map((s) => s.id === id ? { ...s, title } : s));
      if (activeSession?.id === id) setActiveSession((s) => ({ ...s, title }));
    } catch {}
  };

  const archiveSession = async (id) => {
    try {
      await assistantService.archiveSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSession?.id === id) setActiveSession(null);
    } catch {}
  };

  const restoreSession = async (id) => {
    try {
      await assistantService.restoreSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSession?.id === id) setActiveSession(null);
    } catch {}
  };

  const deleteSession = async (id) => {
    if (!window.confirm('Delete this conversation permanently?')) return;
    try {
      await assistantService.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSession?.id === id) setActiveSession(null);
    } catch {}
  };

  const exportSession = async (id, fmt) => {
    try {
      const resp = await api.get(`/api/v1/assistant/sessions/${id}/export?format=${fmt}`, { responseType: 'blob' });
      const url  = URL.createObjectURL(resp.data);
      const a    = document.createElement('a');
      const cd   = resp.headers['content-disposition'] || '';
      const fn   = cd.match(/filename="?([^"]+)"?/)?.[1] || `conversation.${fmt}`;
      a.href = url; a.download = fn; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const activeSugg = suggestions.filter((s) => s.status === 'active');

  return (
    <div className="flex h-[calc(100vh-88px)] -my-6 -mx-6 md:-mx-8 overflow-hidden">
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <div className={`flex-shrink-0 border-r border-tetri-border bg-tetri-surface flex flex-col w-72 md:w-64 ${mobileSidebarOpen ? 'fixed left-0 top-0 bottom-0 z-50' : 'hidden md:flex'}`}>
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-tetri-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-violet-600" />
            </div>
            <h1 className="text-sm font-semibold text-tetri-text">Tetri Copilot</h1>
            <button onClick={() => setMobileSidebarOpen(false)} className="ml-auto p-1 rounded-lg text-tetri-neutral hover:bg-tetri-bg md:hidden">
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => { setTab('active'); createSession(); }}
            disabled={creating}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-tetri-blue text-white text-sm font-medium hover:bg-tetri-blue-hover transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {creating ? 'Starting…' : 'New conversation'}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-tetri-border">
          {['active', 'archived'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setActiveSession(null); }}
              className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${
                tab === t
                  ? 'text-tetri-blue border-b-2 border-tetri-blue'
                  : 'text-tetri-muted hover:text-tetri-text'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-tetri-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tetri-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-tetri-border bg-tetri-bg text-tetri-text placeholder:text-tetri-muted focus:outline-none focus:ring-2 focus:ring-tetri-blue/20 focus:border-tetri-blue transition-colors"
            />
          </div>
        </div>

        {/* Session list */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-0.5">
          {loading && (
            <div className="flex justify-center py-6">
              <div className="w-4 h-4 border-2 border-tetri-blue/30 border-t-tetri-blue rounded-full animate-spin" />
            </div>
          )}
          {!loading && sessions.length === 0 && (
            <div className="text-center py-6">
              <Clock className="w-5 h-5 text-tetri-muted mx-auto mb-2" />
              <p className="text-xs text-tetri-muted">
                {tab === 'archived' ? 'No archived conversations' : 'No conversations yet'}
              </p>
            </div>
          )}
          {sessions.map((s) => (
            <SessionItem
              key={s.id}
              session={s}
              active={activeSession?.id === s.id}
              isArchived={tab === 'archived'}
              onClick={() => setActiveSession(s)}
              onRename={renameSession}
              onArchive={archiveSession}
              onRestore={restoreSession}
              onDelete={deleteSession}
              onExport={exportSession}
            />
          ))}
        </div>

        {/* Recommendations panel */}
        <RecommendationsPanel
          onAskCopilot={(prompt) => { setTab('active'); startWithPrompt(prompt); }}
        />
      </div>

      {/* ── Main area ───────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col bg-tetri-bg overflow-hidden">
        {/* Mobile toolbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-tetri-border bg-tetri-surface flex-shrink-0">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-tetri-text flex-1 truncate">
            {activeSession?.title || 'AI Assistant'}
          </span>
          <button
            onClick={() => { setTab('active'); createSession(); }}
            disabled={creating}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-tetri-blue text-white text-xs font-medium hover:bg-tetri-blue-hover disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {activeSession ? (
          <>
            {/* Conversation top bar */}
            <div className="hidden md:flex items-center gap-3 px-6 py-3 border-b border-tetri-border bg-tetri-surface flex-shrink-0">
              <p className="text-sm font-semibold text-tetri-text truncate flex-1">
                {activeSession.title || 'Untitled'}
              </p>
              <button
                onClick={() => exportSession(activeSession.id, 'md')}
                title="Export as Markdown"
                className="p-1.5 rounded-lg text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors flex items-center gap-1 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>

            <ChatInterface
              key={activeSession.id}
              session={activeSession}
              quickPrompts={quickPrompts}
              initialPrompt={pendingPrompt}
              onSessionUpdate={() => {
                setPendingPrompt(null);
                loadSessions(search, tab);
              }}
            />
          </>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
            {createError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center justify-between">
                <span>{createError}</span>
                <button onClick={() => setCreateError(null)} className="ml-3 text-red-400 hover:text-red-600 text-xs underline">Dismiss</button>
              </div>
            )}

            <PageHeader
              title="Workspace Assistant"
              subtitle="Ask questions about your workspace in plain language."
            />

            {/* Workspace alerts */}
            {activeSugg.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-tetri-muted mb-3">Workspace Alerts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeSugg.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => startWithPrompt(s.content?.prompt || s.content?.title)}
                      className={`text-left p-4 rounded-xl border transition-colors ${
                        s.suggestionType === 'alert'
                          ? 'border-amber-200 bg-amber-50 hover:bg-amber-100'
                          : 'border-tetri-border bg-tetri-surface hover:bg-tetri-bg'
                      }`}
                    >
                      <p className="text-sm font-semibold text-tetri-text">{s.content?.title}</p>
                      <p className="text-xs text-tetri-muted mt-1">{s.content?.body}</p>
                      <p className="text-xs text-tetri-blue mt-2 font-medium">Ask Copilot →</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick prompts */}
            {quickPrompts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-tetri-muted mb-3">Quick Prompts</h2>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((p) => (
                    <QuickPromptChip key={p.id} label={p.label} onClick={() => startWithPrompt(p.prompt)} />
                  ))}
                </div>
              </div>
            )}

            {/* Example questions */}
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-tetri-muted mb-3">Try asking</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Show me all overdue invoices.',
                  'Which expenses are awaiting approval?',
                  'What compliance deadlines are due this week?',
                  'Give me a business overview.',
                  'Who are our top customers?',
                  'How much revenue did we collect this month?',
                ].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => startWithPrompt(ex)}
                    className="text-left px-4 py-3 rounded-xl border border-tetri-border bg-tetri-surface hover:border-tetri-blue hover:bg-[#eff4ff] transition-colors text-sm text-tetri-muted hover:text-tetri-blue"
                  >
                    "{ex}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

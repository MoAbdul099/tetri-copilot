import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Archive, Bot, Sparkles, Clock, MessageSquare, ChevronRight } from 'lucide-react';
import ChatInterface from '../components/ChatInterface';
import assistantService from '../services/assistantService';
import PageHeader from '../../../components/shared/PageHeader';

function SessionItem({ session, active, onClick }) {
  const msgCount = session._count?.messages ?? 0;
  const updated  = session.updatedAt
    ? new Date(session.updatedAt).toLocaleDateString()
    : '';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors flex items-start gap-2.5 group ${
        active
          ? 'bg-[#eff4ff] text-tetri-blue'
          : 'hover:bg-tetri-bg text-tetri-muted hover:text-tetri-text'
      }`}
    >
      <MessageSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${active ? 'text-tetri-blue' : 'text-tetri-text'}`}>
          {session.title || 'Untitled'}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-tetri-muted">{msgCount} msg{msgCount !== 1 ? 's' : ''}</span>
          {updated && <span className="text-xs text-tetri-muted">· {updated}</span>}
        </div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
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

export default function AssistantPage() {
  const [sessions,     setSessions]     = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [quickPrompts, setQuickPrompts] = useState([]);
  const [suggestions,  setSuggestions]  = useState([]);
  const [search,       setSearch]       = useState('');
  const [creating,     setCreating]     = useState(false);
  const [createError,  setCreateError]  = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [pendingPrompt, setPendingPrompt] = useState(null);

  const loadSessions = useCallback(async (q) => {
    try {
      const data = q
        ? await assistantService.listSessions({ search: q })
        : await assistantService.listSessions();
      setSessions(data || []);
    } catch {
      setSessions([]);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [sessions, prompts, sugg] = await Promise.all([
          assistantService.listSessions(),
          assistantService.getQuickPrompts(),
          assistantService.getSuggestions(),
        ]);
        setSessions(sessions || []);
        setQuickPrompts(prompts || []);
        setSuggestions(sugg || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadSessions(search), 300);
    return () => clearTimeout(t);
  }, [search, loadSessions]);

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
    setPendingPrompt(prompt);
    await createSession(prompt.substring(0, 60));
  };

  const archiveSession = async (id) => {
    try {
      await assistantService.archiveSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSession?.id === id) setActiveSession(null);
    } catch {
      // ignore
    }
  };

  const activeSugg = suggestions.filter((s) => s.status === 'active');

  return (
    <div className="flex h-[calc(100vh-88px)] -my-6 -mx-6 md:-mx-8">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-tetri-border bg-tetri-surface flex flex-col">
        <div className="px-4 pt-5 pb-3 border-b border-tetri-border">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-violet-600" />
            </div>
            <h1 className="text-sm font-semibold text-tetri-text">Tetri Copilot</h1>
          </div>
          <button
            onClick={() => createSession()}
            disabled={creating}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-tetri-blue text-white text-sm font-medium hover:bg-tetri-blue-hover transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {creating ? 'Starting…' : 'New conversation'}
          </button>
        </div>

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

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          {loading && (
            <div className="flex justify-center py-6">
              <div className="w-4 h-4 border-2 border-tetri-blue/30 border-t-tetri-blue rounded-full animate-spin" />
            </div>
          )}
          {!loading && sessions.length === 0 && (
            <div className="text-center py-6">
              <Clock className="w-5 h-5 text-tetri-muted mx-auto mb-2" />
              <p className="text-xs text-tetri-muted">No conversations yet</p>
            </div>
          )}
          {sessions.map((s) => (
            <div key={s.id} className="group/item relative">
              <SessionItem
                session={s}
                active={activeSession?.id === s.id}
                onClick={() => setActiveSession(s)}
              />
              <button
                onClick={(e) => { e.stopPropagation(); archiveSession(s.id); }}
                title="Archive"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover/item:opacity-100 text-tetri-muted hover:text-tetri-error transition-all"
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 min-w-0 flex flex-col bg-tetri-bg">
        {activeSession ? (
          <ChatInterface
            key={activeSession.id}
            session={activeSession}
            quickPrompts={quickPrompts}
            initialPrompt={pendingPrompt}
            onSessionUpdate={() => { setPendingPrompt(null); loadSessions(search); }}
          />
        ) : (
          <div className="flex-1 overflow-y-auto px-8 py-8">
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

            {/* Alerts / suggestions */}
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
            <div className="mb-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-tetri-muted mb-3">Quick Prompts</h2>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((p) => (
                  <QuickPromptChip
                    key={p.id}
                    label={p.label}
                    onClick={() => startWithPrompt(p.prompt)}
                  />
                ))}
              </div>
            </div>

            {/* Examples */}
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

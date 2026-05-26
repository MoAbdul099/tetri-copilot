import { useEffect, useState } from 'react';
import { MessageSquare, ChevronRight, ChevronDown, Clock, User, Bot, Archive } from 'lucide-react';
import aiAdminService from '../services/aiAdminService';
import PageHeader from '../../../components/shared/PageHeader';

const STATUS_COLORS = {
  active:   'bg-emerald-100 text-emerald-700',
  archived: 'bg-slate-100 text-slate-500',
  closed:   'bg-red-100 text-red-700',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AIConversationsPage() {
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState(null);
  const [filter,    setFilter]    = useState({ featureCode: '', status: '' });

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (filter.featureCode) params.featureCode = filter.featureCode;
      if (filter.status)      params.status      = filter.status;
      setSessions(await aiAdminService.listConversations(params));
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [filter]);

  const features = [...new Set(sessions.map((s) => s.featureCode))];

  if (loading) return <div className="p-8 text-tetri-muted text-sm">Loading conversations…</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <PageHeader title="Conversation Management" subtitle="View and monitor AI conversation sessions" />

      {/* Filters */}
      <div className="flex gap-3">
        <select value={filter.featureCode} onChange={(e) => setFilter({ ...filter, featureCode: e.target.value })} className="border border-tetri-border rounded-btn px-3 py-1.5 text-sm bg-tetri-surface text-tetri-text focus:outline-none">
          <option value="">All Features</option>
          {features.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })} className="border border-tetri-border rounded-btn px-3 py-1.5 text-sm bg-tetri-surface text-tetri-text focus:outline-none">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="bg-tetri-surface border border-tetri-border rounded-card overflow-hidden">
        {sessions.length === 0 ? (
          <div className="p-12 text-center text-tetri-muted text-sm">No conversations found.</div>
        ) : (
          <div className="divide-y divide-tetri-border">
            {sessions.map((s) => (
              <div key={s.id}>
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-tetri-bg/50 transition-colors text-left"
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                    <MessageSquare size={14} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-tetri-text text-sm truncate">{s.title || 'Untitled'}</div>
                    <div className="text-xs text-tetri-muted flex items-center gap-3 mt-0.5">
                      <span className="font-mono">{s.featureCode}</span>
                      <span>{s._count?.messages ?? 0} messages</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{timeAgo(s.updatedAt)}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${STATUS_COLORS[s.status] || 'bg-slate-100 text-slate-600'}`}>{s.status}</span>
                  {expanded === s.id ? <ChevronDown size={14} className="text-tetri-muted shrink-0" /> : <ChevronRight size={14} className="text-tetri-muted shrink-0" />}
                </button>

                {expanded === s.id && (
                  <div className="bg-tetri-bg border-t border-tetri-border px-5 py-4 space-y-3">
                    <div className="text-xs text-tetri-muted mb-2">Session ID: <span className="font-mono">{s.id}</span></div>
                    {s.messages && s.messages.length > 0 ? (
                      s.messages.map((m) => (
                        <div key={m.id} className={`flex gap-3 ${m.senderType === 'user' ? '' : 'flex-row-reverse'}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${m.senderType === 'user' ? 'bg-tetri-blue/10 text-tetri-blue' : 'bg-violet-100 text-violet-600'}`}>
                            {m.senderType === 'user' ? <User size={11} /> : <Bot size={11} />}
                          </div>
                          <div className={`max-w-lg rounded-xl px-3 py-2 text-sm ${m.senderType === 'user' ? 'bg-tetri-surface border border-tetri-border text-tetri-text' : 'bg-violet-50 text-violet-900'}`}>
                            <p className="whitespace-pre-wrap">{m.content}</p>
                            {m.cost > 0 && <p className="text-xs text-tetri-muted mt-1">${m.cost?.toFixed(6)} · {m.tokenCount} tokens</p>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-tetri-muted">No messages stored for this session view. Messages are loaded on expansion from the API.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

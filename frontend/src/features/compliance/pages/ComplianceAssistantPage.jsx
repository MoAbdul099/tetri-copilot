import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot, Plus, Trash2, Archive, Download, MessageSquare,
  Send, Loader2, ThumbsUp, ThumbsDown, Flag, Copy,
  ChevronRight, Sparkles, AlertTriangle, Clock, Shield,
  BookOpen, X, MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import {
  getSuggestedQuestions, listConversations, createConversation,
  getConversation, updateConversation, deleteConversation, archiveConversation,
  sendMessage, submitFeedback, exportConversation,
} from '../services/complianceAssistantService.js';

// ---- Helpers ----

function relativeDate(iso) {
  if (!iso) return '';
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins < 2)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function lastPreview(conv) {
  const last = conv.messages?.[0];
  if (!last) return null;
  return last.content?.length > 55 ? last.content.slice(0, 55) + '…' : last.content;
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ---- Message bubble ----

function Message({ msg, onFeedback }) {
  const [feedbackGiven, setFeedbackGiven] = useState(msg.feedback?.length > 0);
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === 'user';

  const handleFeedback = async (type) => {
    try {
      await onFeedback(msg.id, type);
      setFeedbackGiven(true);
    } catch { /* silent */ }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(msg.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <Shield className="w-4 h-4 text-emerald-600" />
        </div>
      )}
      <div className={`max-w-[75%] space-y-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-tetri-blue text-white rounded-tr-sm'
            : 'bg-white border border-tetri-border text-tetri-text rounded-tl-sm'
        }`}>
          <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
        </div>

        {/* Sources */}
        {!isUser && msg.sources?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1">
            {msg.sources.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs text-tetri-neutral bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                <BookOpen className="w-2.5 h-2.5" /> {s}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        {!isUser && (
          <div className="flex items-center gap-1 px-1">
            <button onClick={handleCopy} title="Copy" className="p-1 rounded text-tetri-neutral hover:text-tetri-text hover:bg-tetri-surface transition-colors">
              {copied ? <span className="text-xs text-green-600">✓</span> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {!feedbackGiven ? (
              <>
                <button onClick={() => handleFeedback('helpful')} title="Helpful" className="p-1 rounded text-tetri-neutral hover:text-green-600 hover:bg-green-50 transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleFeedback('not_helpful')} title="Not helpful" className="p-1 rounded text-tetri-neutral hover:text-red-500 hover:bg-red-50 transition-colors">
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleFeedback('report')} title="Report issue" className="p-1 rounded text-tetri-neutral hover:text-orange-500 hover:bg-orange-50 transition-colors">
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <span className="text-xs text-tetri-neutral">Thanks for your feedback</span>
            )}
            <span className="text-xs text-tetri-muted ml-1">{relativeDate(msg.createdAt)}</span>
          </div>
        )}
        {isUser && (
          <span className="text-xs text-tetri-muted px-1">{relativeDate(msg.createdAt)}</span>
        )}
      </div>
      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-tetri-surface border border-tetri-border flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-tetri-neutral" />
        </div>
      )}
    </div>
  );
}

// ---- Conversation sidebar item ----

function ConvItem({ conv, active, onClick, onDelete, onArchive, onExport }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
        active ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-tetri-surface border border-transparent'
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium truncate ${active ? 'text-emerald-700' : 'text-tetri-text'}`}>
          {conv.title || 'New Conversation'}
        </p>
        {lastPreview(conv) && (
          <p className="text-xs text-tetri-neutral truncate mt-0.5">{lastPreview(conv)}</p>
        )}
        <p className="text-xs text-tetri-muted mt-0.5">{relativeDate(conv.updatedAt)}</p>
      </div>
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((p) => !p); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-tetri-neutral hover:text-tetri-text transition-all"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-6 bg-white border border-tetri-border rounded-xl shadow-lg z-10 py-1 w-36">
            <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onExport('md'); }}
              className="w-full text-left px-3 py-1.5 text-xs text-tetri-neutral hover:bg-tetri-surface flex items-center gap-2">
              <Download className="w-3.5 h-3.5" /> Export .md
            </button>
            <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onExport('txt'); }}
              className="w-full text-left px-3 py-1.5 text-xs text-tetri-neutral hover:bg-tetri-surface flex items-center gap-2">
              <Download className="w-3.5 h-3.5" /> Export .txt
            </button>
            <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onArchive(); }}
              className="w-full text-left px-3 py-1.5 text-xs text-tetri-neutral hover:bg-tetri-surface flex items-center gap-2">
              <Archive className="w-3.5 h-3.5" /> Archive
            </button>
            <button onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(); }}
              className="w-full text-left px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Empty state ----

function EmptyState({ onNew, suggestedQuestions, onQuestion }) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-6 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
        <Shield className="w-8 h-8 text-emerald-600" />
      </div>
      <div className="text-center">
        <h3 className="text-base font-semibold text-tetri-text">AI Compliance Assistant</h3>
        <p className="text-sm text-tetri-neutral mt-1 max-w-sm">
          Ask questions about your compliance obligations, deadlines, and requirements.
          I have access to your workspace compliance data.
        </p>
      </div>
      <div className="w-full max-w-md space-y-2">
        <p className="text-xs text-tetri-neutral font-medium text-center mb-3">Try asking…</p>
        {suggestedQuestions.slice(0, 5).map((q, i) => (
          <button
            key={i}
            onClick={() => onQuestion(q)}
            className="w-full text-left px-4 py-2.5 rounded-xl border border-tetri-border bg-white hover:border-emerald-300 hover:bg-emerald-50 text-xs text-tetri-text transition-colors flex items-center justify-between gap-2 group"
          >
            <span>{q}</span>
            <ChevronRight className="w-3.5 h-3.5 text-tetri-neutral group-hover:text-emerald-600 shrink-0" />
          </button>
        ))}
      </div>
      <p className="text-xs text-tetri-muted text-center max-w-xs">
        Read-only mode · AI cannot create, update, or submit records · Always verify with a professional
      </p>
    </div>
  );
}

// ---- Main Page ----

export default function ComplianceAssistantPage() {
  const { showToast, ToastContainer } = useToast();

  const [conversations,   setConversations]   = useState([]);
  const [activeConv,      setActiveConv]       = useState(null);
  const [messages,        setMessages]         = useState([]);
  const [input,           setInput]            = useState('');
  const [sending,         setSending]          = useState(false);
  const [loading,         setLoading]          = useState(false);
  const [convsLoading,    setConvsLoading]     = useState(true);
  const [suggestedQs,     setSuggestedQs]      = useState([]);
  const [sidebarOpen,     setSidebarOpen]      = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scrollToBottom, [messages]);

  // Load conversations and suggested questions on mount
  const loadConversations = useCallback(async () => {
    setConvsLoading(true);
    try {
      const data = await listConversations({ status: 'active' });
      setConversations(data.conversations || []);
    } catch { /* silent */ }
    finally { setConvsLoading(false); }
  }, []);

  useEffect(() => {
    loadConversations();
    getSuggestedQuestions().then((d) => setSuggestedQs(d.questions || [])).catch(() => {});
  }, []);

  // Load a conversation
  const openConversation = async (id) => {
    if (loading) return;
    setLoading(true);
    try {
      const conv = await getConversation(id);
      setActiveConv(conv);
      setMessages(conv.messages || []);
      inputRef.current?.focus();
    } catch {
      showToast('error', 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  // Create new conversation
  const handleNew = async () => {
    try {
      const conv = await createConversation({ title: 'New Conversation' });
      setConversations((prev) => [conv, ...prev]);
      setActiveConv(conv);
      setMessages([]);
      inputRef.current?.focus();
    } catch {
      showToast('error', 'Failed to create conversation');
    }
  };

  // Send message
  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;

    let convId = activeConv?.id;

    // Auto-create conversation if none active
    if (!convId) {
      try {
        const conv = await createConversation({ title: msg.length > 60 ? msg.substring(0, 60) + '…' : msg });
        setConversations((prev) => [conv, ...prev]);
        setActiveConv(conv);
        convId = conv.id;
      } catch {
        showToast('error', 'Failed to start conversation');
        return;
      }
    }

    setInput('');
    setSending(true);

    // Optimistic user message
    const tempUserMsg = { id: `tmp-${Date.now()}`, role: 'user', content: msg, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, tempUserMsg]);

    // Thinking indicator
    const thinkingId = `thinking-${Date.now()}`;
    setMessages((prev) => [...prev, { id: thinkingId, role: 'assistant', content: '…', thinking: true, createdAt: new Date().toISOString() }]);

    try {
      const result = await sendMessage(convId, msg);
      setMessages((prev) => prev.filter((m) => m.id !== thinkingId).concat(result.assistantMessage));
      // Update conversation list with auto-title
      loadConversations();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== thinkingId));
      showToast('error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Feedback
  const handleFeedback = async (messageId, feedbackType) => {
    try {
      await submitFeedback({ messageId, feedbackType });
    } catch {
      showToast('error', 'Failed to record feedback');
      throw new Error('feedback failed');
    }
  };

  // Delete conversation
  const handleDelete = async (id) => {
    if (!confirm('Delete this conversation?')) return;
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConv?.id === id) { setActiveConv(null); setMessages([]); }
    } catch {
      showToast('error', 'Failed to delete');
    }
  };

  // Archive conversation
  const handleArchive = async (id) => {
    try {
      await archiveConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConv?.id === id) { setActiveConv(null); setMessages([]); }
      showToast('success', 'Conversation archived');
    } catch {
      showToast('error', 'Failed to archive');
    }
  };

  // Export conversation
  const handleExport = async (id, format) => {
    try {
      const blob = await exportConversation(id, format);
      triggerBlobDownload(blob, `compliance-${id.slice(0, 8)}.${format}`);
    } catch {
      showToast('error', 'Export failed');
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col space-y-4">
      {ToastContainer}

      <PageHeader title="Compliance Assistant" subtitle="AI-powered compliance Q&A — read-only">
        <div className="flex gap-2">
          <Button size="sm" onClick={handleNew} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4" /> New Chat
          </Button>
        </div>
      </PageHeader>

      {/* Read-only notice */}
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        Read-only mode — AI cannot create, modify, or submit compliance records. Always verify with a qualified professional.
      </div>

      {/* Main layout */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* ---- Sidebar ---- */}
        {sidebarOpen && (
          <div className="w-64 shrink-0 flex flex-col gap-2 bg-white border border-tetri-border rounded-2xl p-3 overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-tetri-text">Conversations</p>
              <button onClick={() => setSidebarOpen(false)} className="text-tetri-neutral hover:text-tetri-text p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-tetri-border text-xs text-tetri-neutral hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New conversation
            </button>

            <div className="flex-1 overflow-y-auto space-y-1">
              {convsLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin text-tetri-neutral" /></div>
              ) : conversations.length === 0 ? (
                <p className="text-xs text-tetri-neutral text-center py-4">No conversations yet</p>
              ) : (
                conversations.map((conv) => (
                  <ConvItem
                    key={conv.id}
                    conv={conv}
                    active={activeConv?.id === conv.id}
                    onClick={() => openConversation(conv.id)}
                    onDelete={() => handleDelete(conv.id)}
                    onArchive={() => handleArchive(conv.id)}
                    onExport={(fmt) => handleExport(conv.id, fmt)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* ---- Chat area ---- */}
        <div className="flex-1 flex flex-col bg-white border border-tetri-border rounded-2xl overflow-hidden min-h-0">

          {/* Header strip */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-tetri-border">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="text-tetri-neutral hover:text-tetri-text p-1">
                <MessageSquare className="w-4 h-4" />
              </button>
            )}
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-tetri-text">
              {activeConv?.title || 'AI Compliance Assistant'}
            </span>
            <span className="ml-auto text-xs text-tetri-neutral flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Workspace-aware
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-tetri-neutral" /></div>
            ) : messages.length === 0 ? (
              <EmptyState
                onNew={handleNew}
                suggestedQuestions={suggestedQs}
                onQuestion={(q) => handleSend(q)}
              />
            ) : (
              messages.map((msg) => (
                msg.thinking ? (
                  <div key={msg.id} className="flex gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="bg-white border border-tetri-border rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-tetri-neutral rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-tetri-neutral rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-tetri-neutral rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <Message key={msg.id} msg={msg} onFeedback={handleFeedback} />
                )
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions chips (when chat is active but no messages) */}
          {activeConv && messages.length === 0 && suggestedQs.length > 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {suggestedQs.slice(0, 4).map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-tetri-border bg-tetri-surface hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 text-tetri-neutral transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-tetri-border px-4 py-3">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a compliance question… (Enter to send, Shift+Enter for new line)"
                rows={2}
                className="flex-1 text-sm border border-tetri-border rounded-xl px-3 py-2 bg-white text-tetri-text focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 h-10"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

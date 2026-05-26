import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Bot, Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';
import assistantService from '../services/assistantService';

export default function ChatInterface({ session, onSessionUpdate, quickPrompts = [], initialPrompt }) {
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [loadingMsgs,  setLoadingMsgs]  = useState(true);
  const bottomRef    = useRef(null);
  const inputRef     = useRef(null);
  const sentInitial  = useRef(false);
  const streamingRef = useRef(null); // id of the in-progress streaming bubble

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  const loadMessages = useCallback(async () => {
    if (!session?.id) return;
    setLoadingMsgs(true);
    try {
      const msgs = await assistantService.getMessages(session.id);
      setMessages(msgs || []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, [session?.id]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // Auto-send initialPrompt once messages are ready
  useEffect(() => {
    if (initialPrompt && !loadingMsgs && !sentInitial.current) {
      sentInitial.current = true;
      sendMessage(initialPrompt);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, loadingMsgs]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setLoading(true);

    // Optimistic user bubble
    const userTmpId    = `tmp-user-${Date.now()}`;
    const streamTmpId  = `tmp-stream-${Date.now()}`;
    streamingRef.current = streamTmpId;

    setMessages((prev) => [
      ...prev,
      { id: userTmpId,   senderType: 'user',      message: msg,  createdAt: new Date().toISOString() },
      { id: streamTmpId, senderType: 'assistant',  message: '',   streaming: true, createdAt: new Date().toISOString() },
    ]);

    await assistantService.streamChat(session.id, msg, {
      onChunk: (text) => {
        setMessages((prev) =>
          prev.map((m) => m.id === streamTmpId ? { ...m, message: m.message + text } : m)
        );
      },
      onDone: (event) => {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === streamTmpId) {
              return { ...m, id: event.messageId, message: event.message, streaming: false };
            }
            if (m.id === userTmpId) {
              return { ...m, id: `user-confirmed-${Date.now()}` };
            }
            return m;
          })
        );
        streamingRef.current = null;
        setLoading(false);
        inputRef.current?.focus();
        if (onSessionUpdate) onSessionUpdate();
      },
      onError: (errMsg) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === streamTmpId
              ? { ...m, message: errMsg || 'Something went wrong. Please try again.', streaming: false, metadata: { blocked: true } }
              : m
          )
        );
        streamingRef.current = null;
        setLoading(false);
        inputRef.current?.focus();
      },
    });
  };

  const handleRegenerate = async () => {
    if (loading) return;
    setLoading(true);

    // Remove the last assistant message optimistically
    let removed = null;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.senderType === 'assistant') { removed = last; return prev.slice(0, -1); }
      return prev;
    });

    const streamTmpId = `tmp-regen-${Date.now()}`;
    streamingRef.current = streamTmpId;
    setMessages((prev) => [
      ...prev,
      { id: streamTmpId, senderType: 'assistant', message: '', streaming: true, createdAt: new Date().toISOString() },
    ]);

    try {
      const result = await assistantService.regenerateResponse(session.id);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamTmpId
            ? { ...m, id: result.assistantMessage.id, message: result.response, streaming: false }
            : m
        )
      );
    } catch (err) {
      // Restore removed message on error
      setMessages((prev) =>
        prev.map((m) =>
          m.id === streamTmpId
            ? { ...m, message: err?.response?.data?.error || 'Regeneration failed. Please try again.', streaming: false, metadata: { blocked: true } }
            : m
        )
      );
    } finally {
      streamingRef.current = null;
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const isEmpty = messages.length === 0 && !loadingMsgs;

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
        {loadingMsgs && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-tetri-muted" />
          </div>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
              <Bot className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-tetri-text">Tetri Copilot</p>
              <p className="text-xs text-tetri-muted mt-1 max-w-xs">
                Ask me anything about your workspace — invoices, expenses, compliance, customers, and more.
              </p>
            </div>
            {quickPrompts.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-sm">
                {quickPrompts.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => sendMessage(p.prompt)}
                    className="text-xs px-3 py-1.5 rounded-full border border-tetri-border text-tetri-muted hover:border-tetri-blue hover:text-tetri-blue transition-colors bg-tetri-surface"
                  >
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!loadingMsgs && messages.map((msg, idx) => {
          const isLast = idx === messages.length - 1 && msg.senderType === 'assistant';
          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isLast={isLast}
              onRegenerate={isLast && !msg.streaming ? handleRegenerate : null}
            />
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-tetri-border px-4 py-3 bg-tetri-surface flex-shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Tetri Copilot…"
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-tetri-border bg-tetri-bg px-3 py-2 text-sm text-tetri-text placeholder:text-tetri-muted focus:outline-none focus:ring-2 focus:ring-tetri-blue/20 focus:border-tetri-blue transition-colors disabled:opacity-50 max-h-32 overflow-y-auto"
            style={{ minHeight: '38px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-tetri-blue text-white flex items-center justify-center hover:bg-tetri-blue-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send    className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-tetri-muted mt-1.5 text-center">
          Read-only · Responses may not be 100% accurate
        </p>
      </div>
    </div>
  );
}

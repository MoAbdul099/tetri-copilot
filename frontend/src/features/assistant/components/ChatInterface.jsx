import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Bot, Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';
import assistantService from '../services/assistantService';

export default function ChatInterface({ session, onSessionUpdate, quickPrompts = [], initialPrompt }) {
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const sentInitial = useRef(false);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Auto-send the initial prompt once messages have loaded and the prompt hasn't been sent yet
  useEffect(() => {
    if (initialPrompt && !loadingMsgs && !sentInitial.current) {
      sentInitial.current = true;
      sendMessage(initialPrompt);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, loadingMsgs]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput('');
    const optimisticUser = {
      id:         `tmp-${Date.now()}`,
      senderType: 'user',
      message:    msg,
      createdAt:  new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setLoading(true);

    try {
      const result = await assistantService.chat(session.id, msg);
      // Replace optimistic with confirmed + add assistant message
      const assistantMsg = {
        id:         result.assistantMessage?.id || `tmp-a-${Date.now()}`,
        senderType: 'assistant',
        message:    result.response,
        metadata:   result.assistantMessage?.metadata,
        createdAt:  result.assistantMessage?.createdAt || new Date().toISOString(),
      };
      setMessages((prev) => [...prev.slice(0, -1), { ...optimisticUser, id: `user-${Date.now()}` }, assistantMsg]);
      if (onSessionUpdate) onSessionUpdate();
    } catch (err) {
      const errMsg = {
        id:         `err-${Date.now()}`,
        senderType: 'assistant',
        message:    err?.response?.data?.error || 'Something went wrong. Please try again.',
        metadata:   { blocked: true },
        createdAt:  new Date().toISOString(),
      };
      setMessages((prev) => [...prev.slice(0, -1), errMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = messages.length === 0 && !loadingMsgs;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
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

        {!loadingMsgs && messages.map((msg, idx) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isLast={idx === messages.length - 1 && msg.senderType === 'assistant'}
          />
        ))}

        {loading && (
          <div className="flex gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <div className="bg-tetri-surface border border-tetri-border px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-tetri-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-tetri-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-tetri-muted animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-tetri-border px-4 py-3 bg-tetri-surface">
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
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>
        <p className="text-xs text-tetri-muted mt-1.5 text-center">Read-only · Responses may not be 100% accurate</p>
      </div>
    </div>
  );
}

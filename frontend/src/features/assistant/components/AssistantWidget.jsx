import { useState, useEffect } from 'react';
import { Bot, X, Maximize2, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatInterface from './ChatInterface';
import assistantService from '../services/assistantService';

export default function AssistantWidget() {
  const [open,       setOpen]       = useState(false);
  const [session,    setSession]    = useState(null);
  const [quickPrompts, setQuickPrompts] = useState([]);
  const [creating,   setCreating]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    assistantService.getQuickPrompts().then(setQuickPrompts).catch(() => {});
  }, []);

  const openWidget = async () => {
    setOpen(true);
    if (!session) await startNewSession();
  };

  const startNewSession = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const s = await assistantService.createSession({ title: `Chat — ${new Date().toLocaleDateString()}` });
      setSession(s);
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  };

  const openFullPage = () => {
    setOpen(false);
    navigate('/assistant');
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={openWidget}
          className="fixed bottom-6 right-6 z-50 w-13 h-13 rounded-2xl bg-tetri-blue text-white shadow-lg hover:bg-tetri-blue-hover transition-all flex items-center justify-center group"
          style={{ width: '52px', height: '52px' }}
          title="Open Tetri Copilot"
        >
          <Bot className="w-5 h-5" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[580px] flex flex-col bg-tetri-surface border border-tetri-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-tetri-border bg-tetri-surface flex-shrink-0">
            <div className="w-7 h-7 rounded-xl bg-violet-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-tetri-text">Tetri Copilot</p>
              <p className="text-xs text-tetri-muted">AI workspace assistant</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={startNewSession}
                title="New conversation"
                className="p-1.5 rounded-lg text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={openFullPage}
                title="Open full page"
                className="p-1.5 rounded-lg text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
            {session
              ? <ChatInterface session={session} quickPrompts={quickPrompts} />
              : (
                <div className="flex items-center justify-center h-full py-12">
                  <div className="text-center">
                    <Bot className="w-8 h-8 text-tetri-muted mx-auto mb-2" />
                    <p className="text-sm text-tetri-muted">Starting session…</p>
                  </div>
                </div>
              )
            }
          </div>
        </div>
      )}
    </>
  );
}

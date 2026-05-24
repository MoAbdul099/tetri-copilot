import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, CheckCheck, ExternalLink } from 'lucide-react';
import { getUnreadCount, listNotifications, markRead, markAllRead } from '../services/notificationService';

const TYPE_COLORS = {
  reminder:   'bg-blue-50 text-blue-600',
  escalation: 'bg-red-50 text-red-600',
  system:     'bg-slate-50 text-slate-600',
};

export default function NotificationBell() {
  const [count, setCount]       = useState(0);
  const [open, setOpen]         = useState(false);
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const panelRef                = useRef(null);
  const navigate                = useNavigate();

  const loadCount = async () => {
    try { const d = await getUnreadCount(); setCount(d.count || 0); } catch {}
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const d = await listNotifications({ limit: 10 });
      setItems(d.items || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadCount();
    const interval = setInterval(loadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) loadItems();
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handle = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const handleMarkRead = async (id) => {
    await markRead(id);
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, status: 'read', readAt: new Date() } : n));
    setCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAll = async () => {
    await markAllRead();
    setItems((prev) => prev.map((n) => ({ ...n, status: 'read', readAt: new Date() })));
    setCount(0);
  };

  const timeSince = (date) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg hover:text-tetri-text transition-colors"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-tetri-surface border border-tetri-border rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-tetri-border">
            <span className="text-sm font-semibold text-tetri-text">Notifications</span>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <button onClick={handleMarkAll} className="text-xs text-tetri-blue hover:underline flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-tetri-neutral hover:text-tetri-text">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <p className="text-xs text-tetri-neutral text-center py-8">Loading…</p>
            ) : items.length === 0 ? (
              <p className="text-xs text-tetri-neutral text-center py-8">No notifications</p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={`px-4 py-3 border-b border-tetri-border/50 hover:bg-tetri-bg transition-colors cursor-pointer ${!item.readAt ? 'bg-blue-50/30' : ''}`}
                  onClick={() => handleMarkRead(item.id)}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded uppercase ${TYPE_COLORS[item.type] || TYPE_COLORS.system}`}>
                      {item.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${!item.readAt ? 'text-tetri-text' : 'text-tetri-muted'}`}>{item.title}</p>
                      <p className="text-[11px] text-tetri-neutral mt-0.5">{timeSince(item.createdAt)}</p>
                    </div>
                    {!item.readAt && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-tetri-border">
            <button
              onClick={() => { setOpen(false); navigate('/notifications'); }}
              className="w-full text-xs text-tetri-blue hover:underline flex items-center justify-center gap-1"
            >
              View all notifications <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

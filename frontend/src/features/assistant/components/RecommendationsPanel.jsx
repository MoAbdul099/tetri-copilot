import { useState, useEffect } from 'react';
import { Lightbulb, X, RefreshCw, ChevronRight, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import assistantService from '../services/assistantService';

const PRIORITY_META = {
  high:   { icon: AlertCircle,   color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200'   },
  medium: { icon: AlertTriangle, color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  low:    { icon: Info,          color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200'  },
};

export default function RecommendationsPanel({ onAskCopilot }) {
  const [recs,        setRecs]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const data = await assistantService.getRecommendations();
      setRecs(data || []);
    } catch {
      setRecs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const dismiss = async (id) => {
    try {
      await assistantService.dismissRecommendation(id);
      setRecs((prev) => prev.filter((r) => r.id !== id));
    } catch {}
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await assistantService.refreshRecommendations();
      await load();
    } catch {} finally {
      setRefreshing(false);
    }
  };

  if (!loading && recs.length === 0) return null;

  return (
    <div className="border-t border-tetri-border">
      {/* Header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-tetri-bg transition-colors"
      >
        <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <span className="text-xs font-medium text-tetri-text flex-1">Recommendations</span>
        {recs.length > 0 && (
          <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5 font-medium">{recs.length}</span>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); refresh(); }}
          disabled={refreshing}
          className="p-0.5 text-tetri-muted hover:text-tetri-text transition-colors"
          title="Refresh recommendations"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </button>

      {/* Rec list */}
      {!collapsed && (
        <div className="px-2 pb-2 space-y-1.5">
          {loading && (
            <div className="flex justify-center py-3">
              <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-amber-500 rounded-full animate-spin" />
            </div>
          )}
          {recs.map((rec) => {
            const meta = PRIORITY_META[rec.priority] || PRIORITY_META.medium;
            const Icon = meta.icon;
            return (
              <div
                key={rec.id}
                className={`rounded-xl border ${meta.border} ${meta.bg} p-2.5 relative group/rec`}
              >
                <button
                  onClick={() => dismiss(rec.id)}
                  className="absolute top-1.5 right-1.5 p-0.5 text-tetri-muted hover:text-tetri-text opacity-0 group-hover/rec:opacity-100 transition-all"
                  title="Dismiss"
                >
                  <X className="w-3 h-3" />
                </button>

                <div className="flex items-start gap-1.5 pr-4">
                  <Icon className={`w-3.5 h-3.5 ${meta.color} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${meta.color} leading-snug`}>{rec.title}</p>
                    <p className="text-xs text-tetri-muted mt-0.5 leading-snug">{rec.body}</p>

                    <div className="flex items-center gap-2 mt-1.5">
                      {rec.routePath && (
                        <button
                          onClick={() => navigate(rec.routePath)}
                          className={`inline-flex items-center gap-0.5 text-xs ${meta.color} hover:underline font-medium`}
                        >
                          {rec.actionHint || 'View'} <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                      {onAskCopilot && (
                        <button
                          onClick={() => onAskCopilot(rec.title)}
                          className="text-xs text-tetri-muted hover:text-tetri-blue transition-colors"
                        >
                          Ask Copilot
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

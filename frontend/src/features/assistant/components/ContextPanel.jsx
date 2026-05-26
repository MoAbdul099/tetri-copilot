import { useNavigate } from 'react-router-dom';
import { Database, FileText, Users, Receipt, CreditCard, Scale, BarChart2, LayoutDashboard, Paperclip, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const TYPE_META = {
  invoices:   { icon: Receipt,         label: 'Invoices',   color: 'text-blue-600   bg-blue-50   border-blue-200' },
  payments:   { icon: CreditCard,      label: 'Payments',   color: 'text-green-600  bg-green-50  border-green-200' },
  expenses:   { icon: Database,        label: 'Expenses',   color: 'text-orange-600 bg-orange-50 border-orange-200' },
  customers:  { icon: Users,           label: 'Customers',  color: 'text-violet-600 bg-violet-50 border-violet-200' },
  compliance: { icon: Scale,           label: 'Compliance', color: 'text-red-600    bg-red-50    border-red-200' },
  reports:    { icon: BarChart2,       label: 'Reports',    color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  dashboard:  { icon: LayoutDashboard, label: 'Dashboard',  color: 'text-sky-600    bg-sky-50    border-sky-200' },
  file:       { icon: Paperclip,       label: 'File',       color: 'text-amber-600  bg-amber-50  border-amber-200' },
};

const CONFIDENCE_META = {
  high:   { label: 'High confidence',   color: 'text-green-600' },
  medium: { label: 'Medium confidence', color: 'text-amber-600' },
  low:    { label: 'Low confidence',    color: 'text-red-500'   },
};

export default function ContextPanel({ sources = [], confidence }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  const confMeta = CONFIDENCE_META[confidence] || CONFIDENCE_META.medium;
  const visible  = expanded ? sources : sources.slice(0, 3);
  const hasMore  = sources.length > 3;

  return (
    <div className="mt-2 px-1">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Database className="w-3 h-3 text-tetri-muted" />
        <span className="text-xs text-tetri-muted">Sources</span>
        {confidence && (
          <span className={`text-xs ${confMeta.color} ml-auto`}>{confMeta.label}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {visible.map((src, i) => {
          const meta = TYPE_META[src.type] || TYPE_META.file;
          const Icon = meta.icon;
          return (
            <button
              key={i}
              onClick={() => src.routePath && navigate(src.routePath)}
              disabled={!src.routePath}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium transition-colors ${meta.color} ${src.routePath ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}
              title={src.routePath ? `Go to ${meta.label}` : src.name}
            >
              <Icon className="w-3 h-3 flex-shrink-0" />
              <span className="max-w-[120px] truncate">{src.name}</span>
              {src.count > 0 && <span className="opacity-60">({src.count})</span>}
              {src.routePath && <ExternalLink className="w-2.5 h-2.5 opacity-50" />}
            </button>
          );
        })}

        {hasMore && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-tetri-border text-xs text-tetri-muted hover:bg-tetri-bg transition-colors"
          >
            {expanded
              ? <><ChevronUp   className="w-3 h-3" /> Less</>
              : <><ChevronDown className="w-3 h-3" /> +{sources.length - 3} more</>}
          </button>
        )}
      </div>
    </div>
  );
}

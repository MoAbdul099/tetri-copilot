import { useState } from 'react';
import { X, Bookmark } from 'lucide-react';
import reportsService from '../services/reportsService.js';

export default function SaveReportModal({ reportCode, filters, onClose, onSaved }) {
  const [name,       setName]       = useState('');
  const [visibility, setVisibility] = useState('private');
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Please enter a name.'); return; }
    setSaving(true);
    try {
      const saved = await reportsService.createSaved({ reportCode, savedName: name.trim(), filtersJson: filters, visibility });
      onSaved?.(saved);
      onClose();
    } catch (e) {
      setError(e.message || 'Failed to save report.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-card border border-tetri-border shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-tetri-blue" />
            <p className="text-sm font-semibold text-tetri-text">Save Report</p>
          </div>
          <button onClick={onClose} className="text-tetri-muted hover:text-tetri-text">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-tetri-muted mb-1">Report name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monthly Outstanding AR"
              className="w-full border border-tetri-border rounded-lg px-3 py-2 text-sm text-tetri-text focus:outline-none focus:ring-1 focus:ring-tetri-blue"
            />
          </div>

          <div>
            <label className="block text-xs text-tetri-muted mb-1">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full border border-tetri-border rounded-lg px-3 py-2 text-sm text-tetri-text focus:outline-none focus:ring-1 focus:ring-tetri-blue"
            >
              <option value="private">Private (only me)</option>
              <option value="workspace">Shared with workspace</option>
            </select>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 text-sm py-2 rounded-lg border border-tetri-border text-tetri-muted hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 text-sm py-2 rounded-lg bg-tetri-blue text-white font-medium hover:bg-tetri-blue/90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

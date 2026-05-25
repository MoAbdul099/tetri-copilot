import { useState } from 'react';
import { X, Clock } from 'lucide-react';
import reportsService from '../services/reportsService.js';

export default function ScheduleReportModal({ reportCode, filters, onClose, onCreated }) {
  const [form, setForm] = useState({
    scheduleName: '',
    frequency:    'weekly',
    deliveryTime: '08:00',
    exportFormat: 'csv',
    recipientsJson: [],
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleCreate = async () => {
    if (!form.scheduleName.trim()) { setError('Please enter a schedule name.'); return; }
    setSaving(true);
    try {
      const sched = await reportsService.createSchedule({
        reportCode,
        scheduleName: form.scheduleName.trim(),
        frequency:    form.frequency,
        deliveryTime: form.deliveryTime,
        exportFormat: form.exportFormat,
        filtersJson:  filters || {},
        recipientsJson: form.recipientsJson,
      });
      onCreated?.(sched);
      onClose();
    } catch (e) {
      setError(e.message || 'Failed to create schedule.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-card border border-tetri-border shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-tetri-blue" />
            <p className="text-sm font-semibold text-tetri-text">Schedule Report</p>
          </div>
          <button onClick={onClose} className="text-tetri-muted hover:text-tetri-text">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-tetri-muted mb-1">Schedule name</label>
            <input
              autoFocus
              type="text"
              value={form.scheduleName}
              onChange={(e) => set('scheduleName', e.target.value)}
              placeholder="e.g. Weekly Aging Report"
              className="w-full border border-tetri-border rounded-lg px-3 py-2 text-sm text-tetri-text focus:outline-none focus:ring-1 focus:ring-tetri-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-tetri-muted mb-1">Frequency</label>
              <select value={form.frequency} onChange={(e) => set('frequency', e.target.value)}
                className="w-full border border-tetri-border rounded-lg px-3 py-2 text-sm text-tetri-text focus:outline-none focus:ring-1 focus:ring-tetri-blue">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-tetri-muted mb-1">Time</label>
              <input type="time" value={form.deliveryTime} onChange={(e) => set('deliveryTime', e.target.value)}
                className="w-full border border-tetri-border rounded-lg px-3 py-2 text-sm text-tetri-text focus:outline-none focus:ring-1 focus:ring-tetri-blue" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-tetri-muted mb-1">Export format</label>
            <select value={form.exportFormat} onChange={(e) => set('exportFormat', e.target.value)}
              className="w-full border border-tetri-border rounded-lg px-3 py-2 text-sm text-tetri-text focus:outline-none focus:ring-1 focus:ring-tetri-blue">
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 text-sm py-2 rounded-lg border border-tetri-border text-tetri-muted hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="flex-1 text-sm py-2 rounded-lg bg-tetri-blue text-white font-medium hover:bg-tetri-blue/90 disabled:opacity-50"
          >
            {saving ? 'Scheduling…' : 'Create Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
}

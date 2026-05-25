import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Bookmark, Clock, AlertCircle, Loader2 } from 'lucide-react';
import ReportFiltersPanel   from '../components/ReportFiltersPanel.jsx';
import ReportResultsTable   from '../components/ReportResultsTable.jsx';
import SaveReportModal      from '../components/SaveReportModal.jsx';
import ScheduleReportModal  from '../components/ScheduleReportModal.jsx';
import reportsService       from '../services/reportsService.js';

export default function ReportViewerPage() {
  const { reportCode }          = useParams();
  const [searchParams]          = useSearchParams();
  const savedId                 = searchParams.get('savedId');

  const [definition, setDefinition] = useState(null);
  const [defLoading, setDefLoading] = useState(true);

  const [result,    setResult]   = useState(null);
  const [running,   setRunning]  = useState(false);
  const [runError,  setRunError] = useState('');
  const [page,      setPage]     = useState(1);
  const [lastFilters, setLastFilters] = useState({});

  const [exportLoading, setExportLoading]   = useState(false);
  const [exportJobId,   setExportJobId]     = useState(null);
  const [exportStatus,  setExportStatus]    = useState('');
  const [exportDownloadUrl, setExportDownloadUrl] = useState('');

  const [showSave,     setShowSave]     = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    reportsService.getDefinition(reportCode)
      .then((d) => { setDefinition(d.data || d); })
      .catch(() => setDefinition(null))
      .finally(() => setDefLoading(false));
  }, [reportCode]);

  const runReport = async (filters, pg = 1) => {
    setRunning(true);
    setRunError('');
    setLastFilters(filters);
    setPage(pg);
    try {
      const res = await reportsService.runReport(reportCode, filters, { page: pg, limit: 50 });
      setResult(res.data || res);
    } catch (e) {
      setRunError(e.message || 'Report could not be generated. Please adjust filters and try again.');
    } finally {
      setRunning(false);
    }
  };

  const handleExport = async (format) => {
    setExportLoading(true);
    setExportStatus('Creating export…');
    setExportDownloadUrl('');
    try {
      const res  = await reportsService.createExport(reportCode, format, lastFilters, savedId || null);
      const jobId = res.data?.id || res.id;
      setExportJobId(jobId);

      // Poll for completion
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        if (attempts > 30) { clearInterval(poll); setExportStatus('Export timed out.'); setExportLoading(false); return; }
        try {
          const job = await reportsService.getExportJob(jobId);
          const status = job.data?.status || job.status;
          if (status === 'completed') {
            clearInterval(poll);
            setExportStatus('Export ready!');
            setExportDownloadUrl(reportsService.downloadUrl(jobId));
            setExportLoading(false);
          } else if (status === 'failed') {
            clearInterval(poll);
            setExportStatus('Export failed.');
            setExportLoading(false);
          }
        } catch (_) {}
      }, 1500);
    } catch (e) {
      setExportStatus('Export failed: ' + (e.message || 'Unknown error'));
      setExportLoading(false);
    }
  };

  if (defLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-tetri-blue" />
      </div>
    );
  }

  if (!definition) {
    return (
      <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto">
        <p className="text-sm text-tetri-muted">Report not found.</p>
        <Link to="/reports" className="text-sm text-tetri-blue hover:underline mt-2 inline-block">← Back to Reports</Link>
      </div>
    );
  }

  const def = definition.data || definition;

  return (
    <div className="px-4 sm:px-8 py-6 max-w-7xl mx-auto space-y-5">
      {/* Back + header */}
      <div>
        <Link to="/reports" className="flex items-center gap-1 text-xs text-tetri-muted hover:text-tetri-blue mb-3">
          <ArrowLeft className="w-3 h-3" /> Reports
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-tetri-text">{def.reportName}</h1>
            <p className="text-sm text-tetri-muted mt-0.5">{def.description}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Export dropdown */}
            <div className="relative group">
              <button
                disabled={exportLoading || !result}
                className="flex items-center gap-1.5 text-sm border border-tetri-border px-3 py-1.5 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                {exportLoading ? 'Exporting…' : 'Export'}
              </button>
              {!exportLoading && result && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-tetri-border rounded-xl shadow-lg z-20 py-1 min-w-[100px] hidden group-hover:block">
                  {(def.supportedExports || []).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => handleExport(fmt)}
                      className="block w-full text-left px-4 py-2 text-sm text-tetri-text hover:bg-slate-50 uppercase"
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowSave(true)}
              disabled={!result}
              className="flex items-center gap-1.5 text-sm border border-tetri-border px-3 py-1.5 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <Bookmark className="w-4 h-4" /> Save
            </button>

            <button
              onClick={() => setShowSchedule(true)}
              className="flex items-center gap-1.5 text-sm bg-tetri-blue text-white px-3 py-1.5 rounded-lg hover:bg-tetri-blue/90 transition-colors"
            >
              <Clock className="w-4 h-4" /> Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Export status bar */}
      {exportStatus && (
        <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm ${exportStatus.includes('ready') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : exportStatus.includes('failed') || exportStatus.includes('timed out') ? 'bg-red-50 border-red-200 text-red-700' : 'bg-[#eff4ff] border-tetri-blue/20 text-tetri-blue'}`}>
          <span>{exportStatus}</span>
          {exportDownloadUrl && (
            <a
              href={exportDownloadUrl}
              className="font-medium underline ml-2"
            >
              Download
            </a>
          )}
        </div>
      )}

      {/* Layout: filters left, results right */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-56 xl:w-64 flex-shrink-0">
          <ReportFiltersPanel
            supportedFilters={def.supportedFilters || []}
            onRun={runReport}
            loading={running}
          />
        </div>

        <div className="flex-1 min-w-0">
          {running && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-tetri-blue" />
              <span className="ml-2 text-sm text-tetri-muted">Running report…</span>
            </div>
          )}

          {!running && runError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{runError}</p>
            </div>
          )}

          {!running && !runError && !result && (
            <div className="bg-white rounded-card border border-tetri-border p-12 text-center">
              <p className="text-sm text-tetri-muted">Set your filters and click <strong>Run Report</strong> to view results.</p>
            </div>
          )}

          {!running && result && (
            <ReportResultsTable
              columns={result.columns}
              rows={result.rows}
              totals={result.totals}
              rowCount={result.rowCount}
              page={page}
              limit={50}
              onPage={(pg) => runReport(lastFilters, pg)}
            />
          )}
        </div>
      </div>

      {showSave && (
        <SaveReportModal
          reportCode={reportCode}
          filters={lastFilters}
          onClose={() => setShowSave(false)}
          onSaved={() => {}}
        />
      )}

      {showSchedule && (
        <ScheduleReportModal
          reportCode={reportCode}
          filters={lastFilters}
          onClose={() => setShowSchedule(false)}
          onCreated={() => {}}
        />
      )}
    </div>
  );
}

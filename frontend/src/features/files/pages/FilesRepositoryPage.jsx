import { useState, useEffect, useCallback } from 'react';
import {
  FolderOpen, Search, Upload, Eye, Download, Pencil, Trash2, RotateCcw,
  ChevronLeft, ChevronRight, Loader2, X,
} from 'lucide-react';
import { listFiles, deleteFile, restoreFile, renameFile } from '../services/filesService.js';
import { API_BASE_URL } from '../../../lib/api';
import FileUploadDropzone from '../components/FileUploadDropzone.jsx';
import FilePreviewModal from '../components/FilePreviewModal.jsx';

function humanSize(bytes) {
  if (!bytes) return '—';
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function humanDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString();
}

function fileIcon(mimeType) {
  if (!mimeType) return '📄';
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType === 'application/pdf') return '📋';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('word')) return '📝';
  if (mimeType === 'text/csv') return '📊';
  return '📄';
}

function RenameModal({ file, onSave, onClose }) {
  const [name, setName] = useState(file.fileName || file.originalFilename || '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  async function handleSave() {
    if (!name.trim()) { setErr('Name is required'); return; }
    setSaving(true);
    try {
      await onSave(file.id, name.trim());
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-tetri-surface border border-tetri-border rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-tetri-text">Rename File</h3>
          <button onClick={onClose} className="text-tetri-muted hover:text-tetri-text"><X className="w-4 h-4" /></button>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="w-full border border-tetri-border rounded-input px-3 py-2 text-sm text-tetri-text bg-tetri-bg focus:outline-none focus:ring-1 focus:ring-tetri-blue"
          placeholder="Enter file name"
          autoFocus
        />
        {err && <p className="text-xs text-tetri-error mt-1">{err}</p>}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 bg-tetri-blue text-white text-sm font-medium rounded-btn hover:bg-tetri-blue-hover transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-tetri-border text-tetri-muted text-sm rounded-btn hover:bg-tetri-bg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE = 20;

export default function FilesRepositoryPage() {
  const [files, setFiles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listFiles({
        search: search || undefined,
        isDeleted: showDeleted ? 'true' : 'false',
        page,
        limit: PAGE_SIZE,
      });
      setFiles(result.files || []);
      setTotal(result.total || 0);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to load files';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, showDeleted, page]);

  useEffect(() => { load(); }, [load]);

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleDelete(file) {
    setActionLoading(file.id + '_delete');
    try {
      await deleteFile(file.id);
      showToast('File deleted');
      load();
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRestore(file) {
    setActionLoading(file.id + '_restore');
    try {
      await restoreFile(file.id);
      showToast('File restored');
      load();
    } catch (err) {
      showToast(err.response?.data?.error || err.message, 'error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRename(id, fileName) {
    await renameFile(id, fileName);
    showToast('File renamed');
    load();
  }

  function handleDownload(file) {
    const baseUrl = API_BASE_URL;
    const a = document.createElement('a');
    a.href = `${baseUrl}/api/v1/files/${file.id}/download`;
    a.download = file.fileName || 'file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleSearch(e) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tetri-text">File Repository</h1>
          <p className="text-sm text-tetri-muted mt-1">
            {total} file{total !== 1 ? 's' : ''} in workspace
          </p>
        </div>
        <button
          onClick={() => setShowUpload((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-tetri-blue text-white text-sm font-medium rounded-btn hover:bg-tetri-blue-hover transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div className="bg-tetri-surface border border-tetri-border rounded-xl p-5">
          <FileUploadDropzone
            onUploaded={() => {
              setShowUpload(false);
              load();
              showToast('Files uploaded successfully');
            }}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-neutral" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search files…"
              className="w-full pl-9 pr-3 py-2 border border-tetri-border rounded-input text-sm text-tetri-text bg-tetri-bg focus:outline-none focus:ring-1 focus:ring-tetri-blue"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-tetri-blue text-white text-sm font-medium rounded-btn hover:bg-tetri-blue-hover transition-colors"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
              className="px-3 py-2 border border-tetri-border text-tetri-muted text-sm rounded-btn hover:bg-tetri-bg transition-colors"
            >
              Clear
            </button>
          )}
        </form>
        <label className="flex items-center gap-2 text-sm text-tetri-muted cursor-pointer select-none px-3 py-2 border border-tetri-border rounded-input hover:bg-tetri-bg">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => { setShowDeleted(e.target.checked); setPage(1); }}
            className="rounded border-tetri-border text-tetri-blue"
          />
          Show deleted
        </label>
      </div>

      {/* Table */}
      <div className="bg-tetri-surface border border-tetri-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-tetri-blue animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="w-12 h-12 text-tetri-border mb-3" />
            <p className="text-tetri-muted font-medium text-sm">No files found</p>
            <p className="text-tetri-neutral text-xs mt-1">
              {search ? 'Try a different search term.' : 'Upload your first file to get started.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-tetri-border bg-tetri-bg">
                <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">File</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide hidden lg:table-cell">Size</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide hidden lg:table-cell">Uploaded By</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tetri-border">
              {files.map((file) => (
                <tr
                  key={file.id}
                  className={`hover:bg-tetri-bg transition-colors ${file.isDeleted ? 'opacity-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{fileIcon(file.mimeType)}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-tetri-text truncate max-w-[200px]">
                          {file.fileName || file.originalFilename}
                        </p>
                        {file.isDeleted && (
                          <span className="text-xs text-tetri-error">Deleted {humanDate(file.deletedAt)}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-tetri-neutral hidden md:table-cell">
                    {file.extension?.toUpperCase() || '—'}
                  </td>
                  <td className="px-4 py-3 text-tetri-neutral hidden lg:table-cell">
                    {humanSize(file.fileSizeBytes)}
                  </td>
                  <td className="px-4 py-3 text-tetri-neutral hidden lg:table-cell">
                    {file.uploadedByUser
                      ? file.uploadedByUser.fullName || file.uploadedByUser.email
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-tetri-neutral hidden md:table-cell">
                    {humanDate(file.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!file.isDeleted && (
                        <>
                          <button
                            onClick={() => setPreviewFile(file)}
                            className="p-1.5 rounded-lg text-tetri-muted hover:text-tetri-blue hover:bg-[#eff4ff] transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(file)}
                            className="p-1.5 rounded-lg text-tetri-muted hover:text-tetri-blue hover:bg-[#eff4ff] transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRenameTarget(file)}
                            className="p-1.5 rounded-lg text-tetri-muted hover:text-tetri-text hover:bg-tetri-bg transition-colors"
                            title="Rename"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(file)}
                            disabled={actionLoading === file.id + '_delete'}
                            className="p-1.5 rounded-lg text-tetri-muted hover:text-tetri-error hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {actionLoading === file.id + '_delete'
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : <Trash2 className="w-4 h-4" />}
                          </button>
                        </>
                      )}
                      {file.isDeleted && (
                        <button
                          onClick={() => handleRestore(file)}
                          disabled={actionLoading === file.id + '_restore'}
                          className="p-1.5 rounded-lg text-tetri-muted hover:text-tetri-success hover:bg-green-50 transition-colors disabled:opacity-50"
                          title="Restore"
                        >
                          {actionLoading === file.id + '_restore'
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <RotateCcw className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-tetri-border">
            <span className="text-xs text-tetri-neutral">
              Page {page} of {totalPages} · {total} files
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-tetri-muted hover:bg-tetri-bg transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-tetri-muted hover:bg-tetri-bg transition-colors disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
      {renameTarget && (
        <RenameModal file={renameTarget} onSave={handleRename} onClose={() => setRenameTarget(null)} />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50 transition-all ${
          toast.type === 'error' ? 'bg-tetri-error text-white' : 'bg-tetri-text text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

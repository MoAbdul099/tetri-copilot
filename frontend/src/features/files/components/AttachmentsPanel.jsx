import { useState, useEffect, useCallback } from 'react';
import { Paperclip, Download, Eye, Trash2, Plus, X, Loader2 } from 'lucide-react';
import { getEntityFiles, unlinkFile, uploadFiles, linkFile } from '../services/filesService.js';
import FilePreviewModal from './FilePreviewModal.jsx';
import FileUploadDropzone from './FileUploadDropzone.jsx';
import api from '../../../lib/api.js';

function humanSize(bytes) {
  if (!bytes) return '—';
  const n = Number(bytes);
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
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

export default function AttachmentsPanel({ entityType, entityId }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [unlinking, setUnlinking] = useState(null);

  const load = useCallback(async () => {
    if (!entityType || !entityId) return;
    try {
      setLoading(true);
      const data = await getEntityFiles(entityType, entityId);
      setLinks(data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUnlink(linkId) {
    setUnlinking(linkId);
    try {
      await unlinkFile(linkId);
      setLinks((prev) => prev.filter((l) => l.id !== linkId));
    } finally {
      setUnlinking(null);
    }
  }

  async function handleUploaded(uploaded) {
    for (const file of uploaded) {
      try {
        await linkFile(file.id, entityType, entityId);
      } catch { /* link may already exist */ }
    }
    setShowUpload(false);
    await load();
  }

  function handleDownload(file) {
    const baseUrl = api.defaults.baseURL || '';
    const a = document.createElement('a');
    a.href = `${baseUrl}/api/v1/files/${file.id}/download`;
    a.download = file.fileName || file.originalFilename || 'file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="bg-tetri-surface border border-tetri-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-tetri-muted" />
          <span className="text-sm font-semibold text-tetri-text">Attachments</span>
          {links.length > 0 && (
            <span className="text-xs bg-tetri-bg border border-tetri-border rounded-full px-2 py-0.5 text-tetri-muted">
              {links.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowUpload((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-tetri-blue hover:text-tetri-blue-hover font-medium transition-colors"
        >
          {showUpload ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showUpload ? 'Cancel' : 'Add'}
        </button>
      </div>

      {showUpload && (
        <div className="mb-3">
          <FileUploadDropzone onUploaded={handleUploaded} entityType={entityType} entityId={entityId} />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 text-tetri-blue animate-spin" />
        </div>
      ) : links.length === 0 ? (
        <p className="text-xs text-tetri-neutral text-center py-4">No attachments yet</p>
      ) : (
        <div className="space-y-1.5">
          {links.map((link) => {
            const file = link.file;
            return (
              <div
                key={link.id}
                className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-tetri-bg group transition-colors"
              >
                <span className="text-base flex-shrink-0">{fileIcon(file?.mimeType)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-tetri-text truncate">
                    {file?.fileName || file?.originalFilename || '—'}
                  </p>
                  <p className="text-xs text-tetri-neutral">{humanSize(file?.fileSize)}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setPreviewFile(file)}
                    className="p-1.5 rounded-lg text-tetri-muted hover:text-tetri-blue hover:bg-[#eff4ff] transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-1.5 rounded-lg text-tetri-muted hover:text-tetri-blue hover:bg-[#eff4ff] transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleUnlink(link.id)}
                    disabled={unlinking === link.id}
                    className="p-1.5 rounded-lg text-tetri-muted hover:text-tetri-error hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Remove"
                  >
                    {unlinking === link.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {previewFile && (
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
}

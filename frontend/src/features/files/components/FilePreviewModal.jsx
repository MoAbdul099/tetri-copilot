import { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import api from '../../../lib/api.js';

function humanSize(bytes) {
  if (!bytes) return '—';
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilePreviewModal({ file, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!file) return null;

  const baseUrl = api.defaults.baseURL || '';
  const isImage = file.mimeType?.startsWith('image/');
  const isPDF = file.mimeType === 'application/pdf';
  const canPreview = isImage || isPDF;

  const serveUrl = `${baseUrl}/api/v1/files/${file.id}/serve`;
  const downloadUrl = `${baseUrl}/api/v1/files/${file.id}/download`;

  function handleDownload() {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.fileName || file.originalFilename || 'file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-tetri-surface border border-tetri-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-tetri-border flex-shrink-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-tetri-text truncate">{file.fileName || file.originalFilename}</p>
            <p className="text-xs text-tetri-neutral mt-0.5">
              {humanSize(file.fileSize)} · {file.mimeType}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {isImage && (
              <>
                <button
                  onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
                  className="p-2 rounded-lg text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-tetri-neutral w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                  className="p-2 rounded-lg text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-2 rounded-lg text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg text-tetri-muted hover:bg-tetri-bg hover:text-tetri-blue transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-tetri-muted hover:bg-tetri-bg hover:text-tetri-text transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-tetri-bg p-4">
          {isImage && (
            <img
              src={serveUrl}
              alt={file.fileName}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          )}
          {isPDF && (
            <iframe
              src={serveUrl}
              className="w-full h-full rounded-lg border border-tetri-border"
              style={{ minHeight: '500px' }}
              title={file.fileName}
            />
          )}
          {!canPreview && (
            <div className="text-center">
              <p className="text-tetri-muted text-sm mb-3">Preview not available for this file type.</p>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-tetri-blue text-white text-sm font-medium rounded-btn hover:bg-tetri-blue-hover transition-colors"
              >
                Download File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

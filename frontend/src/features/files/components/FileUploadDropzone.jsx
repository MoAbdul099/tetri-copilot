import { useRef, useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadFiles } from '../services/filesService.js';

const ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.webp,.zip';

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUploadDropzone({ onUploaded, entityType, entityId }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState([]);
  const [uploading, setUploading] = useState(false);

  function addFiles(files) {
    const items = Array.from(files).map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      status: 'queued',
      error: null,
    }));
    setQueue((q) => [...q, ...items]);
  }

  function removeFromQueue(id) {
    setQueue((q) => q.filter((item) => item.id !== id));
  }

  async function handleUpload() {
    const toUpload = queue.filter((q) => q.status === 'queued');
    if (!toUpload.length) return;
    setUploading(true);

    const formData = new FormData();
    toUpload.forEach((item) => formData.append('files', item.file));

    try {
      setQueue((q) =>
        q.map((item) =>
          item.status === 'queued' ? { ...item, status: 'uploading' } : item
        )
      );

      const result = await uploadFiles(formData);
      const { uploaded = [], errors = [] } = result;

      const errorMap = {};
      errors.forEach((e) => {
        errorMap[e.file] = e.message;
      });

      setQueue((q) =>
        q.map((item) => {
          if (item.status !== 'uploading') return item;
          const err = errorMap[item.file.name];
          if (err) return { ...item, status: 'error', error: err };
          return { ...item, status: 'done' };
        })
      );

      if (onUploaded) onUploaded(uploaded);
    } catch (err) {
      setQueue((q) =>
        q.map((item) =>
          item.status === 'uploading'
            ? { ...item, status: 'error', error: err.response?.data?.error || err.message }
            : item
        )
      );
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragging
            ? 'border-tetri-blue bg-[#eff4ff]'
            : 'border-tetri-border hover:border-tetri-blue/50 hover:bg-tetri-bg'
        }`}
      >
        <Upload className="w-8 h-8 text-tetri-muted mx-auto mb-2" />
        <p className="text-sm font-medium text-tetri-text">
          Drop files here or <span className="text-tetri-blue">browse</span>
        </p>
        <p className="text-xs text-tetri-neutral mt-1">
          PDF, DOC, XLS, CSV, JPG, PNG, ZIP — max 50 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Upload queue */}
      {queue.length > 0 && (
        <div className="space-y-1.5">
          {queue.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-tetri-surface border border-tetri-border rounded-lg px-3 py-2"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-tetri-text truncate">{item.file.name}</p>
                <p className="text-xs text-tetri-neutral">{humanSize(item.file.size)}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {item.status === 'queued' && (
                  <span className="text-xs text-tetri-neutral">Queued</span>
                )}
                {item.status === 'uploading' && (
                  <Loader2 className="w-4 h-4 text-tetri-blue animate-spin" />
                )}
                {item.status === 'done' && (
                  <CheckCircle className="w-4 h-4 text-tetri-success" />
                )}
                {item.status === 'error' && (
                  <span className="text-xs text-tetri-error truncate max-w-[120px]">{item.error}</span>
                )}
                {item.status === 'queued' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromQueue(item.id); }}
                    className="p-0.5 text-tetri-neutral hover:text-tetri-error transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleUpload}
              disabled={uploading || queue.every((q) => q.status !== 'queued')}
              className="flex-1 py-2 bg-tetri-blue text-white text-sm font-medium rounded-btn hover:bg-tetri-blue-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading…' : `Upload ${queue.filter((q) => q.status === 'queued').length} file(s)`}
            </button>
            <button
              onClick={() => setQueue([])}
              className="px-3 py-2 border border-tetri-border text-tetri-muted text-sm rounded-btn hover:bg-tetri-bg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

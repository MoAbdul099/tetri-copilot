import { useRef } from 'react';
import { Paperclip, X, FileText, Image, FileSpreadsheet, File } from 'lucide-react';

const MIME_ICONS = {
  'text/plain':       FileText,
  'text/csv':         FileSpreadsheet,
  'application/json': FileText,
  'text/markdown':    FileText,
  'application/pdf':  FileText,
  'image/png':        Image,
  'image/jpeg':       Image,
  'image/webp':       Image,
};

function FileIcon({ mimeType }) {
  const Icon = MIME_ICONS[mimeType] || File;
  return <Icon className="w-3.5 h-3.5 flex-shrink-0" />;
}

function formatSize(bytes) {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileAttachmentPanel({ files = [], onUpload, onRemove, uploading, disabled }) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onUpload) onUpload(file);
    e.target.value = '';
  };

  if (files.length === 0 && disabled) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 border-b border-tetri-border bg-tetri-bg/50">
      {/* File chips */}
      {files.map((f) => (
        <div
          key={f.id}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-tetri-surface border border-tetri-border text-xs text-tetri-text max-w-[180px]"
          title={`${f.fileName} — ${formatSize(f.fileSize)}`}
        >
          <FileIcon mimeType={f.mimeType} />
          <span className="truncate flex-1">{f.fileName}</span>
          <span className="text-tetri-muted shrink-0">{formatSize(f.fileSize)}</span>
          <button
            onClick={() => onRemove(f.id)}
            className="ml-0.5 text-tetri-muted hover:text-red-500 transition-colors"
            title="Remove file"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      {/* Attach button */}
      {!disabled && (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-tetri-border text-xs text-tetri-muted hover:border-tetri-blue hover:text-tetri-blue transition-colors disabled:opacity-40"
          title="Attach file"
        >
          <Paperclip className="w-3.5 h-3.5" />
          {uploading ? 'Uploading…' : 'Attach'}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept=".txt,.csv,.json,.md,.pdf,.docx,.xlsx,.xls,.png,.jpg,.jpeg,.webp"
      />
    </div>
  );
}

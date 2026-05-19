import { useState, useEffect, useRef } from 'react';
import { Upload, Loader2, Download, Trash2, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import {
  listAttachments, uploadAttachment, deleteAttachmentApi, getAttachmentDownloadUrl,
} from '../services/customersService.js';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType }) {
  if (mimeType?.startsWith('image/')) return <Image className="w-5 h-5 text-tetri-blue" />;
  if (mimeType === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
  return <File className="w-5 h-5 text-tetri-neutral" />;
}

export default function AttachmentsTab({ customerId }) {
  const { showToast, ToastContainer } = useToast();
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const load = async () => {
    try {
      const data = await listAttachments(customerId);
      setAttachments(data || []);
    } catch {
      showToast('error', 'Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [customerId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await uploadAttachment(customerId, fd);
      showToast('success', 'File uploaded');
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = (att) => {
    setConfirm({
      title: 'Delete attachment?',
      description: `"${att.fileName}" will be permanently deleted.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await deleteAttachmentApi(att.id);
          showToast('success', 'Attachment deleted');
          load();
        } catch (err) {
          showToast('error', err?.response?.data?.error || 'Failed to delete');
        } finally {
          setConfirmLoading(false);
          setConfirm(null);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-tetri-muted">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading attachments…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-tetri-text">Attachments ({attachments.length})</p>
        <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? 'Uploading…' : 'Upload file'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.xlsx,.csv,.txt,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {attachments.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-tetri-border rounded-xl">
          <p className="text-sm text-tetri-muted">No attachments yet</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-3.5 h-3.5" />
            Upload first file
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((att) => (
            <div key={att.id} className="flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-tetri-border">
              <div className="flex-shrink-0">
                <FileIcon mimeType={att.mimeType} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-tetri-text truncate">{att.fileName}</p>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-tetri-neutral">{formatBytes(att.fileSize)}</p>
                  <p className="text-xs text-tetri-neutral">
                    {new Date(att.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <a
                  href={getAttachmentDownloadUrl(att.id)}
                  download={att.fileName}
                  className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg hover:text-tetri-blue transition-colors inline-flex"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(att)}
                  className="p-1.5 rounded-lg text-tetri-neutral hover:bg-red-50 hover:text-tetri-error transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          open={!!confirm}
          onOpenChange={(v) => !v && setConfirm(null)}
          title={confirm.title}
          description={confirm.description}
          confirmLabel={confirm.confirmLabel}
          variant={confirm.variant}
          loading={confirmLoading}
          onConfirm={confirm.onConfirm}
        />
      )}
      {ToastContainer}
    </div>
  );
}

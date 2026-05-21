import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit2, Copy, Trash2, Paperclip, Upload, Download, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import {
  getExpense, deleteExpense, duplicateExpense,
  uploadExpenseAttachment, deleteExpenseAttachment, getAttachmentDownloadUrl,
} from '../services/expensesService.js';

const TYPE_LABELS = { company: 'Company', employee: 'Employee', petty_cash: 'Petty Cash' };

const STATUS_STYLES = {
  draft:     'bg-yellow-50 text-yellow-700 border-yellow-200',
  submitted: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
const fmtAmt  = (n, c = '') => `${c} ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`.trim();
const fmtSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

function LabelValue({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-tetri-neutral uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-tetri-text">{value || '—'}</p>
    </div>
  );
}

export default function ExpenseDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast, ToastContainer } = useToast();
  const fileRef = useRef(null);

  const [expense, setExpense] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteAttTarget, setDeleteAttTarget] = useState(null);
  const [deletingAtt, setDeletingAtt] = useState(false);

  const load = () => {
    setLoading(true);
    setLoadError(null);
    return getExpense(id)
      .then((data) => { setExpense(data); })
      .catch((err) => {
        const msg = err?.response?.data?.error || err?.message || 'Failed to load expense';
        setLoadError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteExpense(id);
      showToast('success', 'Expense deleted');
      navigate('/expenses');
    } catch {
      showToast('error', 'Failed to delete expense');
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const newExp = await duplicateExpense(id);
      showToast('success', 'Expense duplicated');
      navigate(`/expenses/${newExp.id}`);
    } catch {
      showToast('error', 'Failed to duplicate expense');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await uploadExpenseAttachment(id, fd);
      showToast('success', 'Attachment uploaded');
      await load();
    } catch {
      showToast('error', 'Upload failed — check file type and size');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async () => {
    if (!deleteAttTarget) return;
    setDeletingAtt(true);
    try {
      await deleteExpenseAttachment(id, deleteAttTarget.id);
      showToast('success', 'Attachment removed');
      setDeleteAttTarget(null);
      await load();
    } catch {
      showToast('error', 'Failed to remove attachment');
    } finally {
      setDeletingAtt(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm font-medium text-tetri-neutral">Expense not found</p>
        {loadError && (
          <p className="text-xs text-tetri-error bg-red-50 border border-red-200 rounded-lg px-4 py-2 inline-block max-w-md">
            {loadError}
          </p>
        )}
        <div>
          <Button variant="outline" onClick={() => navigate('/expenses')}>Back to Expenses</Button>
        </div>
      </div>
    );
  }

  const attachments = expense.expenseAttachments || [];

  return (
    <div className="space-y-6">
      {ToastContainer}

      <PageHeader title={expense.expenseNumber} subtitle={expense.description}>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/expenses')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button variant="outline" onClick={handleDuplicate} className="gap-2">
            <Copy className="w-4 h-4" /> Duplicate
          </Button>
          <Button variant="outline" onClick={() => navigate(`/expenses/${id}/edit`)} className="gap-2">
            <Edit2 className="w-4 h-4" /> Edit
          </Button>
          <Button variant="outline" className="gap-2 text-tetri-error hover:text-tetri-error" onClick={() => setDeleteTarget(expense)}>
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </PageHeader>

      {/* Status + type badges */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[expense.status] || 'bg-tetri-bg text-tetri-neutral border-tetri-border'}`}>
          {expense.status}
        </span>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-tetri-bg text-tetri-neutral border border-tetri-border">
          {TYPE_LABELS[expense.expenseType] || expense.expenseType}
        </span>
      </div>

      {/* Main info */}
      <div className="bg-white border border-tetri-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-tetri-text mb-4">Expense Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
          <LabelValue label="Expense Number" value={expense.expenseNumber} />
          <LabelValue label="Expense Date" value={fmtDate(expense.expenseDate)} />
          <LabelValue label="Posting Date" value={fmtDate(expense.postingDate)} />
          <LabelValue label="Status" value={expense.status} />
          <LabelValue label="Amount" value={fmtAmt(expense.amount, expense.currencyCode)} />
          <LabelValue label="Category" value={expense.category?.name} />
          <LabelValue label="Supplier" value={expense.supplier?.name} />
          <LabelValue label="Type" value={TYPE_LABELS[expense.expenseType]} />
          {expense.taxRate && <LabelValue label="Tax Rate" value={`${expense.taxRate}%${expense.taxIncluded ? ' (included)' : ''}`} />}
          {expense.referenceNumber && <LabelValue label="Reference #" value={expense.referenceNumber} />}
          {expense.department && <LabelValue label="Department" value={expense.department} />}
          {expense.costCenter && <LabelValue label="Cost Center" value={expense.costCenter} />}
          {expense.project && <LabelValue label="Project" value={expense.project} />}
        </div>
        {expense.notes && (
          <div className="mt-4 pt-4 border-t border-tetri-border">
            <p className="text-xs font-medium text-tetri-neutral uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-tetri-text whitespace-pre-wrap">{expense.notes}</p>
          </div>
        )}
      </div>

      {/* Attachments */}
      <div className="bg-white border border-tetri-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-tetri-text flex items-center gap-2">
            <Paperclip className="w-4 h-4" /> Attachments
            {attachments.length > 0 && (
              <span className="ml-1 text-xs bg-tetri-bg text-tetri-neutral px-1.5 py-0.5 rounded-full">{attachments.length}</span>
            )}
          </h3>
          <div>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-2">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Uploading…' : 'Upload'}
            </Button>
          </div>
        </div>

        {attachments.length === 0 ? (
          <div className="py-8 text-center space-y-1">
            <Paperclip className="w-8 h-8 text-tetri-border mx-auto" />
            <p className="text-sm text-tetri-neutral">No attachments yet</p>
            <p className="text-xs text-tetri-neutral/70">PDF, JPG, PNG up to 10MB</p>
          </div>
        ) : (
          <div className="divide-y divide-tetri-border">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-tetri-text truncate">{att.fileName}</p>
                  <p className="text-xs text-tetri-neutral">{att.mimeType} · {fmtSize(att.fileSize)}</p>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <a
                    href={getAttachmentDownloadUrl(id, att.id)}
                    download={att.fileName}
                    className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg hover:text-tetri-text transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => setDeleteAttTarget(att)}
                    className="p-1.5 rounded-lg text-tetri-neutral hover:bg-red-50 hover:text-tetri-error transition-colors"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="bg-tetri-bg border border-tetri-border rounded-xl px-5 py-4">
        <div className="flex flex-wrap gap-x-8 gap-y-1 text-xs text-tetri-neutral">
          {expense.createdByUser && <span>Created by {expense.createdByUser.fullName}</span>}
          {expense.createdAt && <span>on {fmtDate(expense.createdAt)}</span>}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Expense"
        description={`Delete expense ${deleteTarget?.expenseNumber}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmDialog
        open={!!deleteAttTarget}
        title="Remove Attachment"
        description={`Remove "${deleteAttTarget?.fileName}"? This cannot be undone.`}
        confirmLabel="Remove"
        variant="destructive"
        loading={deletingAtt}
        onConfirm={handleDeleteAttachment}
        onCancel={() => setDeleteAttTarget(null)}
      />
    </div>
  );
}

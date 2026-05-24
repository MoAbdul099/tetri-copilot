import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Loader2, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "../../../components/shared/Toast.jsx";
import AttachmentsPanel from "../../files/components/AttachmentsPanel.jsx";
import OccurrenceStatusBadge from "../components/OccurrenceStatusBadge.jsx";
import PriorityBadge from "../components/PriorityBadge.jsx";
import { getOccurrence, updateOccurrence, recordSubmission, addComment, deleteComment } from "../services/complianceService.js";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";
const fmtDT   = (d) => d ? new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const F = ({ label, value }) => (
  <div><p className="text-xs text-tetri-neutral uppercase tracking-wide mb-0.5">{label}</p><p className="text-sm text-tetri-text">{value || "—"}</p></div>
);

const STATUSES = ["scheduled","in_progress","submitted","approved","completed","cancelled","archived"];
const SUBMIT_OUTCOMES = ["submitted","accepted","pending_review"];

export default function OccurrenceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [occ, setOcc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const [submitForm, setSubmitForm] = useState({
    submissionDate: new Date().toISOString().slice(0, 10),
    authorityReference: "", internalReference: "", outcome: "submitted", notes: "",
  });

  const load = () => {
    getOccurrence(id)
      .then(setOcc)
      .catch(() => showToast("error", "Failed to load occurrence"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await updateOccurrence(id, { status: newStatus });
      showToast("success", "Status updated");
      load();
    } catch (err) {
      showToast("error", err?.response?.data?.error || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await recordSubmission(id, submitForm);
      showToast("success", "Submission recorded");
      setShowSubmit(false);
      load();
    } catch (err) {
      showToast("error", err?.response?.data?.error || "Failed to record submission");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setAddingComment(true);
    try {
      await addComment(id, commentText.trim());
      setCommentText("");
      load();
    } catch (err) {
      showToast("error", err?.response?.data?.error || "Failed to add comment");
    } finally {
      setAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(id, commentId);
      load();
    } catch (err) {
      showToast("error", "Failed to delete comment");
    }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" /></div>;
  if (!occ) return <div className="py-16 text-center text-tetri-muted">Occurrence not found</div>;

  const TABS = [
    { id: "details", label: "Details" },
    { id: "submission", label: "Submission" },
    { id: "comments", label: `Comments (${occ.comments?.length || 0})` },
    { id: "history", label: "Activity" },
    { id: "attachments", label: "Attachments" },
  ];

  return (
    <div className="space-y-6">
      {ToastContainer}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/compliance/occurrences")} className="flex items-center gap-1.5 text-sm text-tetri-muted hover:text-tetri-text">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-tetri-text">{occ.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <OccurrenceStatusBadge status={occ.status} />
              <PriorityBadge priority={occ.priority} />
              <span className="text-xs text-tetri-neutral">Due {fmtDate(occ.dueDate)}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            className="text-sm border border-tetri-border rounded-lg px-3 py-1.5 bg-white"
            value={occ.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updatingStatus}
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          {["scheduled","in_progress"].includes(occ.status) && (
            <Button size="sm" onClick={() => setShowSubmit(true)}>
              <Send className="w-4 h-4 mr-1" /> Record Submission
            </Button>
          )}
        </div>
      </div>

      {/* Overdue banner */}
      {occ.status === "overdue" && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <Clock className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm font-medium text-red-800">This occurrence is overdue. Due date was {fmtDate(occ.dueDate)}.</p>
        </div>
      )}

      {/* Record submission form */}
      {showSubmit && (
        <form onSubmit={handleSubmitRecord} className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-blue-900">Record Submission</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-tetri-neutral uppercase tracking-wide block mb-1">Submission Date *</label>
              <input type="date" required className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-white" value={submitForm.submissionDate} onChange={(e) => setSubmitForm((f) => ({ ...f, submissionDate: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-tetri-neutral uppercase tracking-wide block mb-1">Outcome</label>
              <select className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-white" value={submitForm.outcome} onChange={(e) => setSubmitForm((f) => ({ ...f, outcome: e.target.value }))}>
                {SUBMIT_OUTCOMES.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-tetri-neutral uppercase tracking-wide block mb-1">Authority Reference</label>
              <input className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-white" value={submitForm.authorityReference} onChange={(e) => setSubmitForm((f) => ({ ...f, authorityReference: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-tetri-neutral uppercase tracking-wide block mb-1">Internal Reference</label>
              <input className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-white" value={submitForm.internalReference} onChange={(e) => setSubmitForm((f) => ({ ...f, internalReference: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="text-xs text-tetri-neutral uppercase tracking-wide block mb-1">Notes</label>
            <textarea rows={2} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-white resize-none" value={submitForm.notes} onChange={(e) => setSubmitForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={submitting}>{submitting ? "Saving…" : "Save Submission"}</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowSubmit(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="border-b border-tetri-border">
        <div className="flex gap-0 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${activeTab === tab.id ? "border-tetri-blue text-tetri-blue" : "border-transparent text-tetri-muted hover:text-tetri-text"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "details" && (
        <div className="bg-white border border-tetri-border rounded-xl p-5">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            <F label="Template" value={occ.template?.name} />
            <F label="Jurisdiction" value={occ.jurisdiction?.name} />
            <F label="Category" value={occ.category?.name} />
            <F label="Authority" value={occ.authority?.name} />
            <F label="Owner" value={occ.owner?.fullName} />
            <F label="Backup Owner" value={occ.backupOwner?.fullName} />
            <F label="Department" value={occ.department} />
            <F label="Reference #" value={occ.referenceNumber} />
          </div>
          {occ.notes && (
            <div className="mt-4 pt-4 border-t border-tetri-border">
              <p className="text-xs text-tetri-neutral uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-tetri-text whitespace-pre-wrap">{occ.notes}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "submission" && (
        <div className="bg-white border border-tetri-border rounded-xl p-5">
          {occ.submission ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <F label="Submission Date" value={fmtDate(occ.submission.submissionDate)} />
              <F label="Submitted By" value={occ.submission.submittedBy?.fullName} />
              <F label="Outcome" value={occ.submission.outcome?.replace(/_/g, " ")} />
              <F label="Authority Reference" value={occ.submission.authorityReference} />
              <F label="Internal Reference" value={occ.submission.internalReference} />
              {occ.submission.notes && <div className="col-span-full"><F label="Notes" value={occ.submission.notes} /></div>}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-tetri-muted mb-3">No submission recorded yet</p>
              <Button size="sm" onClick={() => setShowSubmit(true)}><Send className="w-4 h-4 mr-1" /> Record Submission</Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "comments" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <input
              className="flex-1 px-3 py-2 text-sm border border-tetri-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
              placeholder="Add a comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
            />
            <Button size="sm" onClick={handleAddComment} disabled={addingComment || !commentText.trim()}>
              {addingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
            </Button>
          </div>
          {(occ.comments || []).length === 0 ? (
            <p className="text-sm text-tetri-muted text-center py-8">No comments yet</p>
          ) : (
            <div className="space-y-3">
              {occ.comments.map((c) => (
                <div key={c.id} className="bg-white border border-tetri-border rounded-xl px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-tetri-text">{c.author?.fullName || "—"}</p>
                      <p className="text-xs text-tetri-neutral mt-0.5">{fmtDT(c.createdAt)}</p>
                    </div>
                    <button onClick={() => handleDeleteComment(c.id)} className="text-xs text-tetri-neutral hover:text-tetri-error transition-colors">×</button>
                  </div>
                  <p className="text-sm text-tetri-text mt-2 whitespace-pre-wrap">{c.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-white border border-tetri-border rounded-xl divide-y divide-tetri-border">
          {(occ.activityLogs || []).length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-tetri-muted">No activity yet</p>
          ) : (
            occ.activityLogs.map((log) => (
              <div key={log.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-tetri-text">{log.actor?.fullName || "System"}</span>
                  <span className="text-tetri-neutral ml-2">{log.action?.replace(/_/g, " ")}</span>
                </div>
                <span className="text-xs text-tetri-neutral">{fmtDT(log.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "attachments" && (
        <AttachmentsPanel entityType="compliance_occurrence" entityId={id} />
      )}
    </div>
  );
}

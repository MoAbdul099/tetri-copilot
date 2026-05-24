import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "../../../components/shared/Toast.jsx";
import ConfirmDialog from "../../../components/shared/ConfirmDialog.jsx";
import AttachmentsPanel from "../../files/components/AttachmentsPanel.jsx";
import OccurrenceStatusBadge from "../components/OccurrenceStatusBadge.jsx";
import PriorityBadge from "../components/PriorityBadge.jsx";
import { getTemplate, deleteTemplate, generateOccurrences } from "../services/complianceService.js";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";
const FREQ_LABELS = {
  one_time: "One Time", weekly: "Weekly", monthly: "Monthly",
  quarterly: "Quarterly", semi_annual: "Semi-Annual", annual: "Annual", custom: "Custom",
};
const F = ({ label, value }) => (
  <div><p className="text-xs text-tetri-neutral uppercase tracking-wide mb-0.5">{label}</p><p className="text-sm text-tetri-text">{value || "—"}</p></div>
);

export default function TemplateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getTemplate(id)
      .then(setTemplate)
      .catch(() => showToast("error", "Failed to load template"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTemplate(id);
      showToast("success", "Template deleted");
      navigate("/compliance/templates");
    } catch (err) {
      showToast("error", err?.response?.data?.error || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const r = await generateOccurrences(id);
      showToast("success", `Generated ${r.generated || 0} new occurrences`);
      getTemplate(id).then(setTemplate).catch(() => {});
    } catch (err) {
      showToast("error", err?.response?.data?.error || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" /></div>;
  if (!template) return <div className="py-16 text-center text-tetri-muted">Template not found</div>;

  return (
    <div className="space-y-6">
      {ToastContainer}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/compliance/templates")} className="flex items-center gap-1.5 text-sm text-tetri-muted hover:text-tetri-text transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-tetri-text">{template.name}</h1>
            <p className="text-sm text-tetri-neutral">{FREQ_LABELS[template.frequency]} · {template.jurisdiction?.name || "No jurisdiction"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            Generate
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/compliance/templates/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="text-tetri-error hover:text-tetri-error" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <div className="bg-white border border-tetri-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-tetri-text mb-4">Template Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <F label="Frequency" value={FREQ_LABELS[template.frequency]} />
          <F label="Start Date" value={fmtDate(template.startDate)} />
          <F label="End Date" value={fmtDate(template.endDate)} />
          <F label="Max Occurrences" value={template.maxOccurrences || "Unlimited"} />
          <F label="Category" value={template.category?.name} />
          <F label="Authority" value={template.authority?.name} />
          <F label="Department" value={template.department} />
          <F label="Submission Method" value={template.submissionMethod} />
          <div><p className="text-xs text-tetri-neutral uppercase tracking-wide mb-0.5">Priority</p><PriorityBadge priority={template.priority} /></div>
          <F label="Owner" value={template.owner?.fullName} />
          <F label="Backup Owner" value={template.backupOwner?.fullName} />
          <F label="Auto Generate" value={template.autoGenerate ? "Yes" : "No"} />
        </div>
        {template.description && (
          <div className="mt-4 pt-4 border-t border-tetri-border">
            <p className="text-xs text-tetri-neutral uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-tetri-text">{template.description}</p>
          </div>
        )}
        {template.notes && (
          <div className="mt-4 pt-4 border-t border-tetri-border">
            <p className="text-xs text-tetri-neutral uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-tetri-text whitespace-pre-wrap">{template.notes}</p>
          </div>
        )}
      </div>

      {/* Recent occurrences */}
      {template.occurrences?.length > 0 && (
        <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-tetri-border">
            <h3 className="text-sm font-semibold text-tetri-text">Recent Occurrences</h3>
            <button onClick={() => navigate(`/compliance/occurrences?templateId=${id}`)} className="text-xs text-tetri-blue hover:underline">View all</button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-tetri-bg text-xs text-tetri-neutral uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tetri-border">
              {template.occurrences.map((o) => (
                <tr key={o.id} className="hover:bg-tetri-bg/50 cursor-pointer" onClick={() => navigate(`/compliance/occurrences/${o.id}`)}>
                  <td className="px-4 py-3 font-medium text-tetri-text">{o.name}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{fmtDate(o.dueDate)}</td>
                  <td className="px-4 py-3"><OccurrenceStatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AttachmentsPanel entityType="compliance_template" entityId={id} />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Template"
        description={`Delete "${template.name}"? All occurrences will also be deleted.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}

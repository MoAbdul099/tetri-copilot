import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, RefreshCw, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "../../../components/shared/PageHeader.jsx";
import { useToast } from "../../../components/shared/Toast.jsx";
import ConfirmDialog from "../../../components/shared/ConfirmDialog.jsx";
import { listTemplates, deleteTemplate, generateOccurrences } from "../services/complianceService.js";
import PriorityBadge from "../components/PriorityBadge.jsx";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const FREQ_LABELS = {
  one_time: "One Time", weekly: "Weekly", monthly: "Monthly",
  quarterly: "Quarterly", semi_annual: "Semi-Annual", annual: "Annual", custom: "Custom",
};

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [templates, setTemplates] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState(null);
  const limit = 20;

  const load = () => {
    setLoading(true);
    listTemplates({ search: search || undefined, page, limit })
      .then((data) => {
        setTemplates(Array.isArray(data) ? data : (data?.templates || []));
        setTotal(data?.total || 0);
      })
      .catch(() => showToast("error", "Failed to load templates"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, page]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTemplate(deleteTarget.id);
      showToast("success", "Template deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast("error", err?.response?.data?.error || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleGenerate = async (id) => {
    setGenerating(id);
    try {
      const r = await generateOccurrences(id);
      showToast("success", `Generated ${r.generated || 0} occurrences`);
    } catch (err) {
      showToast("error", err?.response?.data?.error || "Generation failed");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      {ToastContainer}
      <PageHeader title="Compliance Templates" subtitle={`${total} template${total !== 1 ? "s" : ""}`}>
        <Button onClick={() => navigate("/compliance/templates/new")}>
          <Plus className="w-4 h-4 mr-1" /> New Template
        </Button>
      </PageHeader>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-neutral" />
        <input
          className="w-full pl-9 pr-4 py-2 text-sm border border-tetri-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
          placeholder="Search templates…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" /></div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-tetri-border rounded-xl">
          <p className="text-sm text-tetri-muted mb-3">No compliance templates yet</p>
          <Button onClick={() => navigate("/compliance/templates/new")}><Plus className="w-4 h-4 mr-1" /> Create Template</Button>
        </div>
      ) : (
        <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-tetri-bg text-tetri-neutral text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Frequency</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Authority</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Start Date</th>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-tetri-border">
              {templates.map((t) => (
                <tr key={t.id} className="hover:bg-tetri-bg/50 cursor-pointer" onClick={() => navigate(`/compliance/templates/${t.id}`)}>
                  <td className="px-4 py-3 font-medium text-tetri-text">{t.name}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{FREQ_LABELS[t.frequency] || t.frequency}</td>
                  <td className="px-4 py-3">
                    {t.category ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.category.color || "#6366f1" }} />
                        <span className="text-tetri-neutral">{t.category.name}</span>
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-tetri-neutral">{t.authority?.name || "—"}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={t.priority} /></td>
                  <td className="px-4 py-3 text-tetri-neutral">{fmtDate(t.startDate)}</td>
                  <td className="px-4 py-3 text-tetri-neutral">{t.owner?.fullName || "—"}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="p-1.5 rounded-lg text-tetri-neutral hover:text-tetri-blue hover:bg-[#eff4ff] transition-colors"
                        title="Generate occurrences"
                        onClick={() => handleGenerate(t.id)}
                        disabled={generating === t.id}
                      >
                        {generating === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      </button>
                      <button
                        className="p-1.5 rounded-lg text-tetri-neutral hover:text-tetri-error hover:bg-red-50 transition-colors"
                        title="Delete"
                        onClick={() => setDeleteTarget(t)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {total > limit && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-tetri-border text-sm text-tetri-neutral">
              <span>Page {page} of {Math.ceil(total / limit)}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                <Button variant="outline" size="sm" disabled={page * limit >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Template"
        description={`Delete "${deleteTarget?.name}"? All occurrences will also be deleted.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

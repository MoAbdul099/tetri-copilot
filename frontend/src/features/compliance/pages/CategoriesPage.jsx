import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "../../../components/shared/PageHeader.jsx";
import { useToast } from "../../../components/shared/Toast.jsx";
import ConfirmDialog from "../../../components/shared/ConfirmDialog.jsx";
import { listCategories, createCategory, updateCategory, deleteCategory } from "../services/complianceService.js";

const COLORS = ["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#14b8a6","#6366f1","#64748b"];

const inputCls = "w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-tetri-blue/20";

export default function CategoriesPage() {
  const { showToast, ToastContainer } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: "#6366f1" });

  const load = () => {
    listCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : (data?.categories || [])))
      .catch(() => showToast("error", "Failed to load categories"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", color: "#6366f1" }); setShowForm(true); };
  const openEdit = (cat) => { setEditing(cat); setForm({ name: cat.name, description: cat.description || "", color: cat.color || "#6366f1" }); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showToast("error", "Name is required");
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, form);
        showToast("success", "Category updated");
      } else {
        await createCategory(form);
        showToast("success", "Category created");
      }
      closeForm();
      load();
    } catch (err) {
      showToast("error", err?.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      showToast("success", "Category deleted");
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast("error", err?.response?.data?.error || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const systemCats = categories.filter((c) => c.isSystem || !c.workspaceId);
  const workspaceCats = categories.filter((c) => !c.isSystem && c.workspaceId);

  return (
    <div className="space-y-6">
      {ToastContainer}
      <PageHeader title="Compliance Categories" subtitle="Manage compliance obligation categories">
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> New Category</Button>
      </PageHeader>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-tetri-text">{editing ? "Edit Category" : "New Category"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-tetri-neutral uppercase tracking-wide block mb-1">Name *</label>
              <input className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs text-tetri-neutral uppercase tracking-wide block mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded cursor-pointer border border-tetri-border" />
                <div className="flex gap-1.5 flex-wrap">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${form.color === c ? "border-tetri-blue scale-110" : "border-transparent"}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-tetri-neutral uppercase tracking-wide block mb-1">Description</label>
            <input className={inputCls} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>{saving ? "Saving…" : editing ? "Save" : "Create"}</Button>
            <Button type="button" variant="outline" size="sm" onClick={closeForm}>Cancel</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-tetri-neutral" /></div>
      ) : (
        <div className="space-y-6">
          {systemCats.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-tetri-neutral uppercase tracking-wide mb-3">System Categories</h3>
              <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
                {systemCats.map((cat, i) => (
                  <div key={cat.id} className={`flex items-center gap-4 px-5 py-3 ${i > 0 ? "border-t border-tetri-border" : ""}`}>
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || "#6366f1" }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-tetri-text">{cat.name}</p>
                      {cat.description && <p className="text-xs text-tetri-neutral">{cat.description}</p>}
                    </div>
                    <span className="text-xs text-tetri-neutral bg-tetri-bg border border-tetri-border rounded-full px-2 py-0.5">System</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {workspaceCats.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-tetri-neutral uppercase tracking-wide mb-3">Custom Categories</h3>
              <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
                {workspaceCats.map((cat, i) => (
                  <div key={cat.id} className={`flex items-center gap-4 px-5 py-3 ${i > 0 ? "border-t border-tetri-border" : ""}`}>
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || "#6366f1" }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-tetri-text">{cat.name}</p>
                      {cat.description && <p className="text-xs text-tetri-neutral">{cat.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg text-tetri-neutral hover:text-tetri-blue hover:bg-[#eff4ff] transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteTarget(cat)} className="p-1.5 rounded-lg text-tetri-neutral hover:text-tetri-error hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {categories.length === 0 && (
            <div className="text-center py-12 border border-dashed border-tetri-border rounded-xl">
              <p className="text-sm text-tetri-muted">No categories yet</p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Category"
        description={`Delete "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

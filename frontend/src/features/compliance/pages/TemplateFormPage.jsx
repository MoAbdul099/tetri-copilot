import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "../../../components/shared/Toast.jsx";
import {
  listJurisdictions, listAuthorities, listCategories,
  createTemplate, updateTemplate, getTemplate,
} from "../services/complianceService.js";
import { useParams } from "react-router-dom";
import api from "../../../lib/api.js";

const FREQUENCIES = [
  { value: "one_time",    label: "One Time" },
  { value: "weekly",      label: "Weekly" },
  { value: "monthly",     label: "Monthly" },
  { value: "quarterly",   label: "Quarterly" },
  { value: "semi_annual", label: "Semi-Annual" },
  { value: "annual",      label: "Annual" },
  { value: "custom",      label: "Custom" },
];

const PRIORITIES = ["low", "medium", "high", "critical"];
const CUSTOM_UNITS = ["days", "weeks", "months", "years"];

function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-tetri-neutral uppercase tracking-wide">
        {label}{required && <span className="text-tetri-error ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm border border-tetri-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-tetri-blue/20";

export default function TemplateFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { showToast, ToastContainer } = useToast();

  const [jurisdictions, setJurisdictions] = useState([]);
  const [authorities, setAuthorities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const [form, setForm] = useState({
    name: "", description: "", jurisdictionId: "", categoryId: "",
    authorityId: "", frequency: "monthly", customInterval: 1, customUnit: "months",
    startDate: new Date().toISOString().slice(0, 10), endDate: "",
    maxOccurrences: "", ownerUserId: "", backupOwnerUserId: "",
    department: "", priority: "medium", submissionMethod: "", notes: "",
    isActive: true, autoGenerate: true,
  });

  useEffect(() => {
    Promise.all([listJurisdictions(), listCategories(), api.get("/api/v1/members").then((r) => r.data.data)])
      .then(([juris, cats, mem]) => {
        setJurisdictions(Array.isArray(juris) ? juris : []);
        setCategories(Array.isArray(cats) ? cats : (cats?.categories || []));
        const memberList = Array.isArray(mem) ? mem : (mem?.members || []);
        setMembers(memberList);
      })
      .catch(() => {});

    if (isEdit) {
      getTemplate(id)
        .then((t) => {
          setForm({
            name: t.name || "", description: t.description || "",
            jurisdictionId: t.jurisdictionId || "", categoryId: t.categoryId || "",
            authorityId: t.authorityId || "", frequency: t.frequency || "monthly",
            customInterval: t.customInterval || 1, customUnit: t.customUnit || "months",
            startDate: t.startDate ? t.startDate.slice(0, 10) : "",
            endDate: t.endDate ? t.endDate.slice(0, 10) : "",
            maxOccurrences: t.maxOccurrences || "",
            ownerUserId: t.ownerUserId || "", backupOwnerUserId: t.backupOwnerUserId || "",
            department: t.department || "", priority: t.priority || "medium",
            submissionMethod: t.submissionMethod || "", notes: t.notes || "",
            isActive: t.isActive !== false, autoGenerate: t.autoGenerate !== false,
          });
          if (t.jurisdictionId) loadAuthorities(t.jurisdictionId);
        })
        .catch(() => showToast("error", "Failed to load template"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const loadAuthorities = (jurisdictionId) => {
    if (!jurisdictionId) { setAuthorities([]); return; }
    listAuthorities({ jurisdictionId }).then((a) => setAuthorities(Array.isArray(a) ? a : [])).catch(() => {});
  };

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return showToast("error", "Template name is required");
    if (!form.frequency) return showToast("error", "Frequency is required");
    if (!form.startDate) return showToast("error", "Start date is required");
    if (!form.ownerUserId) return showToast("error", "Owner is required");

    setSaving(true);
    try {
      const payload = {
        ...form,
        maxOccurrences: form.maxOccurrences ? parseInt(form.maxOccurrences) : null,
        customInterval: form.customInterval ? parseInt(form.customInterval) : null,
        jurisdictionId: form.jurisdictionId || null,
        categoryId: form.categoryId || null,
        authorityId: form.authorityId || null,
        backupOwnerUserId: form.backupOwnerUserId || null,
        endDate: form.endDate || null,
        department: form.department || null,
        submissionMethod: form.submissionMethod || null,
      };

      if (isEdit) {
        await updateTemplate(id, payload);
        showToast("success", "Template updated");
        navigate(`/compliance/templates/${id}`);
      } else {
        const t = await createTemplate(payload);
        showToast("success", "Template created");
        navigate(`/compliance/templates/${t.id}`);
      }
    } catch (err) {
      showToast("error", err?.response?.data?.error || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" /></div>;

  return (
    <div className="max-w-3xl space-y-6">
      {ToastContainer}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/compliance/templates")} className="flex items-center gap-1.5 text-sm text-tetri-muted hover:text-tetri-text transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Templates
        </button>
      </div>
      <h1 className="text-xl font-bold text-tetri-text">{isEdit ? "Edit Template" : "New Compliance Template"}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic */}
        <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-tetri-text">Template Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Template Name" required>
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </Field>
            <Field label="Priority">
              <select className={inputCls} value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Jurisdiction">
              <select className={inputCls} value={form.jurisdictionId} onChange={(e) => { set("jurisdictionId", e.target.value); set("authorityId", ""); loadAuthorities(e.target.value); }}>
                <option value="">— Select Jurisdiction —</option>
                {jurisdictions.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
              </select>
            </Field>
            <Field label="Authority">
              <select className={inputCls} value={form.authorityId} onChange={(e) => set("authorityId", e.target.value)} disabled={!form.jurisdictionId}>
                <option value="">— Select Authority —</option>
                {authorities.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select className={inputCls} value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                <option value="">— Select Category —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Department">
              <input className={inputCls} value={form.department} onChange={(e) => set("department", e.target.value)} placeholder="e.g. Finance, Legal" />
            </Field>
            <Field label="Submission Method">
              <input className={inputCls} value={form.submissionMethod} onChange={(e) => set("submissionMethod", e.target.value)} placeholder="e.g. Online Portal, Email" />
            </Field>
          </div>
          <Field label="Description">
            <textarea className={`${inputCls} resize-none`} rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
        </div>

        {/* Recurrence */}
        <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-tetri-text">Recurrence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Frequency" required>
              <select className={inputCls} value={form.frequency} onChange={(e) => set("frequency", e.target.value)}>
                {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </Field>
            {form.frequency === "custom" && (
              <>
                <Field label="Every">
                  <div className="flex gap-2">
                    <input type="number" min="1" className={`${inputCls} w-24`} value={form.customInterval} onChange={(e) => set("customInterval", e.target.value)} />
                    <select className={inputCls} value={form.customUnit} onChange={(e) => set("customUnit", e.target.value)}>
                      {CUSTOM_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </Field>
              </>
            )}
            <Field label="Start Date" required>
              <input type="date" className={inputCls} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} required />
            </Field>
            <Field label="End Date">
              <input type="date" className={inputCls} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
            </Field>
            <Field label="Max Occurrences">
              <input type="number" min="1" className={inputCls} value={form.maxOccurrences} onChange={(e) => set("maxOccurrences", e.target.value)} placeholder="Unlimited" />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-tetri-text cursor-pointer">
            <input type="checkbox" checked={form.autoGenerate} onChange={(e) => set("autoGenerate", e.target.checked)} className="rounded" />
            Auto-generate occurrences
          </label>
        </div>

        {/* Ownership */}
        <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-tetri-text">Ownership</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Owner" required>
              <select className={inputCls} value={form.ownerUserId} onChange={(e) => set("ownerUserId", e.target.value)} required>
                <option value="">— Select Owner —</option>
                {members.map((m) => <option key={m.userId || m.id} value={m.userId || m.id}>{m.user?.fullName || m.fullName || m.email}</option>)}
              </select>
            </Field>
            <Field label="Backup Owner">
              <select className={inputCls} value={form.backupOwnerUserId} onChange={(e) => set("backupOwnerUserId", e.target.value)}>
                <option value="">— None —</option>
                {members.map((m) => <option key={m.userId || m.id} value={m.userId || m.id}>{m.user?.fullName || m.fullName || m.email}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white border border-tetri-border rounded-xl p-5 space-y-3">
          <Field label="Internal Notes">
            <textarea className={`${inputCls} resize-none`} rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </Field>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Saving…</> : isEdit ? "Save Changes" : "Create Template"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/compliance/templates")}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

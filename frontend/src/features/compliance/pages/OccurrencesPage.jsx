import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "../../../components/shared/PageHeader.jsx";
import { useToast } from "../../../components/shared/Toast.jsx";
import OccurrenceStatusBadge from "../components/OccurrenceStatusBadge.jsx";
import PriorityBadge from "../components/PriorityBadge.jsx";
import { listOccurrences, listJurisdictions, listCategories } from "../services/complianceService.js";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const STATUSES = ["scheduled","in_progress","submitted","approved","completed","overdue","cancelled","archived"];
const PRIORITIES = ["low","medium","high","critical"];

export default function OccurrencesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast, ToastContainer } = useToast();
  const [occurrences, setOccurrences] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [jurisdictionId, setJurisdictionId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 20;

  useEffect(() => {
    listJurisdictions().then((d) => setJurisdictions(Array.isArray(d) ? d : [])).catch(() => {});
    listCategories().then((d) => setCategories(Array.isArray(d) ? d : (d?.categories || []))).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    listOccurrences({ search: search || undefined, status: status || undefined, priority: priority || undefined, jurisdictionId: jurisdictionId || undefined, categoryId: categoryId || undefined, page, limit })
      .then((data) => {
        setOccurrences(Array.isArray(data) ? data : (data?.items || []));
        setTotal(data?.total || 0);
      })
      .catch(() => showToast("error", "Failed to load occurrences"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, status, priority, jurisdictionId, categoryId, page]);

  const overdueCount = occurrences.filter((o) => o.status === "overdue").length;

  return (
    <div className="space-y-6">
      {ToastContainer}
      <PageHeader title="Compliance Occurrences" subtitle={`${total} occurrence${total !== 1 ? "s" : ""}${overdueCount > 0 ? ` · ${overdueCount} overdue` : ""}`} />

      {/* Search + filter bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tetri-neutral" />
          <input
            className="w-full pl-9 pr-4 py-2 text-sm border border-tetri-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-tetri-blue/20"
            placeholder="Search occurrences…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowFilters((v) => !v)}>
          <Filter className="w-4 h-4 mr-1" /> Filters
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-tetri-bg border border-tetri-border rounded-xl">
          <select className="text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          <select className="text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white" value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }}>
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white" value={jurisdictionId} onChange={(e) => { setJurisdictionId(e.target.value); setPage(1); }}>
            <option value="">All Jurisdictions</option>
            {jurisdictions.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
          </select>
          <select className="text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white" value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" /></div>
      ) : occurrences.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-tetri-border rounded-xl">
          <p className="text-sm text-tetri-muted">No occurrences found</p>
          <p className="text-xs text-tetri-neutral mt-1">Create templates to generate compliance occurrences</p>
        </div>
      ) : (
        <div className="bg-white border border-tetri-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-tetri-bg text-tetri-neutral text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Occurrence</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Priority</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Authority</th>
                <th className="px-4 py-3 text-left">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tetri-border">
              {occurrences.map((o) => {
                const isOverdue = o.status === "overdue";
                return (
                  <tr key={o.id} className="hover:bg-tetri-bg/50 cursor-pointer" onClick={() => navigate(`/compliance/occurrences/${o.id}`)}>
                    <td className={`px-4 py-3 font-medium ${isOverdue ? "text-red-700" : "text-tetri-text"}`}>{o.name}</td>
                    <td className={`px-4 py-3 ${isOverdue ? "text-red-600 font-medium" : "text-tetri-neutral"}`}>{fmtDate(o.dueDate)}</td>
                    <td className="px-4 py-3"><OccurrenceStatusBadge status={o.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={o.priority} /></td>
                    <td className="px-4 py-3">
                      {o.category ? (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: o.category.color || "#6366f1" }} />
                          <span className="text-tetri-neutral">{o.category.name}</span>
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-tetri-neutral">{o.authority?.name || "—"}</td>
                    <td className="px-4 py-3 text-tetri-neutral">{o.owner?.fullName || "—"}</td>
                  </tr>
                );
              })}
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
    </div>
  );
}

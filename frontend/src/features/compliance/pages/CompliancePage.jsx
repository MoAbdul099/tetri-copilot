import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ClipboardList, Calendar, Tag, BookOpen, Zap, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStats, getRecommendations, listPacks, installPack } from "../services/complianceService.js";
import { useToast } from "../../../components/shared/Toast.jsx";

const STAT_CARDS = [
  { key: "scheduled",   label: "Scheduled",   icon: Clock,          color: "text-blue-600",   bg: "bg-blue-50" },
  { key: "in_progress", label: "In Progress",  icon: Zap,            color: "text-orange-600", bg: "bg-orange-50" },
  { key: "overdue",     label: "Overdue",      icon: AlertTriangle,  color: "text-red-600",    bg: "bg-red-50" },
  { key: "completed",   label: "Completed",    icon: CheckCircle2,   color: "text-green-600",  bg: "bg-green-50" },
];

export default function CompliancePage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [packs, setPacks] = useState([]);
  const [installing, setInstalling] = useState(null);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
    getRecommendations().then(setRecommendations).catch(() => {});
    listPacks().then((data) => {
      const list = Array.isArray(data) ? data : (data?.packs || []);
      setPacks(list);
    }).catch(() => {});
  }, []);

  const handleInstall = async (packId) => {
    setInstalling(packId);
    try {
      const result = await installPack(packId, {});
      showToast("success", `Pack installed — ${result.templatesCreated || 0} templates added`);
      getStats().then(setStats).catch(() => {});
    } catch (err) {
      showToast("error", err?.response?.data?.error || "Failed to install pack");
    } finally {
      setInstalling(null);
    }
  };

  const quickLinks = [
    { label: "Templates",   icon: ClipboardList, to: "/compliance/templates",   desc: "Manage recurring compliance obligations" },
    { label: "Occurrences", icon: ShieldCheck,   to: "/compliance/occurrences", desc: "Track and action compliance events" },
    { label: "Calendar",    icon: Calendar,      to: "/compliance/calendar",    desc: "View compliance calendar" },
    { label: "Categories",  icon: Tag,           to: "/compliance/categories",  desc: "Manage compliance categories" },
    { label: "Packs",       icon: BookOpen,      to: "/compliance/packs",       desc: "Browse compliance pack library" },
  ];

  const statusCounts = stats?.byStatus || {};

  return (
    <div className="space-y-8">
      {ToastContainer}

      <div>
        <h1 className="text-2xl font-bold text-tetri-text">Compliance</h1>
        <p className="text-sm text-tetri-muted mt-1">Manage your regulatory obligations and compliance calendar.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="bg-white border border-tetri-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </span>
              <p className="text-xs text-tetri-neutral">{label}</p>
            </div>
            <p className={`text-2xl font-bold ${key === "overdue" && (statusCounts[key] || 0) > 0 ? "text-red-600" : "text-tetri-text"}`}>
              {statusCounts[key] || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {quickLinks.map(({ label, icon: Icon, to, desc }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="bg-white border border-tetri-border rounded-xl p-4 text-left hover:border-tetri-blue hover:shadow-sm transition-all group"
          >
            <Icon className="w-5 h-5 text-tetri-blue mb-2" />
            <p className="text-sm font-semibold text-tetri-text group-hover:text-tetri-blue">{label}</p>
            <p className="text-xs text-tetri-neutral mt-0.5">{desc}</p>
          </button>
        ))}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Recommended Compliance Packs</h3>
          <div className="space-y-3">
            {recommendations.map((pack) => (
              <div key={pack.id} className="flex items-center justify-between gap-4 bg-white border border-blue-100 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-tetri-text">{pack.name}</p>
                  {pack.description && <p className="text-xs text-tetri-neutral mt-0.5">{pack.description}</p>}
                </div>
                <Button size="sm" onClick={() => handleInstall(pack.id)} disabled={installing === pack.id}>
                  {installing === pack.id ? "Installing…" : "Install"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

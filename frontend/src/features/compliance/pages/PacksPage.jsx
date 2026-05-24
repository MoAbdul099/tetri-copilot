import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "../../../components/shared/PageHeader.jsx";
import { useToast } from "../../../components/shared/Toast.jsx";
import { listPacks, listJurisdictions, installPack } from "../services/complianceService.js";

export default function PacksPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [packs, setPacks] = useState([]);
  const [jurisdictions, setJurisdictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterJurisdiction, setFilterJurisdiction] = useState("");
  const [installing, setInstalling] = useState(null);

  const load = () => {
    Promise.all([
      listPacks(filterJurisdiction ? { jurisdictionId: filterJurisdiction } : {}),
      listJurisdictions(),
    ])
      .then(([packsData, jurisData]) => {
        setPacks(Array.isArray(packsData) ? packsData : (packsData?.packs || []));
        setJurisdictions(Array.isArray(jurisData) ? jurisData : []);
      })
      .catch(() => showToast("error", "Failed to load packs"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterJurisdiction]);

  const handleInstall = async (packId) => {
    setInstalling(packId);
    try {
      const result = await installPack(packId, {});
      showToast("success", `Pack installed — ${result.templatesCreated || 0} templates created`);
    } catch (err) {
      showToast("error", err?.response?.data?.error || "Failed to install pack");
    } finally {
      setInstalling(null);
    }
  };

  return (
    <div className="space-y-6">
      {ToastContainer}
      <PageHeader title="Compliance Pack Library" subtitle="Install curated compliance packs for your jurisdiction">
        <select
          className="text-sm border border-tetri-border rounded-lg px-3 py-2 bg-white"
          value={filterJurisdiction}
          onChange={(e) => setFilterJurisdiction(e.target.value)}
        >
          <option value="">All Jurisdictions</option>
          {jurisdictions.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
        </select>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" /></div>
      ) : packs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-tetri-border rounded-xl">
          <p className="text-sm text-tetri-muted">No compliance packs available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packs.map((pack) => (
            <div key={pack.id} className="bg-white border border-tetri-border rounded-xl p-5 flex flex-col gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-tetri-text">{pack.name}</h3>
                  <span className="text-xs text-tetri-neutral bg-tetri-bg border border-tetri-border rounded-full px-2 py-0.5 flex-shrink-0">
                    {pack.jurisdiction?.code || "—"}
                  </span>
                </div>
                {pack.description && <p className="text-xs text-tetri-neutral">{pack.description}</p>}
              </div>

              {pack.items?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-tetri-neutral uppercase tracking-wide">Includes</p>
                  <ul className="space-y-1">
                    {pack.items.map((item) => (
                      <li key={item.id} className="text-xs text-tetri-text flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-tetri-blue flex-shrink-0" />
                        {item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={() => handleInstall(pack.id)}
                disabled={installing === pack.id}
                className="w-full"
              >
                {installing === pack.id ? (
                  <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Installing…</>
                ) : (
                  <><Download className="w-4 h-4 mr-1" /> Install Pack</>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { Building2, ChevronRight, CheckCircle } from 'lucide-react';
import { setActiveWorkspaceId } from '../../../lib/workspace.js';

const roleLabel = { owner: 'Owner', admin: 'Admin', user: 'Member' };

export default function WorkspacePickerPage({ workspaces = [], onSelect }) {
  const handleSelect = (ws) => {
    setActiveWorkspaceId(ws.id);
    onSelect(ws);
  };

  return (
    <div className="min-h-screen bg-tetri-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/logo.svg" alt="Tetri Copilot" className="h-10" />
        </div>

        <div className="bg-tetri-surface border border-tetri-border rounded-card p-6 shadow-sm">
          <h1 className="text-lg font-bold text-tetri-text mb-1">Select a workspace</h1>
          <p className="text-sm text-tetri-muted mb-5">
            You have access to {workspaces.length} workspaces. Choose one to continue.
          </p>

          <ul className="space-y-2">
            {workspaces.map((ws) => (
              <li key={ws.id}>
                <button
                  onClick={() => handleSelect(ws)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-tetri-border hover:border-tetri-blue hover:bg-[#eff4ff] transition-all group text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-tetri-blue/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-tetri-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-tetri-text truncate">{ws.name}</p>
                    {ws.companyName && ws.companyName !== ws.name && (
                      <p className="text-xs text-tetri-muted truncate">{ws.companyName}</p>
                    )}
                    <p className="text-xs text-tetri-muted mt-0.5">{roleLabel[ws.role] || ws.role}</p>
                  </div>
                  {!ws.setupComplete && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                      Setup needed
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-tetri-muted group-hover:text-tetri-blue flex-shrink-0 transition-colors" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-center text-xs text-tetri-muted mt-4">
          Need access to a different workspace? Ask the workspace owner to invite you.
        </p>
      </div>
    </div>
  );
}

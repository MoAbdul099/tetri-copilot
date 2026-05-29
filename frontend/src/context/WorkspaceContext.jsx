import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import workspaceService from '../features/workspace/services/workspaceService.js';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ workspaceId, children }) {
  const [full, setFull] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!workspaceId) { setLoading(false); return; }
    setLoading(true);
    workspaceService.getCurrent()
      .then((ws) => setFull(ws))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <WorkspaceContext.Provider value={{ workspace: full, loading, refresh }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext) ?? { workspace: null, loading: false, refresh: () => {} };
}

export function useCountryProfile() {
  const { workspace } = useWorkspace();
  return workspace?.countryProfile ?? null;
}

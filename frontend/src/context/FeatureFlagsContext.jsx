import { createContext, useContext, useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const FeatureFlagsContext = createContext({});

export function FeatureFlagsProvider({ children }) {
  const [flags, setFlags] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/feature-flags`)
      .then((r) => r.json())
      .then((body) => {
        if (body.success && Array.isArray(body.data)) {
          const map = {};
          for (const f of body.data) map[f.name] = f;
          setFlags(map);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return (
    <FeatureFlagsContext.Provider value={{ flags, loaded }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

/**
 * Returns true if the named feature flag is enabled.
 * Falls back to `fallback` (default true) while flags are loading,
 * so existing features stay visible during the fetch.
 */
export function useFeatureFlag(name, fallback = true) {
  const { flags, loaded } = useContext(FeatureFlagsContext);
  if (!loaded) return fallback;
  return flags[name]?.enabled ?? false;
}

export default FeatureFlagsContext;

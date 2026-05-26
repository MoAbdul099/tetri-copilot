const KEY = 'tetri_active_workspace';

export const getActiveWorkspaceId = () => localStorage.getItem(KEY);
export const setActiveWorkspaceId = (id) => localStorage.setItem(KEY, id);
export const clearActiveWorkspaceId = () => localStorage.removeItem(KEY);

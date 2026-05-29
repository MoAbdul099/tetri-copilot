import api from './api';

const listLanguages   = (params) => api.get('/api/admin/languages', { params }).then(r => r.data.data);
const getLanguage     = (id)     => api.get(`/api/admin/languages/${id}`).then(r => r.data.data);
const createLanguage  = (body)   => api.post('/api/admin/languages', body).then(r => r.data.data);
const updateLanguage  = (id, b)  => api.put(`/api/admin/languages/${id}`, b).then(r => r.data.data);
const changeStatus    = (id, isActive) => api.patch(`/api/admin/languages/${id}/status`, { isActive }).then(r => r.data.data);

export default { listLanguages, getLanguage, createLanguage, updateLanguage, changeStatus };

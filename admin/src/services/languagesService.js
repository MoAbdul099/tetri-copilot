import api from './api';

const listLanguages   = (params) => api.get('/languages', { params }).then(r => r.data.data);
const getLanguage     = (id)     => api.get(`/languages/${id}`).then(r => r.data.data);
const createLanguage  = (body)   => api.post('/languages', body).then(r => r.data.data);
const updateLanguage  = (id, b)  => api.put(`/languages/${id}`, b).then(r => r.data.data);
const changeStatus    = (id, isActive) => api.patch(`/languages/${id}/status`, { isActive }).then(r => r.data.data);

export default { listLanguages, getLanguage, createLanguage, updateLanguage, changeStatus };

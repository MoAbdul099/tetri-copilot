import api from './api';

const listCurrencies  = (params) => api.get('/api/admin/currencies', { params }).then(r => r.data.data);
const getCurrency     = (id)     => api.get(`/api/admin/currencies/${id}`).then(r => r.data.data);
const createCurrency  = (body)   => api.post('/api/admin/currencies', body).then(r => r.data.data);
const updateCurrency  = (id, b)  => api.put(`/api/admin/currencies/${id}`, b).then(r => r.data.data);
const changeStatus    = (id, isActive) => api.patch(`/api/admin/currencies/${id}/status`, { isActive }).then(r => r.data.data);

export default { listCurrencies, getCurrency, createCurrency, updateCurrency, changeStatus };

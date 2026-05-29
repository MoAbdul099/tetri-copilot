import api from './api';

const listCurrencies  = (params) => api.get('/currencies', { params }).then(r => r.data.data);
const getCurrency     = (id)     => api.get(`/currencies/${id}`).then(r => r.data.data);
const createCurrency  = (body)   => api.post('/currencies', body).then(r => r.data.data);
const updateCurrency  = (id, b)  => api.put(`/currencies/${id}`, b).then(r => r.data.data);
const changeStatus    = (id, isActive) => api.patch(`/currencies/${id}/status`, { isActive }).then(r => r.data.data);

export default { listCurrencies, getCurrency, createCurrency, updateCurrency, changeStatus };

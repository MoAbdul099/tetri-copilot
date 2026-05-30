import api from '../../../lib/api';

export const createCheckoutSession = async ({ planCode, billingInterval = 'monthly' }) => {
  const { data } = await api.post('/api/v1/billing/checkout-session', { planCode, billingInterval });
  return data.data;
};

export const createPortalSession = async () => {
  const { data } = await api.post('/api/v1/billing/portal-session');
  return data.data;
};

export const getBillingEvents = async (params = {}) => {
  const { data } = await api.get('/api/v1/billing/events', { params });
  return data.data;
};

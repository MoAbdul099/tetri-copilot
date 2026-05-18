import api from '../../../lib/api';

export const getCurrentSubscription = async () => {
  const { data } = await api.get('/api/v1/subscription/current');
  return data.data.subscription;
};

export const getFeatureAccess = async () => {
  const { data } = await api.get('/api/v1/subscription/features');
  return data.data;
};

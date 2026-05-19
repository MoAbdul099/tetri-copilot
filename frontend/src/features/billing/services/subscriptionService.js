import api from '../../../lib/api';

export const getCurrentSubscription = async () => {
  const { data } = await api.get('/api/v1/subscription/current');
  return data.data.subscription;
};

export const getFeatureAccess = async () => {
  const { data } = await api.get('/api/v1/subscription/features');
  return data.data;
};

export const upgradePlan = async (planCode) => {
  const { data } = await api.patch('/api/v1/subscription/upgrade', { planCode });
  return data.data.subscription;
};

export const downgradePlan = async (planCode) => {
  const { data } = await api.patch('/api/v1/subscription/downgrade', { planCode });
  return data.data.subscription;
};

export const cancelSubscription = async () => {
  const { data } = await api.patch('/api/v1/subscription/cancel');
  return data.data.subscription;
};

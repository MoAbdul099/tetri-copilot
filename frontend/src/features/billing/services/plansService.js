import api from '../../../lib/api';

export const getPlans = async () => {
  const { data } = await api.get('/api/v1/plans');
  return data.data.plans;
};

export const getPlanBySlug = async (slug) => {
  const { data } = await api.get(`/api/v1/plans/${slug}`);
  return data.data.plan;
};

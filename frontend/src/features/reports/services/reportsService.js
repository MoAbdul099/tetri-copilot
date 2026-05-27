import api from '../../../lib/api.js';

const BASE = '/api/v1/reports';

const reportsService = {
  getCatalog:         ()                      => api.get(BASE).then((r) => r.data.data),
  getDefinition:      (code)                  => api.get(`${BASE}/${code}`).then((r) => r.data.data),
  runReport:          (code, filters, page)   => api.post(`${BASE}/${code}/run`, { filters, pagination: page }).then((r) => r.data.data),
  createExport:       (code, format, filters, savedReportId) =>
    api.post(`${BASE}/${code}/export`, { format, filters, savedReportId }).then((r) => r.data.data),
  getExportJob:       (jobId)                 => api.get(`${BASE}/exports/${jobId}`).then((r) => r.data.data),
  downloadUrl:        (jobId)                 => `${BASE}/exports/${jobId}/download`,

  listSaved:          ()                      => api.get(`${BASE}/saved`).then((r) => r.data.data),
  createSaved:        (body)                  => api.post(`${BASE}/saved`, body).then((r) => r.data.data),
  updateSaved:        (id, body)              => api.put(`${BASE}/saved/${id}`, body).then((r) => r.data.data),
  deleteSaved:        (id)                    => api.delete(`${BASE}/saved/${id}`).then((r) => r.data.data),

  listSchedules:      ()                      => api.get(`${BASE}/schedules`).then((r) => r.data.data),
  createSchedule:     (body)                  => api.post(`${BASE}/schedules`, body).then((r) => r.data.data),
  updateSchedule:     (id, body)              => api.put(`${BASE}/schedules/${id}`, body).then((r) => r.data.data),
  deleteSchedule:     (id)                    => api.delete(`${BASE}/schedules/${id}`).then((r) => r.data.data),
  runNow:             (id)                    => api.post(`${BASE}/schedules/${id}/run-now`).then((r) => r.data.data),
};

export default reportsService;

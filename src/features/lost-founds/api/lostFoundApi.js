import { fetchApi } from '../../../helpers/apiHelper';

// params: { status, is_completed, is_me }
export const getLostFounds = (params) => fetchApi('/lost-founds', { params });

export const getLostFound = (id) => fetchApi(`/lost-founds/${id}`);

export const postLostFound = ({ title, description, status }) =>
  fetchApi('/lost-founds', {
    method: 'POST',
    body: { title, description, status },
  });

export const putLostFound = (id, { title, description, status, isCompleted }) =>
  fetchApi(`/lost-founds/${id}`, {
    method: 'PUT',
    body: {
      title,
      description,
      status,
      is_completed: isCompleted ? 1 : 0,
    },
  });

export const postLostFoundCover = (id, file) => {
  const formData = new FormData();
  formData.append('cover', file);

  return fetchApi(`/lost-founds/${id}/cover`, {
    method: 'POST',
    body: formData,
  });
};

export const deleteLostFound = (id) =>
  fetchApi(`/lost-founds/${id}`, { method: 'DELETE' });

// params: { end_date, total_data }
export const getLostFoundStatsDaily = (params) =>
  fetchApi('/lost-founds/stats/daily', { params });

export const getLostFoundStatsMonthly = (params) =>
  fetchApi('/lost-founds/stats/monthly', { params });
import { fetchApi } from '../../../helpers/apiHelper';

export const getUsers = () => fetchApi('/users');

export const getProfile = () => fetchApi('/users/me');

export const putProfile = ({ name, email }) =>
  fetchApi('/users/me', { method: 'PUT', body: { name, email } });

export const postProfilePhoto = (file) => {
  const formData = new FormData();
  formData.append('photo', file);

  return fetchApi('/users/me/photo', { method: 'POST', body: formData });
};

export const putProfilePassword = ({ password, newPassword }) =>
  fetchApi('/users/me/password', {
    method: 'PUT',
    body: {
      password,
      new_password: newPassword,
      new_password_confirmation: newPassword,
    },
  });
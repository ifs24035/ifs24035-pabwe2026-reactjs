import { fetchApi } from '../../../helpers/apiHelper';

export const postLogin = ({ email, password }) =>
  fetchApi('/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });

export const postRegister = ({ name, email, password }) =>
  fetchApi('/auth/register', {
    method: 'POST',
    body: { name, email, password },
    auth: false,
  });
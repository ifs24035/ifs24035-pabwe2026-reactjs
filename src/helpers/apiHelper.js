/* global DELCOM_BASEURL */
const TOKEN_KEY = 'accessToken';

export const BASE_URL = DELCOM_BASEURL;

const ASSET_BASE_URL = BASE_URL.replace(/\/api\/v\d+\/?$/, '');

export const getAssetUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${ASSET_BASE_URL}/${path.replace(/^\/+/, '')}`;
};

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);

export const putAccessToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const removeAccessToken = () => localStorage.removeItem(TOKEN_KEY);

export const buildQuery = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });

  const result = query.toString();
  return result ? `?${result}` : '';
};

/**
 * Wrapper fetch untuk REST API Delcom.
 * Selalu mengembalikan { success, message, data } dan tidak melempar error.
 */
export const fetchApi = async (
  path,
  { method = 'GET', params, body, auth = true } = {},
) => {
  const headers = { Accept: 'application/json' };
  const token = getAccessToken();

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData = body instanceof FormData;

  if (body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${BASE_URL}${path}${buildQuery(params)}`, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
    });

    const json = await response.json();

    return {
      success: json.status === 'success',
      message: json.message,
      data: json.data,
    };
  } catch {
    return {
      success: false,
      message: 'Tidak dapat terhubung ke server',
      data: undefined,
    };
  }
};
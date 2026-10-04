import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BASE_URL,
  buildQuery,
  fetchApi,
  getAccessToken,
  getAssetUrl,
  putAccessToken,
  removeAccessToken,
} from './apiHelper';

const mockResponse = (json) => ({ json: () => Promise.resolve(json) });

describe('apiHelper', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('token storage', () => {
    it('menyimpan, mengambil, dan menghapus token', () => {
      expect(getAccessToken()).toBeNull();
      putAccessToken('abc');
      expect(getAccessToken()).toBe('abc');
      removeAccessToken();
      expect(getAccessToken()).toBeNull();
    });
  });

  describe('buildQuery', () => {
    it('mengembalikan string kosong jika tanpa parameter', () => {
      expect(buildQuery()).toBe('');
    });
  
    describe('getAssetUrl', () => {
    it('mengembalikan null jika path kosong', () => {
      expect(getAssetUrl(null)).toBeNull();
      expect(getAssetUrl('')).toBeNull();
    });

    it('mengembalikan URL absolut apa adanya', () => {
      expect(getAssetUrl('https://cdn.example.com/a.png')).toBe(
        'https://cdn.example.com/a.png',
      );
    });

    it('menggabungkan path relatif dengan domain API', () => {
      expect(getAssetUrl('img/users/a.png')).toBe(
        'https://open-api.delcom.org/img/users/a.png',
      );
      expect(getAssetUrl('/img/users/a.png')).toBe(
        'https://open-api.delcom.org/img/users/a.png',
      );
    });
  });

    it('mengabaikan nilai undefined, null, dan string kosong', () => {
      expect(buildQuery({ a: undefined, b: null, c: '' })).toBe('');
    });

    it('membangun query string yang valid', () => {
      expect(buildQuery({ status: 'lost', is_completed: 0 })).toBe(
        '?status=lost&is_completed=0',
      );
    });
  });

  describe('fetchApi', () => {
    it('mengirim GET dengan bearer token dan query params', async () => {
      putAccessToken('token-123');
      fetchMock.mockResolvedValue(
        mockResponse({ status: 'success', message: 'ok', data: { x: 1 } }),
      );

      const result = await fetchApi('/lost-founds', {
        params: { status: 'lost' },
      });

      expect(fetchMock).toHaveBeenCalledWith(
        `${BASE_URL}/lost-founds?status=lost`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer token-123',
          },
          body: undefined,
        },
      );
      expect(result).toEqual({ success: true, message: 'ok', data: { x: 1 } });
    });

    it('tidak menambahkan Authorization jika auth=false', async () => {
      putAccessToken('token-123');
      fetchMock.mockResolvedValue(mockResponse({ status: 'success' }));

      await fetchApi('/auth/login', { auth: false });

      expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
    });

    it('tidak menambahkan Authorization jika token belum ada', async () => {
      fetchMock.mockResolvedValue(mockResponse({ status: 'success' }));

      await fetchApi('/users');

      expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
    });

    it('mengirim body JSON dengan Content-Type json', async () => {
      fetchMock.mockResolvedValue(mockResponse({ status: 'success' }));

      await fetchApi('/lost-founds', { method: 'POST', body: { title: 'A' } });

      const options = fetchMock.mock.calls[0][1];
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');
      expect(options.body).toBe(JSON.stringify({ title: 'A' }));
    });

    it('mengirim FormData tanpa Content-Type manual', async () => {
      fetchMock.mockResolvedValue(mockResponse({ status: 'success' }));
      const formData = new FormData();
      formData.append('cover', 'file');

      await fetchApi('/lost-founds/1/cover', { method: 'POST', body: formData });

      const options = fetchMock.mock.calls[0][1];
      expect(options.headers['Content-Type']).toBeUndefined();
      expect(options.body).toBe(formData);
    });

    it('mengembalikan success=false saat status fail', async () => {
      fetchMock.mockResolvedValue(
        mockResponse({ status: 'fail', message: 'Data tidak valid' }),
      );

      const result = await fetchApi('/lost-founds');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Data tidak valid');
    });

    it('menangani error jaringan', async () => {
      fetchMock.mockRejectedValue(new Error('network'));

      const result = await fetchApi('/lost-founds');

      expect(result).toEqual({
        success: false,
        message: 'Tidak dapat terhubung ke server',
        data: undefined,
      });
    });
  });
});
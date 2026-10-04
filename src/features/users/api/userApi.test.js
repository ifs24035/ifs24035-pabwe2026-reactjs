import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchApi } from '../../../helpers/apiHelper';
import {
  getProfile,
  getUsers,
  postProfilePhoto,
  putProfile,
  putProfilePassword,
} from './userApi';

vi.mock('../../../helpers/apiHelper', () => ({ fetchApi: vi.fn() }));

describe('userApi', () => {
  beforeEach(() => {
    fetchApi.mockReset();
    fetchApi.mockResolvedValue({ success: true });
  });

  it('getUsers memanggil GET /users', async () => {
    const result = await getUsers();

    expect(fetchApi).toHaveBeenCalledWith('/users');
    expect(result).toEqual({ success: true });
  });

  it('getProfile memanggil GET /users/me', async () => {
    await getProfile();

    expect(fetchApi).toHaveBeenCalledWith('/users/me');
  });

  it('putProfile memanggil PUT /users/me dengan nama dan email', async () => {
    await putProfile({ name: 'Budi', email: 'budi@mail.com' });

    expect(fetchApi).toHaveBeenCalledWith('/users/me', {
      method: 'PUT',
      body: { name: 'Budi', email: 'budi@mail.com' },
    });
  });

  it('postProfilePhoto mengirim FormData berisi berkas foto', async () => {
    const file = new File(['isi'], 'foto.png', { type: 'image/png' });

    await postProfilePhoto(file);

    const [path, options] = fetchApi.mock.calls[0];
    expect(path).toBe('/users/me/photo');
    expect(options.method).toBe('POST');
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get('photo')).toBe(file);
  });

  it('putProfilePassword memanggil PUT /users/me/password', async () => {
    await putProfilePassword({ password: 'lama123', newPassword: 'baru456' });

    expect(fetchApi).toHaveBeenCalledWith('/users/me/password', {
      method: 'PUT',
      body: {
        password: 'lama123',
        new_password: 'baru456',
        new_password_confirmation: 'baru456',
      },
    });
  });
});
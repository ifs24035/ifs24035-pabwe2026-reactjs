import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchApi } from '../../../helpers/apiHelper';
import { postLogin, postRegister } from './authApi';

vi.mock('../../../helpers/apiHelper', () => ({ fetchApi: vi.fn() }));

describe('authApi', () => {
  beforeEach(() => {
    fetchApi.mockReset();
    fetchApi.mockResolvedValue({ success: true });
  });

  it('postLogin memanggil POST /auth/login tanpa token', async () => {
    const result = await postLogin({ email: 'a@b.com', password: 'secret1' });

    expect(fetchApi).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'a@b.com', password: 'secret1' },
      auth: false,
    });
    expect(result).toEqual({ success: true });
  });

  it('postRegister memanggil POST /auth/register tanpa token', async () => {
    const result = await postRegister({
      name: 'Budi',
      email: 'a@b.com',
      password: 'secret1',
    });

    expect(fetchApi).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: { name: 'Budi', email: 'a@b.com', password: 'secret1' },
      auth: false,
    });
    expect(result).toEqual({ success: true });
  });
});
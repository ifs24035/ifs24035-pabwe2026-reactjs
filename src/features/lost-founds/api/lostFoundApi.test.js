import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchApi } from '../../../helpers/apiHelper';
import {
  deleteLostFound,
  getLostFound,
  getLostFounds,
  getLostFoundStatsDaily,
  getLostFoundStatsMonthly,
  postLostFound,
  postLostFoundCover,
  putLostFound,
} from './lostFoundApi';

vi.mock('../../../helpers/apiHelper', () => ({ fetchApi: vi.fn() }));

describe('lostFoundApi', () => {
  beforeEach(() => {
    fetchApi.mockReset();
    fetchApi.mockResolvedValue({ success: true });
  });

  it('getLostFounds memanggil GET /lost-founds dengan parameter filter', async () => {
    const params = { status: 'lost', is_completed: 0, is_me: 1 };

    const result = await getLostFounds(params);

    expect(fetchApi).toHaveBeenCalledWith('/lost-founds', { params });
    expect(result).toEqual({ success: true });
  });

  it('getLostFound memanggil GET /lost-founds/:id', async () => {
    await getLostFound(7);

    expect(fetchApi).toHaveBeenCalledWith('/lost-founds/7');
  });

  it('postLostFound memanggil POST /lost-founds', async () => {
    await postLostFound({ title: 'Dompet', description: 'Cokelat', status: 'lost' });

    expect(fetchApi).toHaveBeenCalledWith('/lost-founds', {
      method: 'POST',
      body: { title: 'Dompet', description: 'Cokelat', status: 'lost' },
    });
  });

  it('putLostFound mengubah is_completed true menjadi 1', async () => {
    await putLostFound(7, {
      title: 'Dompet',
      description: 'Cokelat',
      status: 'found',
      isCompleted: true,
    });

    expect(fetchApi).toHaveBeenCalledWith('/lost-founds/7', {
      method: 'PUT',
      body: {
        title: 'Dompet',
        description: 'Cokelat',
        status: 'found',
        is_completed: 1,
      },
    });
  });

  it('putLostFound mengubah is_completed false menjadi 0', async () => {
    await putLostFound(7, {
      title: 'Dompet',
      description: 'Cokelat',
      status: 'lost',
      isCompleted: false,
    });

    expect(fetchApi.mock.calls[0][1].body.is_completed).toBe(0);
  });

  it('postLostFoundCover mengirim FormData berisi berkas cover', async () => {
    const file = new File(['isi'], 'cover.png', { type: 'image/png' });

    await postLostFoundCover(7, file);

    const [path, options] = fetchApi.mock.calls[0];
    expect(path).toBe('/lost-founds/7/cover');
    expect(options.method).toBe('POST');
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get('cover')).toBe(file);
  });

  it('deleteLostFound memanggil DELETE /lost-founds/:id', async () => {
    await deleteLostFound(7);

    expect(fetchApi).toHaveBeenCalledWith('/lost-founds/7', { method: 'DELETE' });
  });

  it('getLostFoundStatsDaily memanggil GET /lost-founds/stats/daily', async () => {
    const params = { end_date: '2026-10-04 12:00:00', total_data: 7 };

    await getLostFoundStatsDaily(params);

    expect(fetchApi).toHaveBeenCalledWith('/lost-founds/stats/daily', { params });
  });

  it('getLostFoundStatsMonthly memanggil GET /lost-founds/stats/monthly', async () => {
    const params = { end_date: '2026-10-04 12:00:00', total_data: 6 };

    await getLostFoundStatsMonthly(params);

    expect(fetchApi).toHaveBeenCalledWith('/lost-founds/stats/monthly', {
      params,
    });
  });
});
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper';
import {
  deleteLostFound,
  getLostFound,
  getLostFounds,
  getLostFoundStatsDaily,
  getLostFoundStatsMonthly,
  postLostFound,
  postLostFoundCover,
  putLostFound,
} from '../api/lostFoundApi';
import {
  ActionType,
  asyncGetLostFound,
  asyncGetLostFounds,
  asyncGetLostFoundStats,
  asyncSetLostFoundAdd,
  asyncSetLostFoundChange,
  asyncSetLostFoundChangeCover,
  asyncSetLostFoundDelete,
  buildStatsSeries,
  setIsLostFoundActionCreator,
  setIsLostFoundAddActionCreator,
  setIsLostFoundAddedActionCreator,
  setIsLostFoundChangeActionCreator,
  setIsLostFoundChangeCoverActionCreator,
  setIsLostFoundChangedActionCreator,
  setIsLostFoundChangedCoverActionCreator,
  setIsLostFoundDeleteActionCreator,
  setIsLostFoundDeletedActionCreator,
  setLostFoundActionCreator,
  setLostFoundsActionCreator,
  setLostFoundStatsActionCreator,
} from './action';

vi.mock('../api/lostFoundApi', () => ({
  getLostFounds: vi.fn(),
  getLostFound: vi.fn(),
  postLostFound: vi.fn(),
  putLostFound: vi.fn(),
  postLostFoundCover: vi.fn(),
  deleteLostFound: vi.fn(),
  getLostFoundStatsDaily: vi.fn(),
  getLostFoundStatsMonthly: vi.fn(),
}));
vi.mock('../../../helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe('lost-found action creators', () => {
  it('membuat action data dengan payload yang benar', () => {
    expect(setLostFoundsActionCreator([{ id: 1 }])).toEqual({
      type: ActionType.SET_LOST_FOUNDS,
      payload: { lostFounds: [{ id: 1 }] },
    });
    expect(setLostFoundActionCreator({ id: 1 })).toEqual({
      type: ActionType.SET_LOST_FOUND,
      payload: { lostFound: { id: 1 } },
    });
    expect(setLostFoundStatsActionCreator({ total: 1 })).toEqual({
      type: ActionType.SET_LOST_FOUND_STATS,
      payload: { stats: { total: 1 } },
    });
  });

  it.each([
    [setIsLostFoundActionCreator, ActionType.SET_IS_LOST_FOUND],
    [setIsLostFoundAddActionCreator, ActionType.SET_IS_LOST_FOUND_ADD],
    [setIsLostFoundAddedActionCreator, ActionType.SET_IS_LOST_FOUND_ADDED],
    [setIsLostFoundChangeActionCreator, ActionType.SET_IS_LOST_FOUND_CHANGE],
    [setIsLostFoundChangedActionCreator, ActionType.SET_IS_LOST_FOUND_CHANGED],
    [
      setIsLostFoundChangeCoverActionCreator,
      ActionType.SET_IS_LOST_FOUND_CHANGE_COVER,
    ],
    [
      setIsLostFoundChangedCoverActionCreator,
      ActionType.SET_IS_LOST_FOUND_CHANGED_COVER,
    ],
    [setIsLostFoundDeleteActionCreator, ActionType.SET_IS_LOST_FOUND_DELETE],
    [setIsLostFoundDeletedActionCreator, ActionType.SET_IS_LOST_FOUND_DELETED],
  ])('membuat action status dengan type yang benar', (creator, type) => {
    expect(creator(true)).toEqual({ type, payload: { status: true } });
  });
});

describe('lost-found async thunks', () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('asyncGetLostFounds', () => {
    it('menyimpan daftar laporan saat berhasil', async () => {
      getLostFounds.mockResolvedValue({
        success: true,
        data: { lost_founds: [{ id: 1 }] },
      });

      const result = await asyncGetLostFounds({ status: 'lost' })(dispatch);

      expect(getLostFounds).toHaveBeenCalledWith({ status: 'lost' });
      expect(dispatch).toHaveBeenCalledWith(setLostFoundsActionCreator([{ id: 1 }]));
      expect(result).toBe(true);
    });

    it('menampilkan dialog error saat gagal', async () => {
      getLostFounds.mockResolvedValue({ success: false, message: 'Gagal memuat' });

      const result = await asyncGetLostFounds()(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith('Gagal memuat');
      expect(dispatch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('asyncGetLostFound', () => {
    it('menyimpan detail laporan saat berhasil', async () => {
      getLostFound.mockResolvedValue({
        success: true,
        data: { lost_found: { id: 5 } },
      });

      const result = await asyncGetLostFound(5)(dispatch);

      expect(getLostFound).toHaveBeenCalledWith(5);
      expect(dispatch).toHaveBeenCalledWith(setLostFoundActionCreator({ id: 5 }));
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundActionCreator(true));
      expect(result).toBe(true);
    });

    it('mengosongkan detail dan menampilkan dialog error saat gagal', async () => {
      getLostFound.mockResolvedValue({ success: false, message: 'Tidak ditemukan' });

      const result = await asyncGetLostFound(5)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setLostFoundActionCreator(null));
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundActionCreator(false));
      expect(showErrorDialog).toHaveBeenCalledWith('Tidak ditemukan');
      expect(result).toBe(false);
    });
  });

  describe('asyncSetLostFoundAdd', () => {
    it('menandai proses, lalu berhasil dan menampilkan dialog sukses', async () => {
      postLostFound.mockResolvedValue({ success: true, message: 'Ditambahkan' });
      const payload = { title: 'A', description: 'B', status: 'lost' };

      const result = await asyncSetLostFoundAdd(payload)(dispatch);

      expect(postLostFound).toHaveBeenCalledWith(payload);
      expect(dispatch.mock.calls.map(([action]) => action)).toEqual([
        setIsLostFoundAddActionCreator(true),
        setIsLostFoundAddActionCreator(false),
        setIsLostFoundAddedActionCreator(true),
      ]);
      expect(showSuccessDialog).toHaveBeenCalledWith('Ditambahkan');
      expect(result).toBe(true);
    });

    it('menampilkan dialog error saat gagal tanpa menandai berhasil', async () => {
      postLostFound.mockResolvedValue({ success: false, message: 'Data tidak valid' });

      const result = await asyncSetLostFoundAdd({})(dispatch);

      expect(dispatch.mock.calls.map(([action]) => action)).toEqual([
        setIsLostFoundAddActionCreator(true),
        setIsLostFoundAddActionCreator(false),
      ]);
      expect(showErrorDialog).toHaveBeenCalledWith('Data tidak valid');
      expect(result).toBe(false);
    });
  });

  describe('asyncSetLostFoundChange', () => {
    it('berhasil mengubah data laporan', async () => {
      putLostFound.mockResolvedValue({ success: true, message: 'Diubah' });
      const payload = { title: 'A', description: 'B', status: 'found', isCompleted: true };

      const result = await asyncSetLostFoundChange(3, payload)(dispatch);

      expect(putLostFound).toHaveBeenCalledWith(3, payload);
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundChangedActionCreator(true));
      expect(showSuccessDialog).toHaveBeenCalledWith('Diubah');
      expect(result).toBe(true);
    });

    it('gagal mengubah data laporan', async () => {
      putLostFound.mockResolvedValue({ success: false, message: 'Gagal ubah' });

      const result = await asyncSetLostFoundChange(3, {})(dispatch);

      expect(dispatch).not.toHaveBeenCalledWith(setIsLostFoundChangedActionCreator(true));
      expect(showErrorDialog).toHaveBeenCalledWith('Gagal ubah');
      expect(result).toBe(false);
    });
  });

  describe('asyncSetLostFoundChangeCover', () => {
    const file = new File(['isi'], 'cover.png', { type: 'image/png' });

    it('berhasil mengunggah cover', async () => {
      postLostFoundCover.mockResolvedValue({ success: true, message: 'Cover diubah' });

      const result = await asyncSetLostFoundChangeCover(3, file)(dispatch);

      expect(postLostFoundCover).toHaveBeenCalledWith(3, file);
      expect(dispatch).toHaveBeenCalledWith(
        setIsLostFoundChangedCoverActionCreator(true),
      );
      expect(showSuccessDialog).toHaveBeenCalledWith('Cover diubah');
      expect(result).toBe(true);
    });

    it('gagal mengunggah cover', async () => {
      postLostFoundCover.mockResolvedValue({ success: false, message: 'Gagal cover' });

      const result = await asyncSetLostFoundChangeCover(3, file)(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith('Gagal cover');
      expect(result).toBe(false);
    });
  });

  describe('asyncSetLostFoundDelete', () => {
    it('berhasil menghapus laporan', async () => {
      deleteLostFound.mockResolvedValue({ success: true, message: 'Dihapus' });

      const result = await asyncSetLostFoundDelete(3)(dispatch);

      expect(deleteLostFound).toHaveBeenCalledWith(3);
      expect(dispatch).toHaveBeenCalledWith(setIsLostFoundDeletedActionCreator(true));
      expect(showSuccessDialog).toHaveBeenCalledWith('Dihapus');
      expect(result).toBe(true);
    });

    it('gagal menghapus laporan', async () => {
      deleteLostFound.mockResolvedValue({ success: false, message: 'Gagal hapus' });

      const result = await asyncSetLostFoundDelete(3)(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith('Gagal hapus');
      expect(result).toBe(false);
    });
  });
});

describe('buildStatsSeries', () => {
  const END_DATE = new Date(2026, 9, 4, 12, 0, 0);

  const ITEMS = [
    { status: 'lost', is_completed: 0, created_at: '2026-10-04T08:00:00' },
    { status: 'found', is_completed: 1, created_at: '2026-10-04T09:00:00' },
    { status: 'lost', is_completed: 1, created_at: '2026-10-03T09:00:00' },
    { status: 'found', is_completed: 0, created_at: '2026-09-28T09:00:00' },
    { status: 'lost', is_completed: 0, created_at: '2026-01-01T09:00:00' },
  ];

  it('mengelompokkan laporan per hari selama 7 hari terakhir', () => {
    const result = buildStatsSeries(ITEMS, 'daily', 7, END_DATE);

    expect(Object.keys(result.stats_losts)).toEqual([
      '28-09-2026',
      '29-09-2026',
      '30-09-2026',
      '01-10-2026',
      '02-10-2026',
      '03-10-2026',
      '04-10-2026',
    ]);
    expect(result.stats_losts['04-10-2026']).toBe(1);
    expect(result.stats_losts_process['04-10-2026']).toBe(1);
    expect(result.stats_losts_completed['04-10-2026']).toBe(0);
    expect(result.stats_losts['03-10-2026']).toBe(1);
    expect(result.stats_losts_completed['03-10-2026']).toBe(1);
    expect(result.stats_founds['04-10-2026']).toBe(1);
    expect(result.stats_founds_completed['04-10-2026']).toBe(1);
    expect(result.stats_founds['28-09-2026']).toBe(1);
    expect(result.stats_founds_process['28-09-2026']).toBe(1);
  });

  it('mengabaikan laporan di luar rentang waktu', () => {
    const result = buildStatsSeries(ITEMS, 'daily', 7, END_DATE);
    const totalLosts = Object.values(result.stats_losts).reduce((a, b) => a + b, 0);

    expect(totalLosts).toBe(2);
  });

  it('mengelompokkan laporan per bulan selama 6 bulan terakhir', () => {
    const result = buildStatsSeries(ITEMS, 'monthly', 6, END_DATE);

    expect(Object.keys(result.stats_losts)).toEqual([
      '05-2026',
      '06-2026',
      '07-2026',
      '08-2026',
      '09-2026',
      '10-2026',
    ]);
    expect(result.stats_losts['10-2026']).toBe(2);
    expect(result.stats_founds['10-2026']).toBe(1);
    expect(result.stats_founds['09-2026']).toBe(1);
  });

  it('menghasilkan semua nilai 0 jika tidak ada laporan', () => {
    const result = buildStatsSeries([], 'daily', 3, END_DATE);

    expect(result.stats_losts).toEqual({
      '02-10-2026': 0,
      '03-10-2026': 0,
      '04-10-2026': 0,
    });
  });
});

describe('asyncGetLostFoundStats', () => {
  const dispatch = vi.fn();

  const ITEMS = [
    { status: 'lost', is_completed: 0, created_at: '2026-10-04T08:00:00' },
    { status: 'found', is_completed: 1, created_at: '2026-10-03T08:00:00' },
    { status: 'lost', is_completed: 1, created_at: '2026-10-02T08:00:00' },
  ];
  const MINE = [ITEMS[0]];
  const DAILY = { stats_losts: { '04-10-2026': 1 } };
  const MONTHLY = { stats_losts: { '10-2026': 1 } };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 4, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('menyusun ringkasan dan data grafik saat semua permintaan berhasil', async () => {
    getLostFounds.mockImplementation(async (params) => ({
      success: true,
      data: { lost_founds: params ? MINE : ITEMS },
    }));
    getLostFoundStatsDaily.mockResolvedValue({ success: true, data: DAILY });
    getLostFoundStatsMonthly.mockResolvedValue({ success: true, data: MONTHLY });

    const result = await asyncGetLostFoundStats()(dispatch);

    expect(getLostFounds).toHaveBeenCalledWith();
    expect(getLostFounds).toHaveBeenCalledWith({ is_me: 1 });
    expect(getLostFoundStatsDaily).toHaveBeenCalledWith({
      end_date: '2026-10-04 12:00:00',
      total_data: 7,
    });
    expect(getLostFoundStatsMonthly).toHaveBeenCalledWith({
      end_date: '2026-10-04 12:00:00',
      total_data: 6,
    });

    const [action] = dispatch.mock.calls[0];
    expect(action.type).toBe(ActionType.SET_LOST_FOUND_STATS);
    expect(action.payload.stats.summary).toEqual({
      all: { total: 3, lost: 2, found: 1, completed: 2 },
      mine: { total: 1, lost: 1, found: 0, completed: 0 },
    });
    expect(action.payload.stats.charts.mine).toEqual({
      daily: DAILY,
      monthly: MONTHLY,
    });
    expect(action.payload.stats.charts.all.daily.stats_losts['04-10-2026']).toBe(1);
    expect(action.payload.stats.charts.all.monthly.stats_losts['10-2026']).toBe(2);
    expect(result).toBe(true);
  });

  it('memakai nilai kosong jika data milik saya dan statistik API gagal', async () => {
    getLostFounds.mockImplementation(async (params) =>
      params
        ? { success: false, message: 'Gagal' }
        : { success: true, data: { lost_founds: ITEMS } },
    );
    getLostFoundStatsDaily.mockResolvedValue({ success: false });
    getLostFoundStatsMonthly.mockResolvedValue({ success: false });

    const result = await asyncGetLostFoundStats()(dispatch);

    const [action] = dispatch.mock.calls[0];
    expect(action.payload.stats.summary.mine).toEqual({
      total: 0,
      lost: 0,
      found: 0,
      completed: 0,
    });
    expect(action.payload.stats.charts.mine).toEqual({
      daily: null,
      monthly: null,
    });
    expect(result).toBe(true);
  });

  it('menampilkan dialog error jika daftar laporan gagal dimuat', async () => {
    getLostFounds.mockResolvedValue({ success: false, message: 'Gagal memuat' });
    getLostFoundStatsDaily.mockResolvedValue({ success: true, data: DAILY });
    getLostFoundStatsMonthly.mockResolvedValue({ success: true, data: MONTHLY });

    const result = await asyncGetLostFoundStats()(dispatch);

    expect(showErrorDialog).toHaveBeenCalledWith('Gagal memuat');
    expect(dispatch).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
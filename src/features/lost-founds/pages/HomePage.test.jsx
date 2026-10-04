import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { showConfirmDialog, showErrorDialog } from '../../../helpers/toolsHelper';
import { renderWithProviders } from '../../../test-utils';
import {
  deleteLostFound,
  getLostFounds,
  getLostFoundStatsDaily,
  getLostFoundStatsMonthly,
  postLostFound,
  postLostFoundCover,
  putLostFound,
} from '../api/lostFoundApi';
import HomePage from './HomePage';

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
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const AUTHOR = { name: 'Budi Santoso', photo: null };

const ITEMS = [
  {
    id: 1,
    user_id: 1,
    title: 'Dompet cokelat',
    description: 'Hilang di kantin',
    status: 'lost',
    is_completed: 0,
    cover: null,
    created_at: '2026-10-04T08:00:00',
    author: AUTHOR,
  },
  {
    id: 2,
    user_id: 2,
    title: 'Kunci motor',
    description: 'Ditemukan di parkiran',
    status: 'found',
    is_completed: 1,
    cover: 'img/lost-founds/cover/2.png',
    created_at: '2026-10-03T08:00:00',
    author: { name: 'Siti Aminah', photo: null },
  },
  {
    id: 3,
    user_id: 1,
    title: 'Payung biru',
    description: 'Tertinggal di kelas',
    status: 'lost',
    is_completed: 1,
    cover: null,
    created_at: '2026-10-02T08:00:00',
    author: AUTHOR,
  },
];

const DAILY_KEYS = [
  '28-09-2026',
  '29-09-2026',
  '30-09-2026',
  '01-10-2026',
  '02-10-2026',
  '03-10-2026',
  '04-10-2026',
];
const MONTHLY_KEYS = ['05-2026', '06-2026', '07-2026', '08-2026', '09-2026', '10-2026'];

const buildSeries = (keys, lostLast) => {
  const zero = () => Object.fromEntries(keys.map((key) => [key, 0]));
  const lost = { ...zero(), [keys.at(-1)]: lostLast };

  return {
    stats_losts: lost,
    stats_losts_completed: zero(),
    stats_losts_process: lost,
    stats_founds: zero(),
    stats_founds_completed: zero(),
    stats_founds_process: zero(),
  };
};

const mockLists = () =>
  getLostFounds.mockImplementation(async (params = {}) => {
    const { status, is_completed: completed, is_me: isMe } = params;
    let items = ITEMS;

    if (status) items = items.filter((item) => item.status === status);
    if (completed !== undefined && completed !== '') {
      items = items.filter((item) => String(item.is_completed) === String(completed));
    }
    if (isMe === 1) items = items.filter((item) => item.user_id === 1);

    return { success: true, data: { lost_founds: items } };
  });

const renderPage = (route = '/') =>
  renderWithProviders(<HomePage />, {
    route,
    preloadedState: { profile: { id: 1, name: 'Budi Santoso' }, isProfile: true },
  });

const metricValue = (container, label) =>
  within(container.querySelector('section')).getByText(label).parentElement;

const waitForLoaded = async (container) => {
  await screen.findByText('Dompet cokelat');
  await waitFor(() =>
    expect(metricValue(container, 'Total Laporan')).toHaveTextContent('3'),
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 4, 12, 0, 0));
    Element.prototype.scrollIntoView = vi.fn();
    window.scrollTo = vi.fn();
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
    mockLists();
    getLostFoundStatsDaily.mockResolvedValue({
      success: true,
      data: buildSeries(DAILY_KEYS, 3),
    });
    getLostFoundStatsMonthly.mockResolvedValue({
      success: true,
      data: buildSeries(MONTHLY_KEYS, 3),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('pemuatan data', () => {
    it('menampilkan skeleton saat memuat lalu daftar laporan dan metrik', async () => {
      let resolveList;
      getLostFounds.mockReturnValue(
        new Promise((resolve) => {
          resolveList = resolve;
        }),
      );
      const { container } = renderPage();

      expect(screen.getByTestId('lost-founds-skeleton')).toBeInTheDocument();

      resolveList({ success: true, data: { lost_founds: ITEMS } });
      await waitForLoaded(container);

      expect(screen.queryByTestId('lost-founds-skeleton')).not.toBeInTheDocument();
      expect(screen.getByText('Menampilkan 3 laporan')).toBeInTheDocument();
      expect(metricValue(container, 'Barang Hilang')).toHaveTextContent('2');
      expect(metricValue(container, 'Barang Ditemukan')).toHaveTextContent('1');
      expect(metricValue(container, 'Selesai')).toHaveTextContent('2');
    });

    it('menampilkan dialog error dan tampilan kosong jika daftar gagal dimuat', async () => {
      getLostFounds.mockResolvedValue({ success: false, message: 'Gagal memuat' });
      renderPage();

      expect(await screen.findByText('Tidak ada laporan ditemukan')).toBeInTheDocument();
      expect(showErrorDialog).toHaveBeenCalledWith('Gagal memuat');
    });
  });

  describe('kartu laporan', () => {
    it('menampilkan data setiap laporan', async () => {
      const { container } = renderPage();
      await waitForLoaded(container);

      expect(screen.getByText('Hilang di kantin')).toBeInTheDocument();
      expect(screen.getByAltText('Kunci motor')).toHaveAttribute(
        'src',
        'https://open-api.delcom.org/img/lost-founds/cover/2.png',
      );
      expect(screen.getAllByRole('link', { name: 'Lihat Detail' })).toHaveLength(3);
      expect(screen.getAllByRole('link', { name: 'Dompet cokelat' })[0]).toHaveAttribute(
        'href',
        '/lost-founds/1',
      );
      expect(screen.getByText('Siti Aminah')).toBeInTheDocument();
    });

    it('hanya menampilkan tombol aksi pada laporan milik sendiri', async () => {
      const { container } = renderPage();
      await waitForLoaded(container);

      expect(screen.getByRole('button', { name: 'Ubah Dompet cokelat' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Ubah cover Payung biru' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Hapus Dompet cokelat' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Ubah Kunci motor' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Hapus Kunci motor' })).not.toBeInTheDocument();
    });
  });

  describe('filter dan pencarian', () => {
    it('memfilter berdasarkan jenis laporan', async () => {
      const user = userEvent.setup();
      const { container } = renderPage();
      await waitForLoaded(container);

      await user.click(screen.getByRole('button', { name: 'Hilang' }));
      await waitFor(() =>
        expect(getLostFounds).toHaveBeenLastCalledWith({
          status: 'lost',
          is_completed: '',
          is_me: '',
        }),
      );
      await waitFor(() =>
        expect(screen.queryByText('Kunci motor')).not.toBeInTheDocument(),
      );

      await user.click(screen.getByRole('button', { name: 'Ditemukan' }));
      await waitFor(() =>
        expect(getLostFounds).toHaveBeenLastCalledWith({
          status: 'found',
          is_completed: '',
          is_me: '',
        }),
      );
      expect(await screen.findByText('Kunci motor')).toBeInTheDocument();
      expect(screen.queryByText('Dompet cokelat')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Semua' }));
      expect(await screen.findByText('Dompet cokelat')).toBeInTheDocument();
    });

    it('memfilter berdasarkan status penyelesaian', async () => {
      const user = userEvent.setup();
      const { container } = renderPage();
      await waitForLoaded(container);

      await user.selectOptions(
        screen.getByLabelText('Filter status penyelesaian'),
        '1',
      );

      await waitFor(() =>
        expect(getLostFounds).toHaveBeenLastCalledWith({
          status: '',
          is_completed: '1',
          is_me: '',
        }),
      );
      await waitFor(() =>
        expect(screen.queryByText('Dompet cokelat')).not.toBeInTheDocument(),
      );
      expect(screen.getByText('Kunci motor')).toBeInTheDocument();
    });

    it('memfilter laporan milik saya', async () => {
      const user = userEvent.setup();
      const { container } = renderPage();
      await waitForLoaded(container);

      const [, mineFilter] = screen.getAllByRole('button', { name: 'Laporan saya' });
      await user.click(mineFilter);

      await waitFor(() =>
        expect(getLostFounds).toHaveBeenLastCalledWith({
          status: '',
          is_completed: '',
          is_me: 1,
        }),
      );
      await waitFor(() =>
        expect(screen.queryByText('Kunci motor')).not.toBeInTheDocument(),
      );
      expect(mineFilter).toHaveAttribute('aria-pressed', 'true');
    });

    it('mencari berdasarkan judul dan deskripsi', async () => {
      const user = userEvent.setup();
      const { container } = renderPage();
      await waitForLoaded(container);
      const search = screen.getByLabelText('Cari laporan');

      await user.type(search, 'kunci');
      expect(screen.getByText('Kunci motor')).toBeInTheDocument();
      expect(screen.queryByText('Dompet cokelat')).not.toBeInTheDocument();
      expect(screen.getByText('Menampilkan 1 laporan')).toBeInTheDocument();

      await user.clear(search);
      await user.type(search, 'kantin');
      expect(screen.getByText('Dompet cokelat')).toBeInTheDocument();
      expect(screen.queryByText('Kunci motor')).not.toBeInTheDocument();
    });

    it('menampilkan pesan jika pencarian tidak menemukan hasil', async () => {
      const user = userEvent.setup();
      const { container } = renderPage();
      await waitForLoaded(container);

      await user.type(screen.getByLabelText('Cari laporan'), 'zzz');

      expect(screen.getByText('Tidak ada laporan ditemukan')).toBeInTheDocument();
    });
  });

  describe('statistik', () => {
    it('menampilkan grafik harian untuk semua laporan', async () => {
      const { container } = renderPage();
      await waitForLoaded(container);

      expect(await screen.findByTitle('04/10: 1 hilang, 0 ditemukan')).toBeInTheDocument();
      expect(screen.getByTitle('03/10: 0 hilang, 1 ditemukan')).toBeInTheDocument();
      expect(screen.getByTitle('02/10: 1 hilang, 0 ditemukan')).toBeInTheDocument();
      expect(screen.getByText('7 hari terakhir · Semua laporan')).toBeInTheDocument();
      expect(
        screen.getByText(/dari semua pengguna pada periode ini/),
      ).toBeInTheDocument();
    });

    it('beralih ke grafik bulanan', async () => {
      const user = userEvent.setup();
      const { container } = renderPage();
      await waitForLoaded(container);
      await screen.findByTitle('04/10: 1 hilang, 0 ditemukan');

      await user.click(screen.getByRole('button', { name: 'Bulanan' }));

      expect(screen.getByTitle('10/2026: 2 hilang, 1 ditemukan')).toBeInTheDocument();
      expect(screen.getByText('6 bulan terakhir · Semua laporan')).toBeInTheDocument();
    });

    it('beralih ke laporan saya: metrik dan grafik memakai data milik sendiri', async () => {
      const user = userEvent.setup();
      const { container } = renderPage();
      await waitForLoaded(container);
      await screen.findByTitle('04/10: 1 hilang, 0 ditemukan');

      const [mineScope] = screen.getAllByRole('button', { name: 'Laporan saya' });
      await user.click(mineScope);

      expect(metricValue(container, 'Total Laporan')).toHaveTextContent('2');
      expect(metricValue(container, 'Barang Hilang')).toHaveTextContent('2');
      expect(metricValue(container, 'Barang Ditemukan')).toHaveTextContent('0');
      expect(metricValue(container, 'Selesai')).toHaveTextContent('1');
      expect(screen.getByTitle('04/10: 3 hilang, 0 ditemukan')).toBeInTheDocument();
      expect(screen.getByText('7 hari terakhir · Laporan saya')).toBeInTheDocument();
      expect(
        screen.getByText(/yang kamu buat sendiri pada periode ini/),
      ).toBeInTheDocument();
    });

    it('menampilkan pesan jika data statistik milik saya tidak tersedia', async () => {
      const user = userEvent.setup();
      getLostFoundStatsDaily.mockResolvedValue({ success: false });
      const { container } = renderPage();
      await waitForLoaded(container);

      const [mineScope] = screen.getAllByRole('button', { name: 'Laporan saya' });
      await user.click(mineScope);

      expect(screen.getByText('Data statistik belum tersedia.')).toBeInTheDocument();
    });

    it('menampilkan pesan jika belum ada laporan pada periode grafik', async () => {
      getLostFounds.mockResolvedValue({ success: true, data: { lost_founds: [] } });
      renderPage();

      expect(
        await screen.findByText('Belum ada laporan baru pada periode ini.'),
      ).toBeInTheDocument();
    });

    it('menggulir ke bagian statistik saat hash #statistik', async () => {
      const { container } = renderPage('/#statistik');
      await waitForLoaded(container);

      expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
      expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it('menggulir ke atas saat tanpa hash', async () => {
      const { container } = renderPage('/');
      await waitForLoaded(container);

      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
      expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    });
  });

  describe('aksi laporan', () => {
    const fetchCount = () => getLostFounds.mock.calls.length;

    it('membuat laporan baru, lalu menyegarkan data', async () => {
      const user = userEvent.setup();
      postLostFound.mockResolvedValue({ success: true, message: 'Ditambahkan' });
      const { container } = renderPage();
      await waitForLoaded(container);
      const before = fetchCount();

      await user.click(screen.getByRole('button', { name: 'Buat Laporan' }));
      expect(screen.getByRole('dialog', { name: 'Buat Laporan Baru' })).toBeInTheDocument();

      await user.type(screen.getByLabelText('Judul'), 'Tas hitam');
      await user.type(screen.getByLabelText('Deskripsi'), 'Tertinggal di perpustakaan');
      await user.click(screen.getByRole('button', { name: 'Simpan Laporan' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(postLostFound).toHaveBeenCalled();
      await waitFor(() => expect(fetchCount()).toBeGreaterThan(before));
    });

    it('menutup modal tambah saat dibatalkan', async () => {
      const user = userEvent.setup();
      const { container } = renderPage();
      await waitForLoaded(container);

      await user.click(screen.getByRole('button', { name: 'Buat Laporan' }));
      await user.click(screen.getByRole('button', { name: 'Batal' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('mengubah laporan, lalu menyegarkan data', async () => {
      const user = userEvent.setup();
      putLostFound.mockResolvedValue({ success: true, message: 'Diubah' });
      const { container } = renderPage();
      await waitForLoaded(container);
      const before = fetchCount();

      await user.click(screen.getByRole('button', { name: 'Ubah Dompet cokelat' }));
      expect(screen.getByLabelText('Judul')).toHaveValue('Dompet cokelat');
      await user.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(putLostFound).toHaveBeenCalled();
      await waitFor(() => expect(fetchCount()).toBeGreaterThan(before));
    });

    it('menutup modal ubah saat dibatalkan', async () => {
      const user = userEvent.setup();
      const { container } = renderPage();
      await waitForLoaded(container);

      await user.click(screen.getByRole('button', { name: 'Ubah Dompet cokelat' }));
      await user.click(screen.getByRole('button', { name: 'Batal' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('mengubah cover laporan, lalu menyegarkan data', async () => {
      const user = userEvent.setup();
      postLostFoundCover.mockResolvedValue({ success: true, message: 'Cover diubah' });
      const { container } = renderPage();
      await waitForLoaded(container);
      const before = fetchCount();

      await user.click(screen.getByRole('button', { name: 'Ubah cover Dompet cokelat' }));
      expect(screen.getByRole('dialog', { name: 'Ubah Foto Cover' })).toBeInTheDocument();

      const file = new File(['x'], 'cover.png', { type: 'image/png' });
      await user.upload(screen.getByTestId('cover-input'), file);
      await user.click(screen.getByRole('button', { name: 'Unggah Cover' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(postLostFoundCover).toHaveBeenCalledWith(1, file);
      await waitFor(() => expect(fetchCount()).toBeGreaterThan(before));
    });

    it('menutup modal cover saat dibatalkan', async () => {
      const user = userEvent.setup();
      const { container } = renderPage();
      await waitForLoaded(container);

      await user.click(screen.getByRole('button', { name: 'Ubah cover Dompet cokelat' }));
      await user.click(screen.getByRole('button', { name: 'Batal' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('menghapus laporan setelah dikonfirmasi, lalu menyegarkan data', async () => {
      const user = userEvent.setup();
      showConfirmDialog.mockResolvedValue(true);
      deleteLostFound.mockResolvedValue({ success: true, message: 'Dihapus' });
      const { container } = renderPage();
      await waitForLoaded(container);
      const before = fetchCount();

      await user.click(screen.getByRole('button', { name: 'Hapus Dompet cokelat' }));

      await waitFor(() => expect(deleteLostFound).toHaveBeenCalledWith(1));
      expect(showConfirmDialog).toHaveBeenCalledWith(
        'Hapus laporan?',
        'Laporan "Dompet cokelat" akan dihapus secara permanen.',
        'Ya, hapus',
      );
      await waitFor(() => expect(fetchCount()).toBeGreaterThan(before));
    });

    it('tidak menghapus laporan jika dibatalkan', async () => {
      const user = userEvent.setup();
      showConfirmDialog.mockResolvedValue(false);
      const { container } = renderPage();
      await waitForLoaded(container);

      await user.click(screen.getByRole('button', { name: 'Hapus Dompet cokelat' }));

      await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
      expect(deleteLostFound).not.toHaveBeenCalled();
    });
  });
});
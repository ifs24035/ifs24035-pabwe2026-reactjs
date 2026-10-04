import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { showConfirmDialog, showErrorDialog } from '../../../helpers/toolsHelper';
import { renderWithProviders } from '../../../test-utils';
import {
  deleteLostFound,
  getLostFound,
  postLostFoundCover,
  putLostFound,
} from '../api/lostFoundApi';
import DetailPage from './DetailPage';

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

const ITEM = {
  id: 5,
  user_id: 1,
  title: 'Dompet cokelat',
  description: 'Hilang di kantin\nlantai dua',
  status: 'lost',
  is_completed: 0,
  cover: null,
  created_at: '2026-10-04T08:00:00.000000Z',
  updated_at: '2026-10-04T09:00:00.000000Z',
  author: { name: 'Budi Santoso', photo: null },
};

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/lost-founds/:id" element={<DetailPage />} />
      <Route path="/" element={<p>Halaman beranda</p>} />
    </Routes>,
    {
      route: '/lost-founds/5',
      preloadedState: { profile: { id: 1 }, isProfile: true },
    },
  );

const mockDetail = (overrides = {}) =>
  getLostFound.mockResolvedValue({
    success: true,
    data: { lost_found: { ...ITEM, ...overrides } },
  });

describe('DetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
    mockDetail();
  });

  it('menampilkan skeleton saat memuat lalu rincian laporan', async () => {
    let resolveDetail;
    getLostFound.mockReturnValue(
      new Promise((resolve) => {
        resolveDetail = resolve;
      }),
    );
    renderPage();

    expect(screen.getByTestId('detail-skeleton')).toBeInTheDocument();

    resolveDetail({ success: true, data: { lost_found: ITEM } });

    expect(
      await screen.findByRole('heading', { name: 'Dompet cokelat' }),
    ).toBeInTheDocument();
    expect(getLostFound).toHaveBeenCalledWith('5');
    expect(screen.queryByTestId('detail-skeleton')).not.toBeInTheDocument();
  });

  it('menampilkan rincian laporan milik sendiri lengkap dengan tombol aksi', async () => {
    renderPage();

    await screen.findByRole('heading', { name: 'Dompet cokelat' });

    expect(screen.getByText('Hilang')).toBeInTheDocument();
    expect(screen.getByText('Proses')).toBeInTheDocument();
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText(/Hilang di kantin/)).toBeInTheDocument();
    expect(screen.getByText('Belum ada foto bukti')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Kembali ke Dashboard/ })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('button', { name: /Ubah Cover/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ubah Data/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hapus/ })).toBeInTheDocument();
  });

  it('menampilkan foto cover, status ditemukan, dan selesai', async () => {
    mockDetail({
      status: 'found',
      is_completed: 1,
      cover: 'img/lost-founds/cover/5.png',
    });
    renderPage();

    const image = await screen.findByAltText('Dompet cokelat');

    expect(image).toHaveAttribute(
      'src',
      'https://open-api.delcom.org/img/lost-founds/cover/5.png',
    );
    expect(screen.getByText('Ditemukan')).toBeInTheDocument();
    expect(screen.getByText('Selesai')).toBeInTheDocument();
    expect(screen.queryByText('Belum ada foto bukti')).not.toBeInTheDocument();
  });

  it('menyembunyikan tombol aksi pada laporan milik orang lain', async () => {
    mockDetail({ user_id: 2 });
    renderPage();

    await screen.findByRole('heading', { name: 'Dompet cokelat' });

    expect(screen.queryByRole('button', { name: /Ubah Cover/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ubah Data/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Hapus/ })).not.toBeInTheDocument();
  });

  it('menampilkan tampilan tidak ditemukan jika laporan gagal dimuat', async () => {
    getLostFound.mockResolvedValue({ success: false, message: 'Data tidak ditemukan' });
    renderPage();

    expect(await screen.findByText('Laporan tidak ditemukan')).toBeInTheDocument();
    expect(showErrorDialog).toHaveBeenCalledWith('Data tidak ditemukan');
    expect(screen.getByRole('link', { name: /Kembali ke Dashboard/ })).toHaveAttribute(
      'href',
      '/',
    );
  });

  describe('ubah data', () => {
    it('membuka modal, menyimpan perubahan, lalu memuat ulang rincian', async () => {
      const user = userEvent.setup();
      putLostFound.mockResolvedValue({ success: true, message: 'Diubah' });
      renderPage();
      await screen.findByRole('heading', { name: 'Dompet cokelat' });

      mockDetail({ title: 'Dompet hitam' });
      await user.click(screen.getByRole('button', { name: /Ubah Data/ }));
      const dialog = screen.getByRole('dialog', { name: 'Ubah Laporan' });
      expect(dialog).toBeInTheDocument();

      await user.clear(screen.getByLabelText('Judul'));
      await user.type(screen.getByLabelText('Judul'), 'Dompet hitam');
      await user.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));

      expect(
        await screen.findByRole('heading', { name: 'Dompet hitam' }),
      ).toBeInTheDocument();
      expect(putLostFound).toHaveBeenCalled();
      expect(getLostFound).toHaveBeenCalledTimes(2);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('menutup modal saat dibatalkan', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByRole('heading', { name: 'Dompet cokelat' });

      await user.click(screen.getByRole('button', { name: /Ubah Data/ }));
      await user.click(screen.getByRole('button', { name: 'Batal' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('ubah cover', () => {
    it('membuka modal, mengunggah cover, lalu memuat ulang rincian', async () => {
      const user = userEvent.setup();
      postLostFoundCover.mockResolvedValue({ success: true, message: 'Cover diubah' });
      renderPage();
      await screen.findByRole('heading', { name: 'Dompet cokelat' });

      mockDetail({ cover: 'img/lost-founds/cover/5.png' });
      await user.click(screen.getByRole('button', { name: /Ubah Cover/ }));
      expect(screen.getByRole('dialog', { name: 'Ubah Foto Cover' })).toBeInTheDocument();

      const file = new File(['x'], 'cover.png', { type: 'image/png' });
      await user.upload(screen.getByTestId('cover-input'), file);
      await user.click(screen.getByRole('button', { name: 'Unggah Cover' }));

      expect(await screen.findByAltText('Dompet cokelat')).toBeInTheDocument();
      expect(postLostFoundCover).toHaveBeenCalledWith(5, file);
      expect(getLostFound).toHaveBeenCalledTimes(2);
    });

    it('menutup modal saat dibatalkan', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByRole('heading', { name: 'Dompet cokelat' });

      await user.click(screen.getByRole('button', { name: /Ubah Cover/ }));
      await user.click(screen.getByRole('button', { name: 'Batal' }));

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('hapus', () => {
    it('dikonfirmasi: laporan dihapus lalu kembali ke beranda', async () => {
      const user = userEvent.setup();
      showConfirmDialog.mockResolvedValue(true);
      deleteLostFound.mockResolvedValue({ success: true, message: 'Dihapus' });
      renderPage();
      await screen.findByRole('heading', { name: 'Dompet cokelat' });

      await user.click(screen.getByRole('button', { name: /Hapus/ }));

      expect(await screen.findByText('Halaman beranda')).toBeInTheDocument();
      expect(showConfirmDialog).toHaveBeenCalledWith(
        'Hapus laporan?',
        'Laporan "Dompet cokelat" akan dihapus secara permanen.',
        'Ya, hapus',
      );
      expect(deleteLostFound).toHaveBeenCalledWith(5);
    });

    it('dibatalkan: laporan tidak dihapus', async () => {
      const user = userEvent.setup();
      showConfirmDialog.mockResolvedValue(false);
      renderPage();
      await screen.findByRole('heading', { name: 'Dompet cokelat' });

      await user.click(screen.getByRole('button', { name: /Hapus/ }));

      await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
      expect(deleteLostFound).not.toHaveBeenCalled();
      expect(screen.getByRole('heading', { name: 'Dompet cokelat' })).toBeInTheDocument();
    });
  });
});
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test-utils';
import { putLostFound } from '../api/lostFoundApi';
import ChangeModal from './ChangeModal';

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

const LOST_FOUND = {
  id: 7,
  title: 'Dompet cokelat',
  description: 'Hilang di kantin',
  status: 'lost',
  is_completed: 0,
};

const renderModal = (lostFound = LOST_FOUND) => {
  const onClose = vi.fn();

  return {
    onClose,
    ...renderWithProviders(<ChangeModal lostFound={lostFound} onClose={onClose} />),
  };
};

const submit = (user) =>
  user.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));

describe('ChangeModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('menampilkan data laporan pada formulir', () => {
    renderModal();

    expect(screen.getByRole('dialog', { name: 'Ubah Laporan' })).toBeInTheDocument();
    expect(screen.getByLabelText('Judul')).toHaveValue('Dompet cokelat');
    expect(screen.getByLabelText('Deskripsi')).toHaveValue('Hilang di kantin');
    expect(screen.getByRole('radio', { name: /Barang Hilang/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('switch', { name: 'Tandai sebagai selesai' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('menandai sakelar selesai aktif jika laporan sudah selesai', () => {
    renderModal({ ...LOST_FOUND, is_completed: 1 });

    expect(screen.getByRole('switch', { name: 'Tandai sebagai selesai' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('menampilkan pesan wajib diisi saat kolom dikosongkan', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.clear(screen.getByLabelText('Judul'));
    await user.clear(screen.getByLabelText('Deskripsi'));
    await submit(user);

    expect(screen.getByText('Judul wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Deskripsi wajib diisi')).toBeInTheDocument();
    expect(putLostFound).not.toHaveBeenCalled();
  });

  it('berhasil: mengirim perubahan lalu menutup modal', async () => {
    const user = userEvent.setup();
    putLostFound.mockResolvedValue({ success: true, message: 'Diubah' });
    const { onClose, store } = renderModal();

    await user.clear(screen.getByLabelText('Judul'));
    await user.type(screen.getByLabelText('Judul'), '  Dompet hitam ');
    await user.click(screen.getByRole('radio', { name: /Barang Ditemukan/ }));
    await user.click(screen.getByRole('switch', { name: 'Tandai sebagai selesai' }));
    await submit(user);

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(putLostFound).toHaveBeenCalledWith(7, {
      title: 'Dompet hitam',
      description: 'Hilang di kantin',
      status: 'found',
      isCompleted: true,
    });
    expect(store.getState().isLostFoundChanged).toBe(true);
  });

  it('gagal: modal tetap terbuka', async () => {
    const user = userEvent.setup();
    putLostFound.mockResolvedValue({ success: false, message: 'Gagal ubah' });
    const { onClose } = renderModal();

    await submit(user);

    await waitFor(() => expect(putLostFound).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
  });

  it('menonaktifkan tombol selama perubahan disimpan', async () => {
    const user = userEvent.setup();
    let resolveRequest;
    putLostFound.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    renderModal();

    await submit(user);

    expect(await screen.findByRole('button', { name: 'Menyimpan...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Batal' })).toBeDisabled();

    resolveRequest({ success: false, message: 'Gagal' });
    expect(await screen.findByRole('button', { name: 'Simpan Perubahan' })).toBeEnabled();
  });

  it('memanggil onClose saat tombol Batal diklik', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByRole('button', { name: 'Batal' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test-utils';
import { postLostFound } from '../api/lostFoundApi';
import AddModal from './AddModal';

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

const renderModal = (onClose = vi.fn()) => ({
  onClose,
  ...renderWithProviders(<AddModal onClose={onClose} />),
});

const fillForm = async (user, title, description) => {
  if (title) await user.type(screen.getByLabelText('Judul'), title);
  if (description) await user.type(screen.getByLabelText('Deskripsi'), description);
};

const submit = (user) =>
  user.click(screen.getByRole('button', { name: 'Simpan Laporan' }));

describe('AddModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('menampilkan formulir dengan jenis laporan "Barang Hilang" terpilih', () => {
    renderModal();

    expect(screen.getByRole('dialog', { name: 'Buat Laporan Baru' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Barang Hilang/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByLabelText('Judul')).toHaveValue('');
    expect(screen.getByLabelText('Deskripsi')).toHaveValue('');
  });

  it('menampilkan pesan wajib diisi saat formulir kosong', async () => {
    const user = userEvent.setup();
    renderModal();

    await submit(user);

    expect(screen.getByText('Judul wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Deskripsi wajib diisi')).toBeInTheDocument();
    expect(postLostFound).not.toHaveBeenCalled();
  });

  it('hanya menampilkan pesan untuk kolom yang belum diisi', async () => {
    const user = userEvent.setup();
    renderModal();

    await fillForm(user, 'Dompet', '');
    await submit(user);

    expect(screen.queryByText('Judul wajib diisi')).not.toBeInTheDocument();
    expect(screen.getByText('Deskripsi wajib diisi')).toBeInTheDocument();
  });

  it('berhasil: mengirim data lalu menutup modal', async () => {
    const user = userEvent.setup();
    postLostFound.mockResolvedValue({ success: true, message: 'Ditambahkan' });
    const { onClose, store } = renderModal();

    await user.click(screen.getByRole('radio', { name: /Barang Ditemukan/ }));
    await fillForm(user, '  Kunci motor ', ' Ditemukan di parkiran ');
    await submit(user);

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(postLostFound).toHaveBeenCalledWith({
      title: 'Kunci motor',
      description: 'Ditemukan di parkiran',
      status: 'found',
    });
    expect(store.getState().isLostFoundAdded).toBe(true);
  });

  it('gagal: modal tetap terbuka', async () => {
    const user = userEvent.setup();
    postLostFound.mockResolvedValue({ success: false, message: 'Data tidak valid' });
    const { onClose } = renderModal();

    await fillForm(user, 'Dompet', 'Cokelat');
    await submit(user);

    await waitFor(() => expect(postLostFound).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Buat Laporan Baru' })).toBeInTheDocument();
  });

  it('menonaktifkan tombol selama laporan disimpan', async () => {
    const user = userEvent.setup();
    let resolveRequest;
    postLostFound.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    renderModal();

    await fillForm(user, 'Dompet', 'Cokelat');
    await submit(user);

    expect(await screen.findByRole('button', { name: 'Menyimpan...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Batal' })).toBeDisabled();

    resolveRequest({ success: false, message: 'Gagal' });
    expect(await screen.findByRole('button', { name: 'Simpan Laporan' })).toBeEnabled();
  });

  it('memanggil onClose saat tombol Batal diklik', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByRole('button', { name: 'Batal' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
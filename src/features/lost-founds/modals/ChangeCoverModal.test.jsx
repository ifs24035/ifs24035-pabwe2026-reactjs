import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { showErrorDialog } from '../../../helpers/toolsHelper';
import { renderWithProviders } from '../../../test-utils';
import { postLostFoundCover } from '../api/lostFoundApi';
import ChangeCoverModal from './ChangeCoverModal';

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

const LOST_FOUND = { id: 7, title: 'Dompet', cover: null };

const renderModal = (lostFound = LOST_FOUND) => {
  const onClose = vi.fn();

  return {
    onClose,
    ...renderWithProviders(<ChangeCoverModal lostFound={lostFound} onClose={onClose} />),
  };
};

const imageFile = () => new File(['x'], 'cover.png', { type: 'image/png' });

const selectFile = (file) =>
  fireEvent.change(screen.getByTestId('cover-input'), {
    target: { files: [file] },
  });

describe('ChangeCoverModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    delete URL.createObjectURL;
    delete URL.revokeObjectURL;
  });

  it('menampilkan keterangan kosong dan tombol unggah nonaktif jika belum ada cover', () => {
    renderModal();

    expect(screen.getByText('Belum ada foto cover')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unggah Cover' })).toBeDisabled();
  });

  it('menampilkan cover yang sudah ada', () => {
    renderModal({ ...LOST_FOUND, cover: 'img/lost-founds/cover/7.png' });

    expect(screen.getByAltText('Pratinjau cover')).toHaveAttribute(
      'src',
      'https://open-api.delcom.org/img/lost-founds/cover/7.png',
    );
    expect(screen.queryByText('Belum ada foto cover')).not.toBeInTheDocument();
  });

  it('tombol pilih gambar membuka pemilih berkas', async () => {
    const user = userEvent.setup();
    renderModal();
    const clickSpy = vi.spyOn(screen.getByTestId('cover-input'), 'click');

    await user.click(screen.getByRole('button', { name: 'Pilih Gambar' }));

    expect(clickSpy).toHaveBeenCalled();
  });

  it('mengabaikan jika tidak ada berkas yang dipilih', () => {
    renderModal();

    fireEvent.change(screen.getByTestId('cover-input'), { target: { files: [] } });

    expect(screen.getByRole('button', { name: 'Unggah Cover' })).toBeDisabled();
  });

  it('menolak berkas yang bukan gambar', () => {
    renderModal();

    selectFile(new File(['x'], 'dokumen.pdf', { type: 'application/pdf' }));

    expect(showErrorDialog).toHaveBeenCalledWith('File yang dipilih harus berupa gambar');
    expect(screen.getByRole('button', { name: 'Unggah Cover' })).toBeDisabled();
  });

  it('menampilkan pratinjau gambar yang dipilih', () => {
    renderModal();

    selectFile(imageFile());

    expect(screen.getByAltText('Pratinjau cover')).toHaveAttribute('src', 'blob:preview');
    expect(screen.getByRole('button', { name: 'Pilih Gambar Lain' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unggah Cover' })).toBeEnabled();
  });

  it('membersihkan object URL pratinjau saat modal ditutup dari layar', () => {
    const { unmount } = renderModal();
    selectFile(imageFile());

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });

  it('berhasil: mengunggah cover lalu menutup modal', async () => {
    const user = userEvent.setup();
    postLostFoundCover.mockResolvedValue({ success: true, message: 'Cover diubah' });
    const { onClose, store } = renderModal();
    const file = imageFile();

    selectFile(file);
    await user.click(screen.getByRole('button', { name: 'Unggah Cover' }));

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(postLostFoundCover).toHaveBeenCalledWith(7, file);
    expect(store.getState().isLostFoundChangedCover).toBe(true);
  });

  it('gagal: modal tetap terbuka', async () => {
    const user = userEvent.setup();
    postLostFoundCover.mockResolvedValue({ success: false, message: 'Terlalu besar' });
    const { onClose } = renderModal();

    selectFile(imageFile());
    await user.click(screen.getByRole('button', { name: 'Unggah Cover' }));

    await waitFor(() => expect(postLostFoundCover).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
  });

  it('menonaktifkan tombol selama cover diunggah', async () => {
    const user = userEvent.setup();
    let resolveRequest;
    postLostFoundCover.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    renderModal();

    selectFile(imageFile());
    await user.click(screen.getByRole('button', { name: 'Unggah Cover' }));

    expect(await screen.findByRole('button', { name: 'Mengunggah...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Batal' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Pilih Gambar Lain' })).toBeDisabled();

    resolveRequest({ success: false, message: 'Gagal' });
    expect(await screen.findByRole('button', { name: 'Unggah Cover' })).toBeEnabled();
  });

  it('memanggil onClose saat tombol Batal diklik', async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByRole('button', { name: 'Batal' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { showErrorDialog } from '../../../helpers/toolsHelper';
import { renderWithProviders } from '../../../test-utils';
import {
  getProfile,
  postProfilePhoto,
  putProfile,
  putProfilePassword,
} from '../api/userApi';
import ProfilePage from './ProfilePage';

vi.mock('../api/userApi', () => ({
  getUsers: vi.fn(),
  getProfile: vi.fn(),
  putProfile: vi.fn(),
  postProfilePhoto: vi.fn(),
  putProfilePassword: vi.fn(),
}));
vi.mock('../../../helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const PROFILE = {
  id: 1,
  name: 'Budi Santoso',
  email: 'budi@mail.com',
  photo: null,
  created_at: '2024-02-28T07:49:32.000000Z',
};

const renderPage = () =>
  renderWithProviders(<ProfilePage />, {
    preloadedState: { profile: PROFILE, isProfile: true },
  });

const imageFile = () => new File(['x'], 'foto.png', { type: 'image/png' });

const selectFile = (file) =>
  fireEvent.change(screen.getByTestId('photo-input'), {
    target: { files: [file] },
  });

const pending = () => {
  let resolve;
  const promise = new Promise((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
    getProfile.mockResolvedValue({
      success: true,
      data: { user: { ...PROFILE, name: 'Nama Baru' } },
    });
  });

  afterEach(() => {
    delete URL.createObjectURL;
    delete URL.revokeObjectURL;
  });

  it('tidak menampilkan apa pun jika profil belum dimuat', () => {
    const { container } = renderWithProviders(<ProfilePage />);

    expect(container).toBeEmptyDOMElement();
  });

  it('menampilkan data profil pada kartu dan formulir', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Budi Santoso' })).toBeInTheDocument();
    expect(screen.getByText('budi@mail.com')).toBeInTheDocument();
    expect(screen.getByText(/Bergabung .*2024/)).toBeInTheDocument();
    expect(screen.getByLabelText('Nama Lengkap')).toHaveValue('Budi Santoso');
    expect(screen.getByLabelText('Email')).toHaveValue('budi@mail.com');
  });

  describe('informasi profil', () => {
    it('menampilkan pesan wajib diisi', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.clear(screen.getByLabelText('Nama Lengkap'));
      await user.clear(screen.getByLabelText('Email'));
      await user.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));

      expect(screen.getByText('Nama lengkap wajib diisi')).toBeInTheDocument();
      expect(screen.getByText('Email wajib diisi')).toBeInTheDocument();
      expect(putProfile).not.toHaveBeenCalled();
    });

    it('menampilkan pesan nama pendek dan email tidak valid', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.clear(screen.getByLabelText('Nama Lengkap'));
      await user.type(screen.getByLabelText('Nama Lengkap'), 'ab');
      await user.clear(screen.getByLabelText('Email'));
      await user.type(screen.getByLabelText('Email'), 'bukan-email');
      await user.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));

      expect(screen.getByText('Nama minimal 3 karakter')).toBeInTheDocument();
      expect(screen.getByText('Format email tidak valid')).toBeInTheDocument();
      expect(putProfile).not.toHaveBeenCalled();
    });

    it('berhasil: mengirim data lalu menyegarkan profil', async () => {
      const user = userEvent.setup();
      putProfile.mockResolvedValue({ success: true, message: 'Profil diubah' });
      const { store } = renderPage();

      await user.clear(screen.getByLabelText('Nama Lengkap'));
      await user.type(screen.getByLabelText('Nama Lengkap'), '  Nama Baru ');
      await user.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));

      expect(
        await screen.findByRole('heading', { name: 'Nama Baru' }),
      ).toBeInTheDocument();
      expect(putProfile).toHaveBeenCalledWith({
        name: 'Nama Baru',
        email: 'budi@mail.com',
      });
      expect(getProfile).toHaveBeenCalled();
      expect(store.getState().isChangeProfile).toBe(false);
    });

    it('gagal: profil tidak disegarkan', async () => {
      const user = userEvent.setup();
      putProfile.mockResolvedValue({ success: false, message: 'Email dipakai' });
      renderPage();

      await user.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));

      await waitFor(() => expect(putProfile).toHaveBeenCalled());
      expect(getProfile).not.toHaveBeenCalled();
    });

    it('menampilkan status menyimpan selama permintaan berjalan', async () => {
      const user = userEvent.setup();
      const request = pending();
      putProfile.mockReturnValue(request.promise);
      renderPage();

      await user.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));

      expect(
        await screen.findByRole('button', { name: 'Menyimpan...' }),
      ).toBeDisabled();

      request.resolve({ success: false, message: 'Gagal' });
      expect(
        await screen.findByRole('button', { name: 'Simpan Perubahan' }),
      ).toBeEnabled();
    });
  });

  describe('ganti kata sandi', () => {
    const fillPasswords = async (user, current, next, confirm) => {
      if (current) {
        await user.type(screen.getByLabelText('Kata Sandi Saat Ini'), current);
      }
      if (next) {
        await user.type(screen.getByLabelText('Kata Sandi Baru'), next);
      }
      if (confirm) {
        await user.type(
          screen.getByLabelText('Konfirmasi Kata Sandi Baru'),
          confirm,
        );
      }
    };

    const submit = (user) =>
      user.click(screen.getByRole('button', { name: 'Ubah Kata Sandi' }));

    it('menampilkan pesan wajib diisi', async () => {
      const user = userEvent.setup();
      renderPage();

      await submit(user);

      expect(
        screen.getByText('Kata sandi saat ini wajib diisi'),
      ).toBeInTheDocument();
      expect(screen.getByText('Kata sandi baru wajib diisi')).toBeInTheDocument();
      expect(
        screen.getByText('Konfirmasi kata sandi wajib diisi'),
      ).toBeInTheDocument();
      expect(putProfilePassword).not.toHaveBeenCalled();
    });

    it('menolak sandi baru yang terlalu pendek dan konfirmasi yang berbeda', async () => {
      const user = userEvent.setup();
      renderPage();

      await fillPasswords(user, 'lama123', '123', '456');
      await submit(user);

      expect(
        screen.getByText('Kata sandi baru minimal 6 karakter'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Konfirmasi kata sandi tidak cocok'),
      ).toBeInTheDocument();
      expect(putProfilePassword).not.toHaveBeenCalled();
    });

    it('menolak sandi baru yang sama dengan sandi lama', async () => {
      const user = userEvent.setup();
      renderPage();

      await fillPasswords(user, 'sama1234', 'sama1234', 'sama1234');
      await submit(user);

      expect(
        screen.getByText('Kata sandi baru harus berbeda dari yang lama'),
      ).toBeInTheDocument();
      expect(putProfilePassword).not.toHaveBeenCalled();
    });

    it('berhasil: mengirim data dan mengosongkan formulir', async () => {
      const user = userEvent.setup();
      putProfilePassword.mockResolvedValue({ success: true, message: 'Sandi diubah' });
      const { store } = renderPage();

      await fillPasswords(user, 'lama123', 'baru1234', 'baru1234');
      await submit(user);

      await waitFor(() =>
        expect(screen.getByLabelText('Kata Sandi Saat Ini')).toHaveValue(''),
      );
      expect(putProfilePassword).toHaveBeenCalledWith({
        password: 'lama123',
        newPassword: 'baru1234',
      });
      expect(screen.getByLabelText('Kata Sandi Baru')).toHaveValue('');
      expect(screen.getByLabelText('Konfirmasi Kata Sandi Baru')).toHaveValue('');
      expect(store.getState().isChangeProfilePassword).toBe(false);
    });

    it('gagal: isi formulir dipertahankan', async () => {
      const user = userEvent.setup();
      putProfilePassword.mockResolvedValue({ success: false, message: 'Sandi lama salah' });
      renderPage();

      await fillPasswords(user, 'salah123', 'baru1234', 'baru1234');
      await submit(user);

      await waitFor(() => expect(putProfilePassword).toHaveBeenCalled());
      expect(screen.getByLabelText('Kata Sandi Saat Ini')).toHaveValue('salah123');
    });

    it('menampilkan status menyimpan selama permintaan berjalan', async () => {
      const user = userEvent.setup();
      const request = pending();
      putProfilePassword.mockReturnValue(request.promise);
      renderPage();

      await fillPasswords(user, 'lama123', 'baru1234', 'baru1234');
      await submit(user);

      expect(
        await screen.findByRole('button', { name: 'Menyimpan...' }),
      ).toBeDisabled();

      request.resolve({ success: false, message: 'Gagal' });
      expect(
        await screen.findByRole('button', { name: 'Ubah Kata Sandi' }),
      ).toBeEnabled();
    });

    it('menampilkan dan menyembunyikan kata sandi', async () => {
      const user = userEvent.setup();
      renderPage();

      const input = screen.getByLabelText('Kata Sandi Saat Ini');
      expect(input).toHaveAttribute('type', 'password');

      await user.click(screen.getByRole('button', { name: 'Tampilkan kata sandi' }));
      expect(input).toHaveAttribute('type', 'text');

      await user.click(screen.getByRole('button', { name: 'Sembunyikan kata sandi' }));
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  describe('foto profil', () => {
    it('tombol kamera membuka pemilih berkas', async () => {
      const user = userEvent.setup();
      renderPage();
      const input = screen.getByTestId('photo-input');
      const clickSpy = vi.spyOn(input, 'click');

      await user.click(screen.getByRole('button', { name: 'Pilih foto baru' }));

      expect(clickSpy).toHaveBeenCalled();
    });

    it('mengabaikan jika tidak ada berkas yang dipilih', () => {
      renderPage();

      fireEvent.change(screen.getByTestId('photo-input'), {
        target: { files: [] },
      });

      expect(screen.queryByRole('button', { name: 'Simpan Foto' })).not.toBeInTheDocument();
    });

    it('menolak berkas yang bukan gambar', () => {
      renderPage();

      selectFile(new File(['x'], 'dokumen.pdf', { type: 'application/pdf' }));

      expect(showErrorDialog).toHaveBeenCalledWith(
        'File yang dipilih harus berupa gambar',
      );
      expect(screen.queryByRole('button', { name: 'Simpan Foto' })).not.toBeInTheDocument();
    });

    it('menampilkan pratinjau, lalu membatalkannya', async () => {
      const user = userEvent.setup();
      renderPage();

      selectFile(imageFile());

      expect(screen.getByAltText('Pratinjau foto profil')).toHaveAttribute(
        'src',
        'blob:preview',
      );

      await user.click(screen.getByRole('button', { name: 'Batal' }));

      expect(screen.queryByAltText('Pratinjau foto profil')).not.toBeInTheDocument();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:preview');
    });

    it('berhasil: mengunggah foto lalu menyegarkan profil', async () => {
      const user = userEvent.setup();
      postProfilePhoto.mockResolvedValue({ success: true, message: 'Foto diubah' });
      renderPage();
      const file = imageFile();

      selectFile(file);
      await user.click(screen.getByRole('button', { name: 'Simpan Foto' }));

      await waitFor(() =>
        expect(screen.queryByAltText('Pratinjau foto profil')).not.toBeInTheDocument(),
      );
      expect(postProfilePhoto).toHaveBeenCalledWith(file);
      await waitFor(() => expect(getProfile).toHaveBeenCalled());
    });

    it('gagal: pratinjau dipertahankan', async () => {
      const user = userEvent.setup();
      postProfilePhoto.mockResolvedValue({ success: false, message: 'Terlalu besar' });
      renderPage();

      selectFile(imageFile());
      await user.click(screen.getByRole('button', { name: 'Simpan Foto' }));

      await waitFor(() => expect(postProfilePhoto).toHaveBeenCalled());
      expect(screen.getByAltText('Pratinjau foto profil')).toBeInTheDocument();
      expect(getProfile).not.toHaveBeenCalled();
    });

    it('menampilkan status menyimpan selama unggahan berjalan', async () => {
      const user = userEvent.setup();
      const request = pending();
      postProfilePhoto.mockReturnValue(request.promise);
      renderPage();

      selectFile(imageFile());
      await user.click(screen.getByRole('button', { name: 'Simpan Foto' }));

      expect(
        await screen.findByRole('button', { name: 'Menyimpan...' }),
      ).toBeDisabled();

      request.resolve({ success: false, message: 'Gagal' });
      expect(
        await screen.findByRole('button', { name: 'Simpan Foto' }),
      ).toBeEnabled();
    });
  });
});
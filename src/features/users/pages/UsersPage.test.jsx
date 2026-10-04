import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { showErrorDialog } from '../../../helpers/toolsHelper';
import { renderWithProviders } from '../../../test-utils';
import { getUsers } from '../api/userApi';
import UsersPage from './UsersPage';

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

const USERS = [
  {
    id: 1,
    name: 'Budi Santoso',
    email: 'budi@mail.com',
    photo: null,
    created_at: '2024-02-28T07:49:32.000000Z',
  },
  {
    id: 2,
    name: 'Siti Aminah',
    email: 'siti@mail.com',
    photo: 'img/users/siti.png',
    created_at: '2024-03-01T07:49:32.000000Z',
  },
];

const renderPage = (preloadedState) =>
  renderWithProviders(<UsersPage />, { preloadedState });

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUsers.mockResolvedValue({ success: true, data: { users: USERS } });
  });

  it('menampilkan skeleton saat memuat lalu daftar pengguna', async () => {
    let resolveUsers;
    getUsers.mockReturnValue(
      new Promise((resolve) => {
        resolveUsers = resolve;
      }),
    );
    renderPage();

    expect(screen.getByTestId('users-skeleton')).toBeInTheDocument();

    resolveUsers({ success: true, data: { users: USERS } });

    expect(await screen.findByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.queryByTestId('users-skeleton')).not.toBeInTheDocument();
    expect(screen.getByText('Siti Aminah')).toBeInTheDocument();
    expect(screen.getByText('2 pengguna')).toBeInTheDocument();
  });

  it('memberi lencana "Kamu" pada akun yang sedang login', async () => {
    renderPage({ profile: { id: 1 } });

    await screen.findByText('Budi Santoso');

    expect(screen.getAllByText('Kamu')).toHaveLength(1);
  });

  it('tidak menampilkan lencana "Kamu" jika profil belum ada', async () => {
    renderPage();

    await screen.findByText('Budi Santoso');

    expect(screen.queryByText('Kamu')).not.toBeInTheDocument();
  });

  it('menyaring pengguna berdasarkan nama dan email', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Budi Santoso');

    const search = screen.getByLabelText('Cari pengguna');

    await user.type(search, 'siti');
    expect(screen.queryByText('Budi Santoso')).not.toBeInTheDocument();
    expect(screen.getByText('Siti Aminah')).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'budi@mail');
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.queryByText('Siti Aminah')).not.toBeInTheDocument();
  });

  it('menampilkan pesan jika pencarian tidak menemukan hasil', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Budi Santoso');

    await user.type(screen.getByLabelText('Cari pengguna'), 'zzz');

    expect(screen.getByText('Pengguna tidak ditemukan')).toBeInTheDocument();
    expect(
      screen.getByText('Coba gunakan kata kunci yang lain.'),
    ).toBeInTheDocument();
  });

  it('menampilkan pesan jika belum ada pengguna', async () => {
    getUsers.mockResolvedValue({ success: true, data: { users: [] } });
    renderPage();

    expect(await screen.findByText('Belum ada pengguna')).toBeInTheDocument();
    expect(
      screen.getByText('Data pengguna akan tampil di sini.'),
    ).toBeInTheDocument();
  });

  it('menampilkan dialog error dan tampilan kosong jika gagal memuat', async () => {
    getUsers.mockResolvedValue({ success: false, message: 'Gagal memuat' });
    renderPage();

    expect(await screen.findByText('Belum ada pengguna')).toBeInTheDocument();
    expect(showErrorDialog).toHaveBeenCalledWith('Gagal memuat');
  });

  it('membuka modal detail, lalu menutupnya lewat tombol tutup', async () => {
    const user = userEvent.setup();
    const { store } = renderPage();

    await user.click(await screen.findByText('Budi Santoso'));

    const dialog = screen.getByRole('dialog', { name: 'Detail pengguna' });
    expect(within(dialog).getByText('Budi Santoso')).toBeInTheDocument();
    expect(within(dialog).getByText('budi@mail.com')).toBeInTheDocument();
    expect(within(dialog).getByText(/Bergabung .*2024/)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Tutup' }));

    expect(
      screen.queryByRole('dialog', { name: 'Detail pengguna' }),
    ).not.toBeInTheDocument();
    expect(store.getState().user).toBeNull();
  });

  it('menutup modal saat latar belakang diklik, tetapi tidak saat isi modal diklik', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByText('Siti Aminah'));
    const dialog = screen.getByRole('dialog', { name: 'Detail pengguna' });

    await user.click(dialog);
    expect(dialog).toBeInTheDocument();

    await user.click(dialog.parentElement);
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Detail pengguna' }),
      ).not.toBeInTheDocument(),
    );
  });
});
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { showWarningDialog } from '../../../helpers/toolsHelper';
import { renderWithProviders } from '../../../test-utils';
import { getProfile } from '../../users/api/userApi';
import LostFoundLayout from './LostFoundLayout';

vi.mock('../../users/api/userApi', () => ({
  getUsers: vi.fn(),
  getProfile: vi.fn(),
  putProfile: vi.fn(),
  postProfilePhoto: vi.fn(),
  putProfilePassword: vi.fn(),
}));
vi.mock('../../../helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal()),
  showWarningDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

const PROFILE = {
  id: 1,
  name: 'Budi Santoso',
  email: 'budi@mail.com',
  photo: null,
};

const renderLayout = (preloadedState) =>
  renderWithProviders(
    <Routes>
      <Route path="/auth/login" element={<p>Halaman login</p>} />
      <Route path="/" element={<LostFoundLayout />}>
        <Route index element={<p>Isi halaman</p>} />
      </Route>
    </Routes>,
    { preloadedState },
  );

describe('LostFoundLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('accessToken', 'token-123');
  });

  it('mengalihkan ke halaman login jika belum login', () => {
    renderLayout({ isAuthLogin: false });

    expect(screen.getByText('Halaman login')).toBeInTheDocument();
    expect(getProfile).not.toHaveBeenCalled();
  });

  it('memuat profil lalu menampilkan navbar, sidebar, dan konten', async () => {
    getProfile.mockResolvedValue({ success: true, data: { user: PROFILE } });
    renderLayout({ isAuthLogin: true });

    expect(screen.getByText('Memuat sesi...')).toBeInTheDocument();

    expect(await screen.findByText('Isi halaman')).toBeInTheDocument();
    expect(getProfile).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /Budi Santoso/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.queryByText('Memuat sesi...')).not.toBeInTheDocument();
  });

  it('langsung menampilkan konten jika profil sudah dimuat', () => {
    renderLayout({ isAuthLogin: true, isProfile: true, profile: PROFILE });

    expect(screen.getByText('Isi halaman')).toBeInTheDocument();
    expect(getProfile).not.toHaveBeenCalled();
  });

  it('mengakhiri sesi jika profil gagal dimuat', async () => {
    getProfile.mockResolvedValue({ success: false, message: 'Unauthenticated.' });
    const { store } = renderLayout({ isAuthLogin: true });

    expect(await screen.findByText('Halaman login')).toBeInTheDocument();
    expect(showWarningDialog).toHaveBeenCalledWith(
      'Sesi kamu telah berakhir. Silakan login kembali.',
    );
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(store.getState().isAuthLogin).toBe(false);
  });

  it('membuka dan menutup sidebar di tampilan mobile', async () => {
    const user = userEvent.setup();
    const { container } = renderLayout({
      isAuthLogin: true,
      isProfile: true,
      profile: PROFILE,
    });
    const sidebar = container.querySelector('aside');
    const overlay = container.querySelector('[aria-hidden="true"]');

    expect(sidebar).toHaveClass('-translate-x-full');

    await user.click(screen.getByRole('button', { name: 'Buka menu' }));
    expect(sidebar).toHaveClass('translate-x-0');

    await user.click(overlay);
    await waitFor(() => expect(sidebar).toHaveClass('-translate-x-full'));
  });
});
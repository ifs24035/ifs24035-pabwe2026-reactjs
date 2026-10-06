import PropTypes from 'prop-types';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSelector } from 'react-redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { showConfirmDialog } from '../../../helpers/toolsHelper';
import { renderWithProviders } from '../../../test-utils';
import NavbarComponent from './NavbarComponent';

vi.mock('../../../helpers/toolsHelper', async (importOriginal) => ({
  ...(await importOriginal()),
  showConfirmDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const PROFILE = {
  id: 1,
  name: 'Budi Santoso',
  email: 'budi@mail.com',
  photo: null,
};

// Meniru LostFoundLayout: navbar hanya tampil selama profil masih ada di store
function NavbarHost({ onToggleSidebar }) {
  const profile = useSelector((states) => states.profile);

  return profile ? (
    <NavbarComponent onToggleSidebar={onToggleSidebar} />
  ) : (
    <p>Sesi berakhir</p>
  );
}

NavbarHost.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired,
};

const renderNavbar = (onToggleSidebar = vi.fn()) =>
  renderWithProviders(<NavbarHost onToggleSidebar={onToggleSidebar} />, {
    preloadedState: { profile: PROFILE, isProfile: true, isAuthLogin: true },
  });

const openMenu = (user) =>
  user.click(screen.getByRole('button', { name: /Budi Santoso/ }));

describe('NavbarComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('accessToken', 'token-123');
  });

  it('menampilkan logo, judul, status sesi, dan nama pengguna', () => {
    renderNavbar();

    expect(screen.getByAltText('Logo Lost & Founds')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Lost.*Founds/ })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByText('Sesi aktif')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Budi Santoso/ })).toBeInTheDocument();
  });

  it('memanggil onToggleSidebar saat tombol menu diklik', async () => {
    const user = userEvent.setup();
    const onToggleSidebar = vi.fn();
    renderNavbar(onToggleSidebar);

    await user.click(screen.getByRole('button', { name: 'Buka menu' }));

    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('membuka dan menutup dropdown profil lewat tombol profil', async () => {
    const user = userEvent.setup();
    renderNavbar();
    const trigger = screen.getByRole('button', { name: /Budi Santoso/ });

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('budi@mail.com')).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('menutup dropdown saat klik di luar, tetapi tidak saat klik di dalam menu', async () => {
    const user = userEvent.setup();
    renderNavbar();
    await openMenu(user);

    fireEvent.mouseDown(screen.getByText('budi@mail.com'));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('menutup dropdown saat tautan Profil Saya dipilih', async () => {
    const user = userEvent.setup();
    renderNavbar();
    await openMenu(user);

    const link = screen.getByRole('menuitem', { name: 'Profil Saya' });
    expect(link).toHaveAttribute('href', '/profile');

    await user.click(link);

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('logout dikonfirmasi: token dihapus dan sesi berakhir', async () => {
    const user = userEvent.setup();
    showConfirmDialog.mockResolvedValue(true);
    const { store } = renderNavbar();
    await openMenu(user);

    await user.click(screen.getByRole('menuitem', { name: 'Keluar' }));

    await waitFor(() => expect(store.getState().isAuthLogin).toBe(false));
    expect(showConfirmDialog).toHaveBeenCalledWith(
      'Keluar dari akun?',
      'Kamu harus login kembali untuk mengakses laporan.',
      'Ya, keluar',
    );
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(store.getState().profile).toBeNull();
    expect(screen.getByText('Sesi berakhir')).toBeInTheDocument();
  });

  it('logout dibatalkan: sesi tetap aktif', async () => {
    const user = userEvent.setup();
    showConfirmDialog.mockResolvedValue(false);
    const { store } = renderNavbar();
    await openMenu(user);

    await user.click(screen.getByRole('menuitem', { name: 'Keluar' }));

    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(store.getState().isAuthLogin).toBe(true);
    expect(localStorage.getItem('accessToken')).toBe('token-123');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
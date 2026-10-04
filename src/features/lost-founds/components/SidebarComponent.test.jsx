import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test-utils';
import SidebarComponent from './SidebarComponent';

const renderSidebar = ({ route = '/', open = false, onClose = vi.fn() } = {}) =>
  renderWithProviders(<SidebarComponent open={open} onClose={onClose} />, {
    route,
  });

const activeLabels = () =>
  screen
    .getAllByRole('link')
    .filter((link) => link.getAttribute('aria-current') === 'page')
    .map((link) => link.textContent);

describe('SidebarComponent', () => {
  it('menampilkan empat menu dengan tautan yang benar', () => {
    renderSidebar();

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Statistik' })).toHaveAttribute(
      'href',
      '/#statistik',
    );
    expect(screen.getByRole('link', { name: 'Pengguna' })).toHaveAttribute(
      'href',
      '/users',
    );
    expect(screen.getByRole('link', { name: 'Profil Saya' })).toHaveAttribute(
      'href',
      '/profile',
    );
  });

  it('menandai Dashboard aktif di halaman beranda', () => {
    renderSidebar({ route: '/' });

    expect(activeLabels()).toEqual(['Dashboard']);
  });

  it('menandai Statistik aktif saat hash #statistik', () => {
    renderSidebar({ route: '/#statistik' });

    expect(activeLabels()).toEqual(['Statistik']);
  });

  it('menandai Dashboard aktif di halaman detail laporan', () => {
    renderSidebar({ route: '/lost-founds/5' });

    expect(activeLabels()).toEqual(['Dashboard']);
  });

  it('menandai Pengguna aktif di halaman pengguna', () => {
    renderSidebar({ route: '/users' });

    expect(activeLabels()).toEqual(['Pengguna']);
  });

  it('menandai Profil Saya aktif di halaman profil', () => {
    renderSidebar({ route: '/profile' });

    expect(activeLabels()).toEqual(['Profil Saya']);
  });

  it('memanggil onClose saat menu atau latar gelap diklik', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = renderSidebar({ open: true, onClose });

    await user.click(screen.getByRole('link', { name: 'Pengguna' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(container.querySelector('[aria-hidden="true"]'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('menggeser sidebar masuk saat open dan keluar saat tertutup', () => {
    const { container, unmount } = renderSidebar({ open: true });
    expect(container.querySelector('aside')).toHaveClass('translate-x-0');
    expect(container.querySelector('[aria-hidden="true"]')).toHaveClass('opacity-100');
    unmount();

    const closed = renderSidebar({ open: false });
    expect(closed.container.querySelector('aside')).toHaveClass('-translate-x-full');
    expect(closed.container.querySelector('[aria-hidden="true"]')).toHaveClass(
      'opacity-0',
    );
  });
});
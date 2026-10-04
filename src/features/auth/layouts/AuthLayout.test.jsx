import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../../test-utils';
import AuthLayout from './AuthLayout';

const renderLayout = (isAuthLogin) =>
  renderWithProviders(
    <Routes>
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<p>Isi halaman login</p>} />
      </Route>
      <Route path="/" element={<p>Halaman beranda</p>} />
    </Routes>,
    { route: '/auth/login', preloadedState: { isAuthLogin } },
  );

describe('AuthLayout', () => {
  it('menampilkan banner dan konten halaman anak saat belum login', () => {
    renderLayout(false);

    expect(
      screen.getByRole('heading', {
        name: 'Temukan yang hilang, kembalikan yang ditemukan.',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Laporkan dengan cepat')).toBeInTheDocument();
    expect(screen.getByText('Pantau status laporan')).toBeInTheDocument();
    expect(screen.getByText('Aman dan terpusat')).toBeInTheDocument();
    expect(screen.getByText('Isi halaman login')).toBeInTheDocument();
  });

  it('mengalihkan ke beranda jika pengguna sudah login', () => {
    renderLayout(true);

    expect(screen.getByText('Halaman beranda')).toBeInTheDocument();
    expect(screen.queryByText('Isi halaman login')).not.toBeInTheDocument();
  });
});
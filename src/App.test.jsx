import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./features/auth/layouts/AuthLayout', async () => {
  const { Outlet } = await import('react-router-dom');
  return {
    default: () => (
      <div data-testid="auth-layout">
        <Outlet />
      </div>
    ),
  };
});

vi.mock('./features/lost-founds/layouts/LostFoundLayout', async () => {
  const { Outlet } = await import('react-router-dom');
  return {
    default: () => (
      <div data-testid="lost-found-layout">
        <Outlet />
      </div>
    ),
  };
});

vi.mock('./features/auth/pages/LoginPage', () => ({
  default: () => <div data-testid="login-page" />,
}));
vi.mock('./features/auth/pages/RegisterPage', () => ({
  default: () => <div data-testid="register-page" />,
}));
vi.mock('./features/lost-founds/pages/HomePage', () => ({
  default: () => <div data-testid="home-page" />,
}));
vi.mock('./features/lost-founds/pages/DetailPage', () => ({
  default: () => <div data-testid="detail-page" />,
}));
vi.mock('./features/users/pages/UsersPage', () => ({
  default: () => <div data-testid="users-page" />,
}));
vi.mock('./features/users/pages/ProfilePage', () => ({
  default: () => <div data-testid="profile-page" />,
}));

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

describe('App routing', () => {
  afterEach(() => {
    cleanup();
  });

  it('menampilkan indikator memuat saat halaman masih diunduh', async () => {
    renderAt('/auth/login');
    expect(screen.getByRole('heading', { name: 'Memuat halaman...' })).toBeTruthy();
    expect(await screen.findByTestId('login-page')).toBeTruthy();
  });

  it('menampilkan LoginPage di dalam AuthLayout pada /auth/login', async () => {
    renderAt('/auth/login');
    expect(await screen.findByTestId('auth-layout')).toBeTruthy();
    expect(await screen.findByTestId('login-page')).toBeTruthy();
  });

  it('menampilkan RegisterPage di dalam AuthLayout pada /auth/register', async () => {
    renderAt('/auth/register');
    expect(await screen.findByTestId('auth-layout')).toBeTruthy();
    expect(await screen.findByTestId('register-page')).toBeTruthy();
  });

  it('menampilkan HomePage di dalam LostFoundLayout pada /', async () => {
    renderAt('/');
    expect(await screen.findByTestId('lost-found-layout')).toBeTruthy();
    expect(await screen.findByTestId('home-page')).toBeTruthy();
  });

  it('menampilkan DetailPage pada /lost-founds/:id', async () => {
    renderAt('/lost-founds/123');
    expect(await screen.findByTestId('lost-found-layout')).toBeTruthy();
    expect(await screen.findByTestId('detail-page')).toBeTruthy();
  });

  it('menampilkan UsersPage pada /users', async () => {
    renderAt('/users');
    expect(await screen.findByTestId('users-page')).toBeTruthy();
  });

  it('menampilkan ProfilePage pada /profile', async () => {
    renderAt('/profile');
    expect(await screen.findByTestId('profile-page')).toBeTruthy();
  });

  it('mengarahkan route tidak dikenal ke / (HomePage)', async () => {
    renderAt('/halaman-tidak-ada');
    expect(await screen.findByTestId('home-page')).toBeTruthy();
    expect(screen.queryByTestId('auth-layout')).toBeNull();
  });
});
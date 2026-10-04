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

  it('menampilkan LoginPage di dalam AuthLayout pada /auth/login', () => {
    renderAt('/auth/login');
    expect(screen.getByTestId('auth-layout')).toBeTruthy();
    expect(screen.getByTestId('login-page')).toBeTruthy();
  });

  it('menampilkan RegisterPage di dalam AuthLayout pada /auth/register', () => {
    renderAt('/auth/register');
    expect(screen.getByTestId('auth-layout')).toBeTruthy();
    expect(screen.getByTestId('register-page')).toBeTruthy();
  });

  it('menampilkan HomePage di dalam LostFoundLayout pada /', () => {
    renderAt('/');
    expect(screen.getByTestId('lost-found-layout')).toBeTruthy();
    expect(screen.getByTestId('home-page')).toBeTruthy();
  });

  it('menampilkan DetailPage pada /lost-founds/:id', () => {
    renderAt('/lost-founds/123');
    expect(screen.getByTestId('lost-found-layout')).toBeTruthy();
    expect(screen.getByTestId('detail-page')).toBeTruthy();
  });

  it('menampilkan UsersPage pada /users', () => {
    renderAt('/users');
    expect(screen.getByTestId('users-page')).toBeTruthy();
  });

  it('menampilkan ProfilePage pada /profile', () => {
    renderAt('/profile');
    expect(screen.getByTestId('profile-page')).toBeTruthy();
  });

  it('mengarahkan route tidak dikenal ke / (HomePage)', () => {
    renderAt('/halaman-tidak-ada');
    expect(screen.getByTestId('home-page')).toBeTruthy();
    expect(screen.queryByTestId('auth-layout')).toBeNull();
  });
});
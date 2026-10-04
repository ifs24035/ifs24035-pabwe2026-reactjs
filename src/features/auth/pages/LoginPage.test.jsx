import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test-utils';
import { postLogin } from '../api/authApi';
import LoginPage from './LoginPage';

vi.mock('../api/authApi', () => ({
  postLogin: vi.fn(),
  postRegister: vi.fn(),
}));
vi.mock('../../../helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const fillForm = async (user, email, password) => {
  if (email) await user.type(screen.getByLabelText('Email'), email);
  if (password) await user.type(screen.getByLabelText('Kata Sandi'), password);
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('menampilkan formulir login dan tautan ke registrasi', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Kata Sandi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Masuk' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Daftar sekarang' })).toHaveAttribute(
      'href',
      '/auth/register',
    );
  });

  it('menampilkan pesan wajib diisi saat formulir kosong', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(screen.getByText('Email wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Kata sandi wajib diisi')).toBeInTheDocument();
    expect(postLogin).not.toHaveBeenCalled();
  });

  it('menampilkan pesan format email tidak valid dan sandi terlalu pendek', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await fillForm(user, 'bukan-email', '123');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(screen.getByText('Format email tidak valid')).toBeInTheDocument();
    expect(
      screen.getByText('Kata sandi minimal 6 karakter'),
    ).toBeInTheDocument();
    expect(postLogin).not.toHaveBeenCalled();
  });

  it('menampilkan dan menyembunyikan kata sandi', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const input = screen.getByLabelText('Kata Sandi');
    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Tampilkan kata sandi' }));
    expect(input).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: 'Sembunyikan kata sandi' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('login berhasil: token tersimpan dan state login menjadi true', async () => {
    const user = userEvent.setup();
    postLogin.mockResolvedValue({
      success: true,
      message: 'Berhasil login',
      data: { token: 'token-123' },
    });
    const { store } = renderWithProviders(<LoginPage />);

    await fillForm(user, '  budi@mail.com ', 'secret1');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    await waitFor(() => expect(store.getState().isAuthLogin).toBe(true));
    expect(postLogin).toHaveBeenCalledWith({
      email: 'budi@mail.com',
      password: 'secret1',
    });
    expect(localStorage.getItem('accessToken')).toBe('token-123');
  });

  it('menampilkan status memproses selama permintaan berjalan', async () => {
    const user = userEvent.setup();
    let resolveLogin;
    postLogin.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );
    renderWithProviders(<LoginPage />);

    await fillForm(user, 'budi@mail.com', 'secret1');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    const button = await screen.findByRole('button', { name: 'Memproses...' });
    expect(button).toBeDisabled();

    resolveLogin({ success: false, message: 'Gagal' });
    expect(
      await screen.findByRole('button', { name: 'Masuk' }),
    ).toBeEnabled();
  });

  it('login gagal: state login tetap false', async () => {
    const user = userEvent.setup();
    postLogin.mockResolvedValue({ success: false, message: 'Email salah' });
    const { store } = renderWithProviders(<LoginPage />);

    await fillForm(user, 'budi@mail.com', 'secret1');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    await waitFor(() => expect(postLogin).toHaveBeenCalled());
    expect(store.getState().isAuthLogin).toBe(false);
  });
});
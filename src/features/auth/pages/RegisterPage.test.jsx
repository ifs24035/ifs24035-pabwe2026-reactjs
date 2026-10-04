import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../test-utils';
import { postRegister } from '../api/authApi';
import RegisterPage from './RegisterPage';

vi.mock('../api/authApi', () => ({
  postLogin: vi.fn(),
  postRegister: vi.fn(),
}));
vi.mock('../../../helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const fillForm = async (user, { name, email, password, confirm }) => {
  if (name) await user.type(screen.getByLabelText('Nama Lengkap'), name);
  if (email) await user.type(screen.getByLabelText('Email'), email);
  if (password) await user.type(screen.getByLabelText('Kata Sandi'), password);
  if (confirm) {
    await user.type(screen.getByLabelText('Konfirmasi Kata Sandi'), confirm);
  }
};

const submit = (user) =>
  user.click(screen.getByRole('button', { name: 'Daftar' }));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('menampilkan formulir registrasi dan tautan ke login', () => {
    renderWithProviders(<RegisterPage />);

    expect(screen.getByLabelText('Nama Lengkap')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Kata Sandi')).toBeInTheDocument();
    expect(screen.getByLabelText('Konfirmasi Kata Sandi')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Masuk di sini' })).toHaveAttribute(
      'href',
      '/auth/login',
    );
  });

  it('menampilkan pesan wajib diisi saat formulir kosong', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    await submit(user);

    expect(screen.getByText('Nama lengkap wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Email wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Kata sandi wajib diisi')).toBeInTheDocument();
    expect(
      screen.getByText('Konfirmasi kata sandi wajib diisi'),
    ).toBeInTheDocument();
    expect(postRegister).not.toHaveBeenCalled();
  });

  it('menampilkan pesan untuk nama pendek, email tidak valid, sandi pendek, dan konfirmasi berbeda', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    await fillForm(user, {
      name: 'Bu',
      email: 'bukan-email',
      password: '123',
      confirm: '456',
    });
    await submit(user);

    expect(screen.getByText('Nama minimal 3 karakter')).toBeInTheDocument();
    expect(screen.getByText('Format email tidak valid')).toBeInTheDocument();
    expect(
      screen.getByText('Kata sandi minimal 6 karakter'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Konfirmasi kata sandi tidak cocok'),
    ).toBeInTheDocument();
    expect(postRegister).not.toHaveBeenCalled();
  });

  it('menampilkan dan menyembunyikan kata sandi pada kedua kolom', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RegisterPage />);

    const password = screen.getByLabelText('Kata Sandi');
    const confirm = screen.getByLabelText('Konfirmasi Kata Sandi');
    expect(password).toHaveAttribute('type', 'password');
    expect(confirm).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Tampilkan kata sandi' }));
    expect(password).toHaveAttribute('type', 'text');
    expect(confirm).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', { name: 'Sembunyikan kata sandi' }));
    expect(password).toHaveAttribute('type', 'password');
  });

  it('registrasi berhasil: mengirim data, lalu dialihkan ke halaman login', async () => {
    const user = userEvent.setup();
    postRegister.mockResolvedValue({
      success: true,
      message: 'Berhasil mendaftar',
    });
    const { store } = renderWithProviders(
      <Routes>
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/login" element={<p>Halaman login</p>} />
      </Routes>,
      { route: '/auth/register' },
    );

    await fillForm(user, {
      name: ' Budi Santoso ',
      email: ' budi@mail.com ',
      password: 'secret1',
      confirm: 'secret1',
    });
    await submit(user);

    expect(await screen.findByText('Halaman login')).toBeInTheDocument();
    expect(postRegister).toHaveBeenCalledWith({
      name: 'Budi Santoso',
      email: 'budi@mail.com',
      password: 'secret1',
    });
    expect(store.getState().isAuthRegister).toBe(false);
  });

  it('menampilkan status memproses selama permintaan berjalan', async () => {
    const user = userEvent.setup();
    let resolveRegister;
    postRegister.mockReturnValue(
      new Promise((resolve) => {
        resolveRegister = resolve;
      }),
    );
    renderWithProviders(<RegisterPage />);

    await fillForm(user, {
      name: 'Budi',
      email: 'budi@mail.com',
      password: 'secret1',
      confirm: 'secret1',
    });
    await submit(user);

    expect(
      await screen.findByRole('button', { name: 'Memproses...' }),
    ).toBeDisabled();

    resolveRegister({ success: false, message: 'Gagal' });
    expect(await screen.findByRole('button', { name: 'Daftar' })).toBeEnabled();
  });

  it('registrasi gagal: tetap di halaman registrasi', async () => {
    const user = userEvent.setup();
    postRegister.mockResolvedValue({
      success: false,
      message: 'Email sudah terdaftar',
    });
    const { store } = renderWithProviders(<RegisterPage />);

    await fillForm(user, {
      name: 'Budi',
      email: 'budi@mail.com',
      password: 'secret1',
      confirm: 'secret1',
    });
    await submit(user);

    await waitFor(() => expect(postRegister).toHaveBeenCalled());
    expect(store.getState().isAuthRegister).toBe(false);
    expect(screen.getByRole('button', { name: 'Daftar' })).toBeInTheDocument();
  });
});
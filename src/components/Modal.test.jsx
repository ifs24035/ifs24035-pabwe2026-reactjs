import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Modal from './Modal';

describe('Modal', () => {
  it('menampilkan judul, subjudul, dan isi', () => {
    render(
      <Modal title="Judul Modal" subtitle="Keterangan modal" onClose={vi.fn()}>
        <p>Isi modal</p>
      </Modal>,
    );

    expect(screen.getByRole('dialog', { name: 'Judul Modal' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Judul Modal' })).toBeInTheDocument();
    expect(screen.getByText('Keterangan modal')).toBeInTheDocument();
    expect(screen.getByText('Isi modal')).toBeInTheDocument();
  });

  it('tidak menampilkan subjudul jika tidak diberikan', () => {
    render(
      <Modal title="Judul Modal" onClose={vi.fn()}>
        <p>Isi modal</p>
      </Modal>,
    );

    expect(screen.queryByText('Keterangan modal')).not.toBeInTheDocument();
  });

  it('memanggil onClose saat tombol tutup diklik', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Judul Modal" onClose={onClose}>
        <p>Isi modal</p>
      </Modal>,
    );

    await user.click(screen.getByRole('button', { name: 'Tutup' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('memanggil onClose saat latar belakang diklik, tetapi tidak saat isi dialog diklik', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Judul Modal" onClose={onClose}>
        <p>Isi modal</p>
      </Modal>,
    );

    await user.click(screen.getByText('Isi modal'));
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole('presentation'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('memanggil onClose saat tombol Escape ditekan, tetapi tidak untuk tombol lain', () => {
    const onClose = vi.fn();
    render(
      <Modal title="Judul Modal" onClose={onClose}>
        <p>Isi modal</p>
      </Modal>,
    );

    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('berhenti mendengarkan tombol Escape setelah modal ditutup dari layar', () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <Modal title="Judul Modal" onClose={onClose}>
        <p>Isi modal</p>
      </Modal>,
    );

    unmount();
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });
});
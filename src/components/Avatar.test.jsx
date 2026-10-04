import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Avatar from './Avatar';

describe('Avatar', () => {
  it('menampilkan inisial saat pengguna belum punya foto', () => {
    render(<Avatar name="Delcom Testing" photo={null} />);

    const avatar = screen.getByRole('img', { name: 'Delcom Testing' });
    expect(avatar).toHaveTextContent('DT');
    expect(avatar).toHaveClass('h-10');
  });

  it('menampilkan foto dari domain API untuk path relatif', () => {
    render(<Avatar name="Budi" photo="img/users/budi.png" size="lg" />);

    const image = screen.getByRole('img', { name: 'Budi' });
    expect(image).toHaveAttribute(
      'src',
      'https://open-api.delcom.org/img/users/budi.png',
    );
    expect(image).toHaveClass('h-16');
  });

  it('menerapkan className tambahan', () => {
    render(<Avatar name="Budi" photo={null} className="ring-4" />);

    expect(screen.getByRole('img', { name: 'Budi' })).toHaveClass('ring-4');
  });

  it('kembali ke inisial jika foto gagal dimuat', () => {
    render(<Avatar name="Budi Santoso" photo="img/users/rusak.png" />);

    fireEvent.error(screen.getByRole('img', { name: 'Budi Santoso' }));

    const avatar = screen.getByRole('img', { name: 'Budi Santoso' });
    expect(avatar.tagName).toBe('DIV');
    expect(avatar).toHaveTextContent('BS');
  });
});
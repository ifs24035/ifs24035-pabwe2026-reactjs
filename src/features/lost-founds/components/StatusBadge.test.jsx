import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CompletedBadge, StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('menampilkan "Hilang" untuk status lost', () => {
    render(<StatusBadge status="lost" />);

    expect(screen.getByText('Hilang')).toHaveClass('bg-rose-100');
  });

  it('menampilkan "Ditemukan" untuk status found dan menerapkan className', () => {
    render(<StatusBadge status="found" className="absolute" />);

    const badge = screen.getByText('Ditemukan');
    expect(badge).toHaveClass('bg-emerald-100');
    expect(badge).toHaveClass('absolute');
  });
});

describe('CompletedBadge', () => {
  it('menampilkan "Selesai" jika sudah selesai', () => {
    render(<CompletedBadge isCompleted />);

    expect(screen.getByText('Selesai')).toHaveClass('bg-sky-100');
  });

  it('menampilkan "Proses" jika belum selesai dan menerapkan className', () => {
    render(<CompletedBadge isCompleted={false} className="absolute" />);

    const badge = screen.getByText('Proses');
    expect(badge).toHaveClass('bg-amber-100');
    expect(badge).toHaveClass('absolute');
  });
});
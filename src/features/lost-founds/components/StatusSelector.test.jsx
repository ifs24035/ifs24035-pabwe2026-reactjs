import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import StatusSelector from './StatusSelector';

describe('StatusSelector', () => {
  it('menandai opsi "Barang Hilang" saat value adalah lost', () => {
    render(<StatusSelector value="lost" onChange={vi.fn()} />);

    expect(screen.getByRole('radio', { name: /Barang Hilang/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radio', { name: /Barang Ditemukan/ })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('menandai opsi "Barang Ditemukan" saat value adalah found', () => {
    render(<StatusSelector value="found" onChange={vi.fn()} />);

    expect(screen.getByRole('radio', { name: /Barang Ditemukan/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radio', { name: /Barang Hilang/ })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('memanggil onChange dengan nilai opsi yang diklik', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<StatusSelector value="lost" onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: /Barang Ditemukan/ }));
    expect(onChange).toHaveBeenLastCalledWith('found');

    await user.click(screen.getByRole('radio', { name: /Barang Hilang/ }));
    expect(onChange).toHaveBeenLastCalledWith('lost');
  });
});
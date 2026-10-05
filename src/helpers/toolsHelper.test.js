import { beforeEach, describe, expect, it, vi } from 'vitest';
import Swal from 'sweetalert2';
import {
  formatApiDateTime,
  formatDate,
  getInitials,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from './toolsHelper';

vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }));

describe('toolsHelper', () => {
  beforeEach(() => {
    Swal.fire.mockReset();
  });

  it('showSuccessDialog menampilkan dialog sukses', async () => {
    await showSuccessDialog('Berhasil disimpan');
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: 'success', text: 'Berhasil disimpan' }),
    );
  });

  it('showErrorDialog menampilkan dialog error', async () => {
    await showErrorDialog('Gagal');
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: 'error', text: 'Gagal' }),
    );
  });

  it('showWarningDialog menampilkan dialog peringatan', async () => {
    await showWarningDialog('Hati-hati');
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: 'warning', text: 'Hati-hati' }),
    );
  });

  describe('showConfirmDialog', () => {
    it('mengembalikan true jika dikonfirmasi (teks default)', async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: true });

      await expect(showConfirmDialog('Hapus?', 'Yakin?')).resolves.toBe(true);
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ confirmButtonText: 'Ya, lanjutkan' }),
      );
    });

    it('mengembalikan false jika dibatalkan (teks kustom)', async () => {
      Swal.fire.mockResolvedValue({ isConfirmed: false });

      await expect(
        showConfirmDialog('Hapus?', 'Yakin?', 'Hapus'),
      ).resolves.toBe(false);
      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({ confirmButtonText: 'Hapus' }),
      );
    });
  });

  describe('formatDate', () => {
    it('mengembalikan "-" untuk nilai kosong', () => {
      expect(formatDate(null)).toBe('-');
      expect(formatDate('')).toBe('-');
    });
  
    describe('getInitials', () => {
    it('mengembalikan "?" untuk nama kosong atau hanya spasi', () => {
      expect(getInitials(null)).toBe('?');
      expect(getInitials('   ')).toBe('?');
    });

    describe('formatApiDateTime', () => {
    it('memformat tanggal ke YYYY-MM-DD HH:mm:ss', () => {
      expect(formatApiDateTime(new Date(2024, 9, 5, 7, 8, 9))).toBe(
        '2024-10-05 07:08:09',
      );
    });
  });

    it('mengambil huruf pertama dari satu kata', () => {
      expect(getInitials('budi')).toBe('B');
    });

    it('mengambil maksimal dua inisial', () => {
      expect(getInitials('Delcom Testing')).toBe('DT');
      expect(getInitials('ani budi cahya')).toBe('AB');
    });
  });

    it('mengembalikan "-" untuk tanggal tidak valid', () => {
      expect(formatDate('bukan-tanggal')).toBe('-');
    });

    it('memformat tanggal valid ke locale Indonesia', () => {
      const result = formatDate('2024-02-28T07:49:32.000000Z');
      expect(result).toContain('2024');
      expect(result).toContain('Februari');
    });
  });
});
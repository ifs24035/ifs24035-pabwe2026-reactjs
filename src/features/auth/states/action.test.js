import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  putAccessToken,
  removeAccessToken,
} from '../../../helpers/apiHelper';
import {
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper';
import { postLogin, postRegister } from '../api/authApi';
import {
  ActionType,
  asyncSetIsAuthLogin,
  asyncSetIsAuthLogout,
  asyncSetIsAuthRegister,
  setIsAuthLoginActionCreator,
  setIsAuthLogoutActionCreator,
  setIsAuthRegisterActionCreator,
} from './action';

vi.mock('../api/authApi', () => ({
  postLogin: vi.fn(),
  postRegister: vi.fn(),
}));
vi.mock('../../../helpers/apiHelper', () => ({
  putAccessToken: vi.fn(),
  removeAccessToken: vi.fn(),
}));
vi.mock('../../../helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe('auth action creators', () => {
  it('setIsAuthLoginActionCreator membuat action yang benar', () => {
    expect(setIsAuthLoginActionCreator(true)).toEqual({
      type: ActionType.SET_IS_AUTH_LOGIN,
      payload: { status: true },
    });
  });

  it('setIsAuthRegisterActionCreator membuat action yang benar', () => {
    expect(setIsAuthRegisterActionCreator(true)).toEqual({
      type: ActionType.SET_IS_AUTH_REGISTER,
      payload: { status: true },
    });
  });

  it('setIsAuthLogoutActionCreator membuat action yang benar', () => {
    expect(setIsAuthLogoutActionCreator(false)).toEqual({
      type: ActionType.SET_IS_AUTH_LOGOUT,
      payload: { status: false },
    });
  });
});

describe('auth async thunks', () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('asyncSetIsAuthLogin', () => {
    it('menyimpan token dan mengubah state saat login berhasil', async () => {
      postLogin.mockResolvedValue({
        success: true,
        message: 'Berhasil login',
        data: { token: 'token-123' },
      });

      const result = await asyncSetIsAuthLogin({
        email: 'a@b.com',
        password: 'secret1',
      })(dispatch);

      expect(postLogin).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'secret1',
      });
      expect(putAccessToken).toHaveBeenCalledWith('token-123');
      expect(dispatch).toHaveBeenCalledWith(setIsAuthLoginActionCreator(true));
      expect(dispatch).toHaveBeenCalledWith(setIsAuthLogoutActionCreator(false));
      expect(showSuccessDialog).toHaveBeenCalledWith('Berhasil login');
      expect(result).toBe(true);
    });

    it('menampilkan dialog error saat login gagal', async () => {
      postLogin.mockResolvedValue({ success: false, message: 'Email salah' });

      const result = await asyncSetIsAuthLogin({
        email: 'a@b.com',
        password: 'secret1',
      })(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith('Email salah');
      expect(putAccessToken).not.toHaveBeenCalled();
      expect(dispatch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('asyncSetIsAuthRegister', () => {
    it('mengubah state saat registrasi berhasil', async () => {
      postRegister.mockResolvedValue({
        success: true,
        message: 'Berhasil mendaftar',
      });

      const result = await asyncSetIsAuthRegister({
        name: 'Budi',
        email: 'a@b.com',
        password: 'secret1',
      })(dispatch);

      expect(postRegister).toHaveBeenCalledWith({
        name: 'Budi',
        email: 'a@b.com',
        password: 'secret1',
      });
      expect(dispatch).toHaveBeenCalledWith(
        setIsAuthRegisterActionCreator(true),
      );
      expect(showSuccessDialog).toHaveBeenCalledWith('Berhasil mendaftar');
      expect(result).toBe(true);
    });

    it('menampilkan dialog error saat registrasi gagal', async () => {
      postRegister.mockResolvedValue({
        success: false,
        message: 'Email sudah terdaftar',
      });

      const result = await asyncSetIsAuthRegister({
        name: 'Budi',
        email: 'a@b.com',
        password: 'secret1',
      })(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith('Email sudah terdaftar');
      expect(dispatch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('asyncSetIsAuthLogout', () => {
    it('menghapus token dan mengubah state logout', async () => {
      await asyncSetIsAuthLogout()(dispatch);

      expect(removeAccessToken).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledWith(setIsAuthLoginActionCreator(false));
      expect(dispatch).toHaveBeenCalledWith(setIsAuthLogoutActionCreator(true));
      expect(showSuccessDialog).toHaveBeenCalledWith('Anda berhasil keluar');
    });
  });
});
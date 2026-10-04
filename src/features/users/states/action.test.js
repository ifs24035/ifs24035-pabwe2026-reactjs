import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  showErrorDialog,
  showSuccessDialog,
} from '../../../helpers/toolsHelper';
import {
  getProfile,
  getUsers,
  postProfilePhoto,
  putProfile,
  putProfilePassword,
} from '../api/userApi';
import {
  ActionType,
  asyncGetProfile,
  asyncGetUsers,
  asyncSetIsChangeProfile,
  asyncSetIsChangeProfilePassword,
  asyncSetIsChangeProfilePhoto,
  setIsChangeProfileActionCreator,
  setIsChangeProfilePasswordActionCreator,
  setIsChangeProfilePhotoActionCreator,
  setIsProfileActionCreator,
  setProfileActionCreator,
  setUserActionCreator,
  setUsersActionCreator,
} from './action';

vi.mock('../api/userApi', () => ({
  getUsers: vi.fn(),
  getProfile: vi.fn(),
  putProfile: vi.fn(),
  postProfilePhoto: vi.fn(),
  putProfilePassword: vi.fn(),
}));
vi.mock('../../../helpers/toolsHelper', () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

describe('users action creators', () => {
  it('membuat action dengan type dan payload yang benar', () => {
    expect(setUsersActionCreator([{ id: 1 }])).toEqual({
      type: ActionType.SET_USERS,
      payload: { users: [{ id: 1 }] },
    });
    expect(setUserActionCreator({ id: 1 })).toEqual({
      type: ActionType.SET_USER,
      payload: { user: { id: 1 } },
    });
    expect(setProfileActionCreator({ id: 2 })).toEqual({
      type: ActionType.SET_PROFILE,
      payload: { profile: { id: 2 } },
    });
    expect(setIsProfileActionCreator(true)).toEqual({
      type: ActionType.SET_IS_PROFILE,
      payload: { status: true },
    });
    expect(setIsChangeProfileActionCreator(true)).toEqual({
      type: ActionType.SET_IS_CHANGE_PROFILE,
      payload: { status: true },
    });
    expect(setIsChangeProfilePhotoActionCreator(false)).toEqual({
      type: ActionType.SET_IS_CHANGE_PROFILE_PHOTO,
      payload: { status: false },
    });
    expect(setIsChangeProfilePasswordActionCreator(true)).toEqual({
      type: ActionType.SET_IS_CHANGE_PROFILE_PASSWORD,
      payload: { status: true },
    });
  });
});

describe('users async thunks', () => {
  const dispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('asyncGetUsers', () => {
    it('menyimpan daftar pengguna saat berhasil', async () => {
      getUsers.mockResolvedValue({
        success: true,
        data: { users: [{ id: 1 }] },
      });

      const result = await asyncGetUsers()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setUsersActionCreator([{ id: 1 }]));
      expect(result).toBe(true);
    });

    it('menampilkan dialog error saat gagal', async () => {
      getUsers.mockResolvedValue({ success: false, message: 'Gagal memuat' });

      const result = await asyncGetUsers()(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith('Gagal memuat');
      expect(dispatch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('asyncGetProfile', () => {
    it('menyimpan profil dan menandai sudah dimuat saat berhasil', async () => {
      getProfile.mockResolvedValue({
        success: true,
        data: { user: { id: 2, name: 'Budi' } },
      });

      const result = await asyncGetProfile()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(
        setProfileActionCreator({ id: 2, name: 'Budi' }),
      );
      expect(dispatch).toHaveBeenCalledWith(setIsProfileActionCreator(true));
      expect(result).toBe(true);
    });

    it('mengosongkan profil tanpa dialog saat gagal', async () => {
      getProfile.mockResolvedValue({ success: false, message: 'Unauthenticated' });

      const result = await asyncGetProfile()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setProfileActionCreator(null));
      expect(dispatch).toHaveBeenCalledWith(setIsProfileActionCreator(false));
      expect(showErrorDialog).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('asyncSetIsChangeProfile', () => {
    it('mengubah state dan menampilkan dialog sukses', async () => {
      putProfile.mockResolvedValue({ success: true, message: 'Profil diubah' });

      const result = await asyncSetIsChangeProfile({
        name: 'Budi',
        email: 'budi@mail.com',
      })(dispatch);

      expect(putProfile).toHaveBeenCalledWith({
        name: 'Budi',
        email: 'budi@mail.com',
      });
      expect(dispatch).toHaveBeenCalledWith(setIsChangeProfileActionCreator(true));
      expect(showSuccessDialog).toHaveBeenCalledWith('Profil diubah');
      expect(result).toBe(true);
    });

    it('menampilkan dialog error saat gagal', async () => {
      putProfile.mockResolvedValue({ success: false, message: 'Email dipakai' });

      const result = await asyncSetIsChangeProfile({
        name: 'Budi',
        email: 'budi@mail.com',
      })(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith('Email dipakai');
      expect(dispatch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('asyncSetIsChangeProfilePhoto', () => {
    const file = new File(['isi'], 'foto.png', { type: 'image/png' });

    it('mengubah state dan menampilkan dialog sukses', async () => {
      postProfilePhoto.mockResolvedValue({ success: true, message: 'Foto diubah' });

      const result = await asyncSetIsChangeProfilePhoto(file)(dispatch);

      expect(postProfilePhoto).toHaveBeenCalledWith(file);
      expect(dispatch).toHaveBeenCalledWith(
        setIsChangeProfilePhotoActionCreator(true),
      );
      expect(showSuccessDialog).toHaveBeenCalledWith('Foto diubah');
      expect(result).toBe(true);
    });

    it('menampilkan dialog error saat gagal', async () => {
      postProfilePhoto.mockResolvedValue({ success: false, message: 'Foto besar' });

      const result = await asyncSetIsChangeProfilePhoto(file)(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith('Foto besar');
      expect(dispatch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('asyncSetIsChangeProfilePassword', () => {
    it('mengubah state dan menampilkan dialog sukses', async () => {
      putProfilePassword.mockResolvedValue({
        success: true,
        message: 'Sandi diubah',
      });

      const result = await asyncSetIsChangeProfilePassword({
        password: 'lama123',
        newPassword: 'baru456',
      })(dispatch);

      expect(putProfilePassword).toHaveBeenCalledWith({
        password: 'lama123',
        newPassword: 'baru456',
      });
      expect(dispatch).toHaveBeenCalledWith(
        setIsChangeProfilePasswordActionCreator(true),
      );
      expect(showSuccessDialog).toHaveBeenCalledWith('Sandi diubah');
      expect(result).toBe(true);
    });

    it('menampilkan dialog error saat gagal', async () => {
      putProfilePassword.mockResolvedValue({
        success: false,
        message: 'Sandi lama salah',
      });

      const result = await asyncSetIsChangeProfilePassword({
        password: 'salah',
        newPassword: 'baru456',
      })(dispatch);

      expect(showErrorDialog).toHaveBeenCalledWith('Sandi lama salah');
      expect(dispatch).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
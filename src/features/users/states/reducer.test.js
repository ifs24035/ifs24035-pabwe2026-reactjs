import { describe, expect, it } from 'vitest';
import { setIsAuthLogoutActionCreator } from '../../auth/states/action';
import {
  setIsChangeProfileActionCreator,
  setIsChangeProfilePasswordActionCreator,
  setIsChangeProfilePhotoActionCreator,
  setIsProfileActionCreator,
  setProfileActionCreator,
  setUserActionCreator,
  setUsersActionCreator,
} from './action';
import {
  isChangeProfilePasswordReducer,
  isChangeProfilePhotoReducer,
  isChangeProfileReducer,
  isProfileReducer,
  profileReducer,
  userReducer,
  usersReducer,
} from './reducer';

const UNKNOWN = { type: 'UNKNOWN' };

describe('usersReducer', () => {
  it('bernilai awal array kosong', () => {
    expect(usersReducer(undefined, UNKNOWN)).toEqual([]);
  });

  it('menyimpan daftar pengguna', () => {
    expect(usersReducer([], setUsersActionCreator([{ id: 1 }]))).toEqual([
      { id: 1 },
    ]);
  });
});

describe('userReducer', () => {
  it('bernilai awal null', () => {
    expect(userReducer(undefined, UNKNOWN)).toBeNull();
  });

  it('menyimpan pengguna terpilih', () => {
    expect(userReducer(null, setUserActionCreator({ id: 1 }))).toEqual({ id: 1 });
  });
});

describe('profileReducer', () => {
  it('bernilai awal null', () => {
    expect(profileReducer(undefined, UNKNOWN)).toBeNull();
  });

  it('menyimpan profil', () => {
    expect(profileReducer(null, setProfileActionCreator({ id: 2 }))).toEqual({
      id: 2,
    });
  });

  it('dikosongkan saat logout', () => {
    expect(
      profileReducer({ id: 2 }, setIsAuthLogoutActionCreator(true)),
    ).toBeNull();
  });

  it('dipertahankan saat status logout false (login ulang)', () => {
    expect(
      profileReducer({ id: 2 }, setIsAuthLogoutActionCreator(false)),
    ).toEqual({ id: 2 });
  });
});

describe('isProfileReducer', () => {
  it('bernilai awal false', () => {
    expect(isProfileReducer(undefined, UNKNOWN)).toBe(false);
  });

  it('mengikuti SET_IS_PROFILE', () => {
    expect(isProfileReducer(false, setIsProfileActionCreator(true))).toBe(true);
  });

  it('di-reset menjadi false saat logout', () => {
    expect(isProfileReducer(true, setIsAuthLogoutActionCreator(true))).toBe(false);
  });

  it('dipertahankan saat status logout false', () => {
    expect(isProfileReducer(true, setIsAuthLogoutActionCreator(false))).toBe(true);
  });
});

describe('isChangeProfileReducer', () => {
  it('bernilai awal false dan mengikuti action', () => {
    expect(isChangeProfileReducer(undefined, UNKNOWN)).toBe(false);
    expect(
      isChangeProfileReducer(false, setIsChangeProfileActionCreator(true)),
    ).toBe(true);
  });
});

describe('isChangeProfilePhotoReducer', () => {
  it('bernilai awal false dan mengikuti action', () => {
    expect(isChangeProfilePhotoReducer(undefined, UNKNOWN)).toBe(false);
    expect(
      isChangeProfilePhotoReducer(false, setIsChangeProfilePhotoActionCreator(true)),
    ).toBe(true);
  });
});

describe('isChangeProfilePasswordReducer', () => {
  it('bernilai awal false dan mengikuti action', () => {
    expect(isChangeProfilePasswordReducer(undefined, UNKNOWN)).toBe(false);
    expect(
      isChangeProfilePasswordReducer(
        false,
        setIsChangeProfilePasswordActionCreator(true),
      ),
    ).toBe(true);
  });
});
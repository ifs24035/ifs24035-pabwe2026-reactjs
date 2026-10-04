import { beforeEach, describe, expect, it } from 'vitest';
import {
  setIsAuthLoginActionCreator,
  setIsAuthLogoutActionCreator,
  setIsAuthRegisterActionCreator,
} from './action';
import {
  isAuthLoginReducer,
  isAuthLogoutReducer,
  isAuthRegisterReducer,
} from './reducer';

describe('isAuthLoginReducer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('bernilai false jika token belum tersimpan', () => {
    expect(isAuthLoginReducer(undefined, { type: 'UNKNOWN' })).toBe(false);
  });

  it('bernilai true jika token sudah tersimpan', () => {
    localStorage.setItem('accessToken', 'token-123');
    expect(isAuthLoginReducer(undefined, { type: 'UNKNOWN' })).toBe(true);
  });

  it('mengubah state saat SET_IS_AUTH_LOGIN', () => {
    expect(isAuthLoginReducer(false, setIsAuthLoginActionCreator(true))).toBe(
      true,
    );
  });

  it('mengabaikan action lain', () => {
    expect(isAuthLoginReducer(true, setIsAuthRegisterActionCreator(false))).toBe(
      true,
    );
  });
});

describe('isAuthRegisterReducer', () => {
  it('bernilai awal false', () => {
    expect(isAuthRegisterReducer(undefined, { type: 'UNKNOWN' })).toBe(false);
  });

  it('mengubah state saat SET_IS_AUTH_REGISTER', () => {
    expect(
      isAuthRegisterReducer(false, setIsAuthRegisterActionCreator(true)),
    ).toBe(true);
  });
});

describe('isAuthLogoutReducer', () => {
  it('bernilai awal false', () => {
    expect(isAuthLogoutReducer(undefined, { type: 'UNKNOWN' })).toBe(false);
  });

  it('mengubah state saat SET_IS_AUTH_LOGOUT', () => {
    expect(isAuthLogoutReducer(false, setIsAuthLogoutActionCreator(true))).toBe(
      true,
    );
  });
});
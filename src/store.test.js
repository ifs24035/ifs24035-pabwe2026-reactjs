import { describe, expect, it } from 'vitest';
import store from './store';

const expectedKeys = [
  // auth
  'isAuthLogin',
  'isAuthRegister',
  'isAuthLogout',
  // users
  'users',
  'user',
  'profile',
  'isProfile',
  'isChangeProfile',
  'isChangeProfilePhoto',
  'isChangeProfilePassword',
  // lost-founds
  'lostFounds',
  'lostFound',
  'isLostFound',
  'isLostFoundAdd',
  'isLostFoundAdded',
  'isLostFoundChange',
  'isLostFoundChanged',
  'isLostFoundChangeCover',
  'isLostFoundChangedCover',
  'isLostFoundDelete',
  'isLostFoundDeleted',
  'lostFoundStats',
];

describe('store', () => {
  it('memiliki method dasar redux store', () => {
    expect(typeof store.getState).toBe('function');
    expect(typeof store.dispatch).toBe('function');
    expect(typeof store.subscribe).toBe('function');
  });

  it('mendaftarkan semua reducer ke dalam state', () => {
    const state = store.getState();
    expectedKeys.forEach((key) => {
      expect(state).toHaveProperty(key);
    });
  });

  it('tidak memiliki key reducer di luar yang didaftarkan', () => {
    expect(Object.keys(store.getState()).sort()).toEqual([...expectedKeys].sort());
  });

  it('state tidak berubah ketika menerima action yang tidak dikenal', () => {
    const before = store.getState();
    store.dispatch({ type: 'UNKNOWN_ACTION_FOR_TEST' });
    expect(store.getState()).toEqual(before);
  });
});
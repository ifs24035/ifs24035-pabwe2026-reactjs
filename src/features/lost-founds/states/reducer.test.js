import { describe, expect, it } from 'vitest';
import {
  setIsLostFoundActionCreator,
  setIsLostFoundAddActionCreator,
  setIsLostFoundAddedActionCreator,
  setIsLostFoundChangeActionCreator,
  setIsLostFoundChangeCoverActionCreator,
  setIsLostFoundChangedActionCreator,
  setIsLostFoundChangedCoverActionCreator,
  setIsLostFoundDeleteActionCreator,
  setIsLostFoundDeletedActionCreator,
  setLostFoundActionCreator,
  setLostFoundsActionCreator,
  setLostFoundStatsActionCreator,
} from './action';
import {
  isLostFoundAddedReducer,
  isLostFoundAddReducer,
  isLostFoundChangedCoverReducer,
  isLostFoundChangedReducer,
  isLostFoundChangeCoverReducer,
  isLostFoundChangeReducer,
  isLostFoundDeletedReducer,
  isLostFoundDeleteReducer,
  isLostFoundReducer,
  lostFoundReducer,
  lostFoundsReducer,
  lostFoundStatsReducer,
} from './reducer';

const UNKNOWN = { type: 'UNKNOWN' };

describe('lostFoundsReducer', () => {
  it('bernilai awal array kosong', () => {
    expect(lostFoundsReducer(undefined, UNKNOWN)).toEqual([]);
  });

  it('menyimpan daftar laporan', () => {
    expect(lostFoundsReducer([], setLostFoundsActionCreator([{ id: 1 }]))).toEqual([
      { id: 1 },
    ]);
  });
});

describe('lostFoundReducer', () => {
  it('bernilai awal null', () => {
    expect(lostFoundReducer(undefined, UNKNOWN)).toBeNull();
  });

  it('menyimpan detail laporan', () => {
    expect(lostFoundReducer(null, setLostFoundActionCreator({ id: 1 }))).toEqual({
      id: 1,
    });
  });
});

describe('lostFoundStatsReducer', () => {
  it('bernilai awal null', () => {
    expect(lostFoundStatsReducer(undefined, UNKNOWN)).toBeNull();
  });

  it('menyimpan statistik', () => {
    expect(
      lostFoundStatsReducer(null, setLostFoundStatsActionCreator({ total: 3 })),
    ).toEqual({ total: 3 });
  });
});

describe.each([
  ['isLostFoundReducer', isLostFoundReducer, setIsLostFoundActionCreator],
  ['isLostFoundAddReducer', isLostFoundAddReducer, setIsLostFoundAddActionCreator],
  [
    'isLostFoundAddedReducer',
    isLostFoundAddedReducer,
    setIsLostFoundAddedActionCreator,
  ],
  [
    'isLostFoundChangeReducer',
    isLostFoundChangeReducer,
    setIsLostFoundChangeActionCreator,
  ],
  [
    'isLostFoundChangedReducer',
    isLostFoundChangedReducer,
    setIsLostFoundChangedActionCreator,
  ],
  [
    'isLostFoundChangeCoverReducer',
    isLostFoundChangeCoverReducer,
    setIsLostFoundChangeCoverActionCreator,
  ],
  [
    'isLostFoundChangedCoverReducer',
    isLostFoundChangedCoverReducer,
    setIsLostFoundChangedCoverActionCreator,
  ],
  [
    'isLostFoundDeleteReducer',
    isLostFoundDeleteReducer,
    setIsLostFoundDeleteActionCreator,
  ],
  [
    'isLostFoundDeletedReducer',
    isLostFoundDeletedReducer,
    setIsLostFoundDeletedActionCreator,
  ],
])('%s', (_name, reducer, creator) => {
  it('bernilai awal false', () => {
    expect(reducer(undefined, UNKNOWN)).toBe(false);
  });

  it('mengikuti action yang sesuai', () => {
    expect(reducer(false, creator(true))).toBe(true);
    expect(reducer(true, creator(false))).toBe(false);
  });

  it('mengabaikan action lain', () => {
    expect(reducer(true, setLostFoundActionCreator(null))).toBe(true);
  });
});
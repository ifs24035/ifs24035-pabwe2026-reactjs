import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import useInput from './useInput';

describe('useInput', () => {
  it('memakai string kosong sebagai nilai awal default', () => {
    const { result } = renderHook(() => useInput());
    expect(result.current[0]).toBe('');
  });

  it('memakai nilai awal yang diberikan', () => {
    const { result } = renderHook(() => useInput('halo'));
    expect(result.current[0]).toBe('halo');
  });

  it('mengubah nilai lewat onChange', () => {
    const { result } = renderHook(() => useInput(''));

    act(() => {
      result.current[1]({ target: { value: 'baru' } });
    });

    expect(result.current[0]).toBe('baru');
  });

  it('mengubah nilai lewat setter', () => {
    const { result } = renderHook(() => useInput(''));

    act(() => {
      result.current[2]('diset');
    });

    expect(result.current[0]).toBe('diset');
  });
});
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useYupHookValidate, { yup } from './useYupHookValidate';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Required'),
  name: yup.string().min(2, 'Too short').required('Required'),
});

async function flushValidation(timeout = 300) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(timeout);
  });
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('useYupHookValidate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reports field errors through updateErrorsCallback after debounce', async () => {
    const updateErrorsCallback = vi.fn();
    const formState = { email: 'not-an-email', name: '' };

    const { result } = renderHook(() =>
      useYupHookValidate({
        validationSchema: schema,
        formState,
        updateErrorsCallback,
        validationTimeout: 300,
      })
    );

    act(() => {
      result.current[0]('email')();
    });

    await flushValidation();

    expect(updateErrorsCallback).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'Invalid email' })
    );
  });

  it('clears field error when value becomes valid', async () => {
    let latestErrors: Record<string, string> = {};
    const updateErrorsCallback = vi.fn((next) => {
      latestErrors = next;
    });

    const { result, rerender } = renderHook(
      ({ formState }) =>
        useYupHookValidate({
          validationSchema: schema,
          formState,
          updateErrorsCallback,
          validationTimeout: 100,
        }),
      { initialProps: { formState: { email: 'bad', name: '' } } }
    );

    act(() => {
      result.current[0]('email')();
    });
    await flushValidation(100);

    expect(latestErrors.email).toBe('Invalid email');

    rerender({ formState: { email: 'user@example.com', name: '' } });

    act(() => {
      result.current[0]('email')();
    });
    await flushValidation(100);

    expect(latestErrors.email).toBeUndefined();
  });

  it('debounces rapid validateField calls into a single validation run', async () => {
    const validateAtSpy = vi.spyOn(schema, 'validateAt');
    const validateSpy = vi.spyOn(schema, 'validate');
    const updateErrorsCallback = vi.fn();

    const { result } = renderHook(() =>
      useYupHookValidate({
        validationSchema: schema,
        formState: { email: 'bad', name: '' },
        updateErrorsCallback,
        validationTimeout: 300,
      })
    );

    act(() => {
      const validateEmail = result.current[0]('email');
      validateEmail();
      validateEmail();
      validateEmail();
    });

    await flushValidation();

    expect(validateAtSpy).toHaveBeenCalledTimes(1);
    expect(validateSpy).toHaveBeenCalledTimes(1);

    validateAtSpy.mockRestore();
    validateSpy.mockRestore();
  });

  it('sets isFormValid when the full schema passes', async () => {
    const { result, rerender } = renderHook(
      ({ formState }) =>
        useYupHookValidate({
          validationSchema: schema,
          formState,
          updateErrorsCallback: vi.fn(),
          validationTimeout: 100,
        }),
      { initialProps: { formState: { email: 'user@example.com', name: 'Jo' } } }
    );

    act(() => {
      result.current[0]('name')();
    });
    await flushValidation(100);

    expect(result.current[1]).toBe(true);

    rerender({ formState: { email: 'user@example.com', name: 'J' } });

    act(() => {
      result.current[0]('name')();
    });
    await flushValidation(100);

    expect(result.current[1]).toBe(false);
  });

  it('invokes onSuccess when field validation passes', async () => {
    const onSuccess = vi.fn();

    const { result } = renderHook(() =>
      useYupHookValidate({
        validationSchema: schema,
        formState: { email: 'user@example.com', name: 'John' },
        updateErrorsCallback: vi.fn(),
        validationTimeout: 100,
      })
    );

    act(() => {
      result.current[0]('email', onSuccess)();
    });
    await flushValidation(100);

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('reset clears errors and form validity', async () => {
    const updateErrorsCallback = vi.fn();

    const { result } = renderHook(() =>
      useYupHookValidate({
        validationSchema: schema,
        formState: { email: 'bad', name: '' },
        updateErrorsCallback,
        validationTimeout: 100,
      })
    );

    act(() => {
      result.current[0]('email')();
    });
    await flushValidation(100);

    expect(updateErrorsCallback).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'Invalid email' })
    );

    act(() => {
      result.current[2]();
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });

    expect(result.current[1]).toBe(false);
    expect(updateErrorsCallback).toHaveBeenLastCalledWith({});
  });

  it('validates nested field paths', async () => {
    const nestedSchema = yup.object({
      address: yup.object({
        city: yup.string().required('City required'),
      }),
    });

    const updateErrorsCallback = vi.fn();

    const { result } = renderHook(() =>
      useYupHookValidate({
        validationSchema: nestedSchema,
        formState: { address: { city: '' } },
        updateErrorsCallback,
        validationTimeout: 100,
      })
    );

    act(() => {
      result.current[0]('address.city')();
    });
    await flushValidation(100);

    expect(updateErrorsCallback).toHaveBeenCalledWith(
      expect.objectContaining({ address: { city: 'City required' } })
    );
  });
});

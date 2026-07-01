import { ObjectSchema, AnySchema } from 'yup';
import * as yup from 'yup';
import { useState, useEffect, useRef, useCallback } from 'react';
import get from 'lodash/get';
import set from 'lodash/set';
import unset from 'lodash/unset';
import isEmpty from 'lodash/isEmpty';
import debounce from 'lodash/debounce';
import { addCustomMethods } from './utils';

addCustomMethods(yup as any);

export { yup };

export interface UseYupHookValidateParams<TForm extends Record<string, any>> {
  validationSchema: ObjectSchema<any> | AnySchema; // Flexibility for nested schemas
  formState: TForm;
  updateErrorsCallback?: (errors: Record<string, any>) => void;
  validationTimeout?: number;
}

export type ValidateFieldFn = (onSuccess?: () => void) => void;

export type UseYupHookValidateReturn = [
  (fieldPath: string, onSuccess?: () => void) => () => void,
  boolean,
  () => void,
];

function shallowEqualErrors(
  a: Record<string, any>,
  b: Record<string, any>
): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

/**
 * React hook that validates an entire form and individual fields using Yup
 * Returns: [validateFieldGenerator, isValid, reset]
 */
export default function useYupHookValidate<TForm extends Record<string, any>>({
  validationSchema,
  formState,
  updateErrorsCallback = () => {},
  validationTimeout = 300,
}: UseYupHookValidateParams<TForm>): UseYupHookValidateReturn {
  const [params, setParams] = useState<{
    fieldPath?: string;
    onSuccess?: () => void;
  }>({});
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [valid, setValid] = useState(false);

  const paramsRef = useRef(params);
  paramsRef.current = params;

  const formStateRef = useRef(formState);
  formStateRef.current = formState;

  const validationSchemaRef = useRef(validationSchema);
  validationSchemaRef.current = validationSchema;

  const validateForm = useCallback(() => {
    validationSchemaRef.current
      .validate(formStateRef.current, { abortEarly: false })
      .then(() => setValid(true))
      .catch(() => setValid(false));
  }, []);

  const validatePath = useCallback(() => {
    const { fieldPath, onSuccess } = paramsRef.current;
    if (!fieldPath) return;

    validationSchemaRef.current
      .validateAt(fieldPath, formStateRef.current)
      .then(() => {
        setErrors((prev) => {
          if (!get(prev, fieldPath)) return prev;
          const next = { ...prev };
          unset(next, fieldPath);
          return next;
        });
        onSuccess?.();
      })
      .catch((err: any) => {
        const path = err.path ?? fieldPath;
        const message = err.message;
        setErrors((prev) => {
          if (get(prev, path) === message) return prev;
          const next = { ...prev };
          set(next, path, message);
          return next;
        });
      });
  }, []);

  const debouncedValidateRef = useRef<ReturnType<typeof debounce>>();

  useEffect(() => {
    debouncedValidateRef.current?.cancel();
    debouncedValidateRef.current = debounce(() => {
      validateForm();
      validatePath();
    }, validationTimeout);

    return () => debouncedValidateRef.current?.cancel();
  }, [validationTimeout, validateForm, validatePath]);

  useEffect(() => {
    if (!isEmpty(params)) debouncedValidateRef.current?.();
  }, [params]);

  const validateField = (fieldPath: string, onSuccess?: () => void) => () => {
    setParams({ fieldPath, onSuccess });
  };

  const reset = () => {
    setValid(false);
    setErrors({});
    setTimeout(() => updateErrorsCallback({}), 1);
  };

  const updateErrorsCallbackRef = useRef(updateErrorsCallback);
  updateErrorsCallbackRef.current = updateErrorsCallback;

  const prevErrorsRef = useRef(errors);
  useEffect(() => {
    if (shallowEqualErrors(prevErrorsRef.current, errors)) return;
    prevErrorsRef.current = errors;
    updateErrorsCallbackRef.current(errors);
  }, [errors]);

  return [validateField, valid, reset];
}

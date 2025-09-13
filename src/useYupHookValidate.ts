import * as yup from 'yup';
import { useState, useEffect, useRef, useCallback } from 'react';
import { assign, set, unset, isEmpty, debounce } from 'lodash';
import { addCustomMethods } from './utils';

addCustomMethods(yup as any);

export { yup };

export interface UseYupHookValidateParams<TForm extends Record<string, any>> {
  validationSchema: yup.ObjectSchema<any> | yup.AnySchema; // Flexibility for nested schemas
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
    formState?: TForm;
    onSuccess?: () => void;
  }>({});
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [valid, setValid] = useState(false);

  const validateForm = useCallback(() => {
    validationSchema
      .validate(formState, { abortEarly: false })
      .then(() => setValid(true))
      .catch(() => setValid(false));
  }, [validationSchema, formState]);
  const validateFormRef = useRef(validateForm);

  const validatePath = useCallback(() => {
    const { fieldPath, onSuccess } = params;
    if (!isEmpty(params) && fieldPath) {
      (validationSchema as any)
        .validateAt(fieldPath, formState)
        .then(() => {
          const errAux = { ...errors };
          unset(errAux, fieldPath);
          setErrors(errAux);
          onSuccess && onSuccess();
        })
        .catch((err: any) => {
          const errAux = { ...errors };
          set(errAux, err.path, err.message);
          const assignedErrors = assign({}, errors, errAux);
          setErrors(assignedErrors);
        });
    }
  }, [params, validationSchema, formState, errors]);

  const validatePathRef = useRef(validatePath);

  const callback = useCallback(() => {
    const fn = debounce(() => {
      validateFormRef.current();
      validatePathRef.current();
    }, validationTimeout);
    fn();
  }, [validationTimeout]);

  useEffect(() => {
    validateFormRef.current = validateForm;
    validatePathRef.current = validatePath;
  }, [validateForm, validatePath]);

  useEffect(() => {
    if (!isEmpty(params)) callback();
  }, [params, callback]);

  const validateField = (fieldPath: string, onSuccess?: () => void) => () => {
    setParams({
      fieldPath,
      formState,
      onSuccess,
    });
  };

  const reset = () => {
    setValid(false);
    setErrors({});
    setTimeout(() => updateErrorsCallback({}), 1);
  };

  useEffect(() => {
    updateErrorsCallback(errors);
  }, [errors, updateErrorsCallback]);

  return [validateField, valid, reset];
}

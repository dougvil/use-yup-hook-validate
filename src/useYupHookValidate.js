import * as yup from 'yup';
import { useState, useEffect, useRef, useCallback } from 'react';
import { assign, set, unset, isEmpty, debounce } from 'lodash';
import { addCustomMethods } from './utils';

addCustomMethods(yup);

export { yup };

export default function useYupHookValidate({
  validationSchema,
  formState,
  updateErrorsCallback = () => {},
  validationTimeout = 300,
}) {
  const [params, setParams] = useState({});
  const [errors, setErrors] = useState({});
  const [valid, setValid] = useState(false);

  const validateForm = () => {
    validationSchema
      .validate(formState, { abortEarly: false })
      .then(() => setValid(true))
      .catch(() => {
        setValid(false);
      });
  };
  const validateFormRef = useRef(validateForm);

  const validatePath = () => {
    const { fieldPath, onSuccess } = params;
    if (!isEmpty(params)) {
      validationSchema
        .validateAt(fieldPath, formState)
        .then(() => {
          const errAux = { ...errors };
          unset(errAux, fieldPath);
          setErrors(errAux);
          onSuccess && onSuccess();
        })
        .catch((err) => {
          const errAux = { ...errors };
          set(errAux, err.path, err.message);
          const assignedErrors = assign({}, errors, errAux);
          setErrors(assignedErrors);
        });
    }
  };

  const validatePathRef = useRef(validatePath);

  const callback = useCallback(
    debounce(() => {
      validateFormRef.current();
      validatePathRef.current();
    }, validationTimeout),
    []
  );

  useEffect(() => {
    validateFormRef.current = validateForm;
    validatePathRef.current = validatePath;
  }, [params]);

  useEffect(() => {
    if (!isEmpty(params)) callback();
  }, [params]);

  const validateField = (fieldPath, onSuccess) => () => {
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
  }, [errors]);

  return [validateField, valid, reset];
}

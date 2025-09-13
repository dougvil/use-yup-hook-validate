import * as yup from 'yup';
import { isCnpj, isCpf } from './validations';

declare module 'yup' {
  // augment existing interface (don't redefine generics)
  interface StringSchema {
    fullname(message?: string): this;
    cnpjOrCpf(message?: string): this;
    cpf(message?: string): this;
    cnpj(message?: string): this;
    phone(): this;
  }
}

type TestFn = (value: unknown) => boolean | Promise<boolean>;

export function addCustomMethods(y: typeof yup) {
  y.addMethod<yup.StringSchema>(y.string, 'fullname', function (message?: string) {
    return (this as yup.StringSchema).test(
      'fullname',
      message || 'Invalid full name',
      function (this: any, value: unknown) {
        const { path, createError } = this;
        const arrStr = String(value || '').split(' ');
        return (arrStr.length > 1 && !!arrStr[1]) || createError({ path, message });
      } as TestFn
    );
  });

  y.addMethod<yup.StringSchema>(y.string, 'cnpjOrCpf', function (message?: string) {
    return (this as yup.StringSchema).test(
      'cnpjOrCpf',
      message || 'Invalid CNPJ/CPF',
      function (this: any, value: unknown) {
        const { path, createError } = this;
        return (
          isCnpj(String(value || '')) ||
          isCpf(String(value || '')) ||
          createError({ path, message })
        );
      } as TestFn
    );
  });

  y.addMethod<yup.StringSchema>(y.string, 'cpf', function (message?: string) {
    return (this as yup.StringSchema).test('cpf', message || 'Invalid CPF', function (
      this: any,
      value: unknown
    ) {
      const { path, createError } = this;
      return isCpf(String(value || '')) || createError({ path, message });
    } as TestFn);
  });

  y.addMethod<yup.StringSchema>(y.string, 'cnpj', function (message?: string) {
    return (this as yup.StringSchema).test('cnpj', message || 'Invalid CNPJ', function (
      this: any,
      value: unknown
    ) {
      const { path, createError } = this;
      return isCnpj(String(value || '')) || createError({ path, message });
    } as TestFn);
  });

  y.addMethod<yup.StringSchema>(y.string, 'phone', function () {
    // hyphen does not need escaping inside character class context here; keeping simple pattern
    return (y.string() as yup.StringSchema).matches(/(\(?\d{2}\)?\s)?(\d{4,5}-?\d{4})/);
  });
}

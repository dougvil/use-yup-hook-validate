import { isCnpj, isCpf } from './validations';

export function addCustomMethods(yup) {
  yup.addMethod(yup.string, 'fullname', function (message) {
    return this.test('fullname', message, function (value) {
      const { path, createError } = this;
      const arrStr = String(value).split(' ');
      return (
        (arrStr.length > 1 && !!arrStr[1]) || createError({ path, message })
      );
    });
  });

  yup.addMethod(yup.string, 'cnpjOrCpf', function (message) {
    return this.test('cnpjOrCpf', message, function (value) {
      const { path, createError } = this;
      return isCnpj(value) || isCpf(value) || createError({ path, message });
    });
  });
  yup.addMethod(yup.string, 'cpf', function (message) {
    return this.test('cnpjOrCpf', message, function (value) {
      const { path, createError } = this;
      return isCpf(value) || createError({ path, message });
    });
  });
  yup.addMethod(yup.string, 'cnpj', function (message) {
    return this.test('cnpjOrCpf', message, function (value) {
      const { path, createError } = this;
      return isCnpj(value) || createError({ path, message });
    });
  });
  yup.addMethod(yup.string, 'phone', function () {
    return yup.string().matches(/(\(?\d{2}\)?\s)?(\d{4,5}\-?\d{4})/);
  });
}

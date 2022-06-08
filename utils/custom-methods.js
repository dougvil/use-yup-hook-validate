"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addCustomMethods = addCustomMethods;

var _validations = require("./validations");

function addCustomMethods(yup) {
  yup.addMethod(yup.string, 'fullname', function (message) {
    return this.test('fullname', message, function (value) {
      var path = this.path,
          createError = this.createError;
      var arrStr = String(value).split(' ');
      return arrStr.length > 1 && !!arrStr[1] || createError({
        path: path,
        message: message
      });
    });
  });
  yup.addMethod(yup.string, 'cnpjOrCpf', function (message) {
    return this.test('cnpjOrCpf', message, function (value) {
      var path = this.path,
          createError = this.createError;
      return (0, _validations.isCnpj)(value) || (0, _validations.isCpf)(value) || createError({
        path: path,
        message: message
      });
    });
  });
  yup.addMethod(yup.string, 'cpf', function (message) {
    return this.test('cnpjOrCpf', message, function (value) {
      var path = this.path,
          createError = this.createError;
      return (0, _validations.isCpf)(value) || createError({
        path: path,
        message: message
      });
    });
  });
  yup.addMethod(yup.string, 'cnpj', function (message) {
    return this.test('cnpjOrCpf', message, function (value) {
      var path = this.path,
          createError = this.createError;
      return (0, _validations.isCnpj)(value) || createError({
        path: path,
        message: message
      });
    });
  });
  yup.addMethod(yup.string, 'phone', function () {
    return yup.string().matches(/(\(?\d{2}\)?\s)?(\d{4,5}\-?\d{4})/);
  });
}
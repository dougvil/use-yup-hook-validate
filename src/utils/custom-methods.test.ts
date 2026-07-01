import { describe, it, expect } from 'vitest';
import * as yup from 'yup';
import { addCustomMethods } from './custom-methods';

addCustomMethods(yup);

describe('addCustomMethods', () => {
  describe('fullname', () => {
    const schema = yup.object({
      name: yup.string().fullname('Enter full name').required(),
    });

    it('accepts first and last name', async () => {
      await expect(schema.validate({ name: 'John Doe' })).resolves.toEqual({
        name: 'John Doe',
      });
    });

    it('rejects single word names', async () => {
      await expect(schema.validate({ name: 'John' })).rejects.toThrow('Enter full name');
    });
  });

  describe('cpf', () => {
    const schema = yup.object({
      document: yup.string().cpf().required(),
    });

    it('accepts valid CPF', async () => {
      await expect(schema.validate({ document: '529.982.247-25' })).resolves.toEqual({
        document: '529.982.247-25',
      });
    });

    it('rejects invalid CPF', async () => {
      await expect(schema.validate({ document: '529.982.247-00' })).rejects.toThrow(
        'Invalid CPF'
      );
    });
  });

  describe('cnpj', () => {
    const schema = yup.object({
      document: yup.string().cnpj().required(),
    });

    it('accepts valid CNPJ', async () => {
      await expect(schema.validate({ document: '11.222.333/0001-81' })).resolves.toEqual({
        document: '11.222.333/0001-81',
      });
    });

    it('rejects invalid CNPJ', async () => {
      await expect(schema.validate({ document: '11.111.111/1111-11' })).rejects.toThrow(
        'Invalid CNPJ'
      );
    });
  });

  describe('cnpjOrCpf', () => {
    const schema = yup.object({
      document: yup.string().cnpjOrCpf().required(),
    });

    it('accepts valid CPF', async () => {
      await expect(schema.validate({ document: '529.982.247-25' })).resolves.toBeDefined();
    });

    it('accepts valid CNPJ', async () => {
      await expect(schema.validate({ document: '11.222.333/0001-81' })).resolves.toBeDefined();
    });

    it('rejects invalid document', async () => {
      await expect(schema.validate({ document: 'invalid' })).rejects.toThrow(
        'Invalid CNPJ/CPF'
      );
    });
  });

  describe('phone', () => {
    const schema = yup.object({
      phone: yup.string().phone().required(),
    });

    it('accepts formatted Brazilian phone numbers', async () => {
      await expect(schema.validate({ phone: '(11) 98765-4321' })).resolves.toEqual({
        phone: '(11) 98765-4321',
      });
      await expect(schema.validate({ phone: '11987654321' })).resolves.toEqual({
        phone: '11987654321',
      });
    });

    it('rejects invalid phone numbers', async () => {
      await expect(schema.validate({ phone: '123' })).rejects.toThrow();
    });
  });
});

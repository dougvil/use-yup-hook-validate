import { describe, it, expect } from 'vitest';
import { isCpf, isCnpj } from './validations';

describe('isCpf', () => {
  it('accepts a valid CPF with formatting', () => {
    expect(isCpf('529.982.247-25')).toBe(true);
  });

  it('accepts a valid CPF without formatting', () => {
    expect(isCpf('52998224725')).toBe(true);
  });

  it('rejects CPF with wrong length', () => {
    expect(isCpf('123')).toBe(false);
    expect(isCpf('123456789012')).toBe(false);
  });

  it('rejects CPF with invalid checksum', () => {
    expect(isCpf('529.982.247-00')).toBe(false);
  });

  it('rejects known invalid repeated digits', () => {
    expect(isCpf('000.000.000-00')).toBe(false);
  });

  it('rejects empty input', () => {
    expect(isCpf('')).toBe(false);
  });
});

describe('isCnpj', () => {
  it('accepts a valid CNPJ with formatting', () => {
    expect(isCnpj('11.222.333/0001-81')).toBe(true);
  });

  it('accepts a valid CNPJ without formatting', () => {
    expect(isCnpj('11222333000181')).toBe(true);
  });

  it('rejects CNPJ with wrong length', () => {
    expect(isCnpj('123')).toBe(false);
    expect(isCnpj('112223330001812')).toBe(false);
  });

  it('rejects CNPJ with invalid checksum', () => {
    expect(isCnpj('11.222.333/0001-00')).toBe(false);
  });

  it('rejects known invalid repeated digits', () => {
    expect(isCnpj('00.000.000/0000-00')).toBe(false);
    expect(isCnpj('11.111.111/1111-11')).toBe(false);
  });

  it('rejects empty input', () => {
    expect(isCnpj('')).toBe(false);
  });
});


import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatPercent, formatPhone, formatCNPJ } from '../formatters';

describe('formatters', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
    expect(formatCurrency(0)).toBe('R$ 0,00');
  });

  it('should format date correctly', () => {
    const date = new Date(2026, 4, 21); // May 21
    expect(formatDate(date)).toBe('21/05/2026');
    expect(formatDate('2026-05-21')).toBe('21/05/2026');
  });

  it('should format percentage correctly', () => {
    expect(formatPercent(0.1234)).toBe('12,3%');
    expect(formatPercent(1)).toBe('100,0%');
  });

  it('should format phone numbers', () => {
    expect(formatPhone('11999999999')).toBe('(11) 99999-9999');
    expect(formatPhone('1144445555')).toBe('(11) 4444-5555');
  });

  it('should format CNPJ', () => {
    expect(formatCNPJ('12345678000199')).toBe('12.345.678/0001-99');
  });
});

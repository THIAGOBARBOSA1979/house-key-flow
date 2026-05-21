
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatPercentage, formatPhone, formatDateTime, formatRelativeTime } from '../formatters';

describe('formatters', () => {
  it('should format currency correctly', () => {
    // Non-breaking space \u00a0 is often used in Intl.NumberFormat for BRL
    const result = formatCurrency(1234.56).replace(/\u00a0/g, ' ');
    expect(result).toBe('R$ 1.234,56');
    expect(formatCurrency(0).replace(/\u00a0/g, ' ')).toBe('R$ 0,00');
  });

  it('should format date correctly', () => {
    const date = new Date(2026, 4, 21); // May 21
    expect(formatDate(date)).toBe('21/05/2026');
    expect(formatDate('2026-05-21')).toBe('21/05/2026');
  });

  it('should format date and time correctly', () => {
    const date = new Date(2026, 4, 21, 14, 30);
    // Replace non-breaking space if necessary
    const result = formatDateTime(date).replace(/\u00a0/g, ' ');
    expect(result).toContain('21/05/2026');
    expect(result).toContain('14:30');
  });

  it('should format percentage correctly', () => {
    expect(formatPercentage(12.34)).toBe('12%'); // Math.round used in implementation
    expect(formatPercentage(100)).toBe('100%');
  });

  it('should format phone numbers', () => {
    expect(formatPhone('11999999999')).toBe('(11) 99999-9999');
    expect(formatPhone('1144445555')).toBe('(11) 4444-5555');
    expect(formatPhone('invalid')).toBe('invalid');
  });

  it('should format relative time', () => {
    const now = new Date();
    expect(formatRelativeTime(now)).toBe('Agora');
    
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    expect(formatRelativeTime(tenMinutesAgo)).toBe('Há 10 min');

    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoHoursAgo)).toBe('Há 2h');

    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(yesterday)).toBe('Ontem');
  });
});

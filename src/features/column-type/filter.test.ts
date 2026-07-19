import { describe, it, expect } from 'vitest';
import { filterTypeOptions } from './filter';

const TYPES = ['INT', 'BIGINT', 'VARCHAR(255)', 'TEXT', 'DECIMAL(10,2)', 'BOOLEAN'];

describe('filterTypeOptions', () => {
  it('empty query returns all types and no custom', () => {
    const r = filterTypeOptions(TYPES, '');
    expect(r.matches).toEqual(TYPES);
    expect(r.custom).toBeNull();
  });

  it('filters case-insensitively by substring', () => {
    expect(filterTypeOptions(TYPES, 'int').matches).toEqual(['INT', 'BIGINT']);
    expect(filterTypeOptions(TYPES, 'CHAR').matches).toEqual(['VARCHAR(255)']);
  });

  it('offers a custom value when the query matches nothing exactly', () => {
    const r = filterTypeOptions(TYPES, 'VARCHAR(100)');
    expect(r.custom).toBe('VARCHAR(100)');
  });

  it('offers custom even when it is a substring-match of an existing type', () => {
    // "VARCHAR" substring-matches VARCHAR(255) but is not an exact type → still customizable.
    const r = filterTypeOptions(TYPES, 'VARCHAR');
    expect(r.matches).toEqual(['VARCHAR(255)']);
    expect(r.custom).toBe('VARCHAR');
  });

  it('does not offer a custom value when the query is an exact type (any case)', () => {
    expect(filterTypeOptions(TYPES, 'int').custom).toBeNull();
    expect(filterTypeOptions(TYPES, 'INT').custom).toBeNull();
    expect(filterTypeOptions(TYPES, 'decimal(10,2)').custom).toBeNull();
  });

  it('trims whitespace around the query', () => {
    const r = filterTypeOptions(TYPES, '  DECIMAL(12,4)  ');
    expect(r.custom).toBe('DECIMAL(12,4)');
  });
});

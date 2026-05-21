
/**
 * Utility to safe check if a value is a date or should be treated as such
 */
const isDateString = (value: any): boolean => {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}:\d{2}/.test(value);
};

export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

export const toCamelCase = (str: string): string => {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
};

export const mapObjectKeys = (obj: any, mapper: (key: string) => string): any => {
  if (obj === null || typeof obj !== 'object' || obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map((item) => mapObjectKeys(item, mapper));

  const mapped: any = {};
  Object.keys(obj).forEach((key) => {
    const newKey = mapper(key);
    let value = obj[key];
    
    // Auto-deserialize dates during camelCase conversion (incoming from DB)
    if (mapper === toCamelCase && isDateString(value)) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        value = date;
      }
    }

    mapped[newKey] = mapObjectKeys(value, mapper);
  });
  return mapped;
};

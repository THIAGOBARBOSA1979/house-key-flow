
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
    mapped[newKey] = mapObjectKeys(obj[key], mapper);
  });
  return mapped;
};

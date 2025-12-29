import { type IndexKey, nepseIndexes } from '@/types/indexes';

const nepseIndexSet = new Set(nepseIndexes);

export const isValidIndexKey = (value: unknown): value is IndexKey => {
  return typeof value === 'string' && nepseIndexSet.has(value as IndexKey);
};

export function createNepseError(message: string): NepseError {
  const error = new Error(message) as NepseError;
  error.name = 'NepseError';
  return error;
}

export type NepseError = Error & {
  message: string;
};

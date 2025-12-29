/* eslint-disable @typescript-eslint/no-explicit-any */
interface Chrome {
  runtime: {
    sendMessage: (
      extensionId: string,
      message: any,
      callback?: (response: any) => void
    ) => void;
    lastError?: {
      message?: string;
    };
  };
}

declare const chrome: Chrome;


import { genkit, type GenkitError } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

type ErrorCallback = (err: GenkitError) => void;
const errorCallbacks = new Set<ErrorCallback>();

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
  // logLevel: 'debug', // Removed as it is not a valid property
  // enableTracingAndMetrics: true, // Removed as it is not a valid property
  // flowStateStore: 'firebase', // Removed
  // traceStore: 'firebase', // Removed
  // evalStore: 'firebase', // Removed
  // Intercepts errors and logs them to the console.
  // errorCallback removed

});

export function onError(cb: ErrorCallback) {
  errorCallbacks.add(cb);
  return () => {
    errorCallbacks.delete(cb);
  };
}

// Re-export zod for convenience.
export { z } from 'zod';

export function isGenkitError(
  err: any,
  code?: any // Changed from GenkitErrorCode to any
): err is GenkitError {
  return (
    err.isGenkitError &&
    (code === undefined || (err.code && err.code === code))
  );
}

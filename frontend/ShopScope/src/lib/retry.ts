import axios from 'axios';
import { ApiError } from './ApiError';

export interface RetryOptions {
  attempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

function isRetryableError(error: unknown): boolean {
  if (axios.isCancel(error)) return false;
  const apiError = ApiError.from(error);
  return apiError.isRetryable;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  { attempts = 3, baseDelayMs = 250, maxDelayMs = 4000 }: RetryOptions = {},
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= attempts || !isRetryableError(err)) {
        throw err;
      }
       const expDelay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt - 1));
      const jitter = Math.random() * (expDelay * 0.2);
      const delay = expDelay + jitter;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
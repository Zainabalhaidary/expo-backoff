/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AWSError } from 'aws-sdk';

function randomizeDelay(delay: number) {
  const randomizedDelay = Math.random() * delay;
  return Math.round(randomizedDelay);
}

function sleep(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, randomizeDelay(duration)));
}
export async function exponentialBackoff(
  promise: {
    (): Promise<any>;
  },
  retryCount: number,
  delay = 2000,
  error?: Partial<AWSError>,
): Promise<any> {
  let result: any;

  try {
    result = await promise();
  } catch (e) {
    if ((!error || (e.code === error.code && e.message === error.message)) && retryCount > 1) {
      await sleep(delay);
      result = await exponentialBackoff(promise, retryCount - 1, delay * 2);
    } else {
      throw e;
    }
  }

  return result;
}

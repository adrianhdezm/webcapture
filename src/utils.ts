import { timingSafeEqual } from 'node:crypto';

export type BasicAuthCredentials = {
  username: string;
  password: string;
};

export function parseBasicAuthHeader(authorization: string | undefined): BasicAuthCredentials | null {
  if (!authorization) {
    return null;
  }

  const [scheme, encoded] = authorization.split(' ');
  if (scheme !== 'Basic' || !encoded) {
    return null;
  }

  let decoded = '';
  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf8');
  } catch {
    return null;
  }

  const separator = decoded.indexOf(':');
  if (separator === -1) {
    return null;
  }

  return {
    username: decoded.slice(0, separator),
    password: decoded.slice(separator + 1)
  };
}

export function safeEqual(input: string, expected: string): boolean {
  const inputBuffer = Buffer.from(input);
  const expectedBuffer = Buffer.from(expected);

  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(inputBuffer, expectedBuffer);
}

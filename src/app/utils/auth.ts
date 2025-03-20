import * as jwt from 'jsonwebtoken';
import * as cookie from 'cookie';

const secret: string = process.env.NEXT_PUBLIC_JWT_SECRET || '';

export function verifyToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

export function triggerAuthChange() {
  const event = new Event('authChange');
  window.dispatchEvent(event);
}

export async function checkAuth(request: Request) {
  const cookies = cookie.parse(request.headers.get('cookie') || '');
  const token = cookies.token;

  if (token) {
    const user = verifyToken(token);
    return user;
  }
  return null;
}
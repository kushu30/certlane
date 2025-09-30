import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';

const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'SuperAdminToken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { password } = req.body;

  if (password === SUPER_ADMIN_PASSWORD) {
    const token = sign({ sub: 'super-admin' }, JWT_SECRET, { expiresIn: '2h' });

    const serialised = serialize(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 2,
      path: '/',
    });

    res.setHeader('Set-Cookie', serialised);
    return res.status(200).json({ message: 'Super admin login successful' });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
}
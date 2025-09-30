import { MongoClient } from 'mongodb';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const jwtSecret = process.env.JWT_SECRET;
const cookieName = 'AuthToken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ message: 'Invalid input.' });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const passwordsMatch = await compare(password, user.password);

    if (!passwordsMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ message: 'Your account is pending approval.' });
    }

    const token = sign(
      { userId: user._id.toString(), email: user.email },
      jwtSecret,
      { expiresIn: '8h' }
    );

    const serialisedCookie = serialize(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8,
      path: '/',
    });

    res.setHeader('Set-Cookie', serialisedCookie);
    res.status(200).json({ message: 'Login successful.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}
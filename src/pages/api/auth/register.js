import { MongoClient } from 'mongodb';
import { hash } from 'bcryptjs';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, password } = req.body;

  if (!email || !email.includes('@') || !password || password.trim().length < 8) {
    return res.status(422).json({ message: 'Invalid input: Password must be at least 8 characters long.' });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(422).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await hash(password, 12);

    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      isApproved: false,
      createdAt: new Date(),
    };

    await usersCollection.insertOne(newUser);

    res.status(201).json({ message: 'Registration request received. Your account will be activated upon approval.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}
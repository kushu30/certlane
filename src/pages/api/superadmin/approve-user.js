import { MongoClient, ObjectId } from 'mongodb';
import { verify } from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const jwtSecret = process.env.JWT_SECRET;
const cookieName = 'SuperAdminToken';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const token = req.cookies[cookieName];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    verify(token, jwtSecret);
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Bad Request: userId is required.' });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { isApproved: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User approved successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}
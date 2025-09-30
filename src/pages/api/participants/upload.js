import { MongoClient, ObjectId } from 'mongodb';
import { verify } from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const jwtSecret = process.env.JWT_SECRET;
const cookieName = 'AuthToken'; // The client's auth token

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const token = req.cookies[cookieName];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Not logged in' });
  }

  let decodedToken;
  try {
    decodedToken = verify(token, jwtSecret);
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }

  const { userId } = decodedToken;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
  }

  const participants = req.body;
  if (!participants || !Array.isArray(participants)) {
    return res.status(400).json({ message: 'Bad Request: Participant data must be an array.' });
  }

  const participantsWithOwner = participants.map(p => ({
    ...p,
    ownerId: new ObjectId(userId), // Link each participant to the logged-in user
  }));

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('participants');

    // Important: Delete only the old participants belonging to this specific user
    await collection.deleteMany({ ownerId: new ObjectId(userId) });

    const result = await collection.insertMany(participantsWithOwner);

    res.status(200).json({ message: 'Participants uploaded successfully', insertedCount: result.insertedCount });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}
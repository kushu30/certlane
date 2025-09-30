import { MongoClient, ObjectId } from 'mongodb';
import { verify } from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const jwtSecret = process.env.JWT_SECRET;
const cookieName = 'AuthToken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('participants');

    const participants = await collection.find({ ownerId: new ObjectId(userId) }).toArray();

    const sanitizedParticipants = participants.map(doc => {
        doc._id = doc._id.toString();
        return doc;
    });

    res.status(200).json(sanitizedParticipants);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}
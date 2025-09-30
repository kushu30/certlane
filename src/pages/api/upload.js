import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;
const adminSecret = process.env.ADMIN_SECRET_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const providedSecret = req.headers['x-admin-secret'];
  if (providedSecret !== adminSecret) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const participants = req.body;
  if (!participants || !Array.isArray(participants)) {
    return res.status(400).json({ message: 'Bad Request: Participant data must be an array.' });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    await collection.deleteMany({});
    const result = await collection.insertMany(participants);

    res.status(200).json({ insertedCount: result.insertedCount });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}
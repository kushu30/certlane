import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { eventCode, email, phone } = req.query;

  if (!eventCode || !email || !phone) {
    return res.status(400).json({ message: 'Missing required parameters.' });
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('participants');

    const query = {
      eventCode: eventCode.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
    };

    const results = await collection.find(query).toArray();

    const sanitizedResults = results.map(doc => {
        doc._id = doc._id.toString();
        // Do not send ownerId to the public
        delete doc.ownerId; 
        return doc;
    });

    res.status(200).json(sanitizedResults);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}
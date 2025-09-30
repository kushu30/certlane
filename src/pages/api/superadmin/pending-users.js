import { MongoClient } from 'mongodb';
import { verify } from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const jwtSecret = process.env.JWT_SECRET;
const cookieName = 'SuperAdminToken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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
  
  // --- DEBUGGING LINES ADDED HERE ---
  console.log("--- FETCHING PENDING USERS API ---");
  console.log("Connecting to database named:", dbName);
  // ------------------------------------

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const pendingUsers = await usersCollection.find(
      { isApproved: false },
      { projection: { password: 0 } }
    ).toArray();
    
    const sanitizedUsers = pendingUsers.map(doc => {
        doc._id = doc._id.toString();
        return doc;
    });

    res.status(200).json(sanitizedUsers);
  } catch (error) {
    console.error("API Error fetching pending users:", error); // Added more detailed error logging
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
}
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import { User } from './User';

dotenv.config({ path: './.env.local' });

const MONGODB_URI = process.env.MONGODB_URI ?? '';
const MONGODB_DB = process.env.DB_NAME ?? '';
const dev = process.env.NODE_ENV !== 'production';

if (!MONGODB_URI) {
    throw new Error('Define the MONGODB_URI environmental variable');
}

if (!MONGODB_DB) {
    throw new Error('Define the MONGODB_DB environmental variable');
}

let cachedClient: any = null;
let cachedDb: any = null;

export async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return {
            client: cachedClient,
            db: cachedDb
        };
    }

    let client = new MongoClient(
        dev
            ? `${process.env.MONGODB_URI}`
            : `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URI}`);
    await client.connect();
    let db = client.db(MONGODB_DB);

    cachedClient = client;
    cachedDb = db;

    return {
        client: cachedClient,
        db: cachedDb
    };
}

export async function validateAccount(fio: string): Promise<boolean> {
    const { db } = await connectToDatabase();
    const collection = await db.collection('Users');

    const result = (await collection
        .find({ fio: fio })
        .toArray()) as User[];

    return result.length > 0;
}

export async function createAccount(username: string, email: string, phone: string, password: string, language: string) {
    const user: User = {
        _id: new ObjectId(),
        fio: username,
        email: email,
        phone: phone,
        password: password,
        language: language,
        points: 0
    };

    const { db } = await connectToDatabase();
    await db.collection('Users').insertOne(user);
}
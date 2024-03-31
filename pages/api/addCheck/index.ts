import { NextApiRequest, NextApiResponse } from 'next';
import {connectToDatabase} from "@/src/database";
import ICheck from "@/src/types/ICheck";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const requestBody = req.body;
    if (!requestBody) return res.json({});

    const { db } = await connectToDatabase();
    const collection = await db.collection('checks');

    const check = JSON.parse(requestBody) as ICheck;

    await collection.insertOne(check);

    res.json({ result: check });
};

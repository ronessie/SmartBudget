import { NextApiRequest, NextApiResponse } from 'next';
import {connectToDatabase} from "@/src/database";
import ICheck from "@/src/types/ICheck";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { param } = req.query;
    if (!param || param.length < 1) return res.json({});

    const { db } = await connectToDatabase();
    const collection = await db.collection('checks');

    const check = JSON.parse(param[0]) as ICheck;

    await collection.insertOne(check);

    res.json({ result: check });
};
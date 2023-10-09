import { NextApiRequest, NextApiResponse } from 'next';
import {connectToDatabase} from "@/src/database";
import IUser from "@/src/types/IUser";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { param } = req.query;
    if (!param || param.length < 1) return res.json({});

    const { db } = await connectToDatabase();
    const collection = await db.collection('users');

    const user = JSON.parse(param[0]) as IUser;

    await collection.insertOne(user);

    res.json({ result: user });
};
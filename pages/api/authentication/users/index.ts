import { NextApiRequest, NextApiResponse } from 'next';
import {connectToDatabase} from "@/src/database";
import IUser from "@/src/types/IUser";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { db } = await connectToDatabase();

    const users = (await db
        .collection('users')
        .find()
        .toArray()) as IUser[];

    res.json({ users: users });
};
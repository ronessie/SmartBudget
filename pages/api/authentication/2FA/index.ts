import { NextApiRequest, NextApiResponse } from 'next';
import {connectToDatabase} from "@/src/database";
import IUser from "@/src/types/IUser";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const {twoFA, user_id} = req.body;
    const { db } = await connectToDatabase();

    const users = (await db
        .collection('users')
        .filter({twoStepAuth: twoFA, _id: user_id})
        .find()
        .toArray()) as IUser[];

    res.json({ users: users });
};
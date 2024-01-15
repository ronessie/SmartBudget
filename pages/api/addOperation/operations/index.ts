import { NextApiRequest, NextApiResponse } from 'next';
import {connectToDatabase} from "@/src/database";
import IOperation from "@/src/types/IOperation";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { db } = await connectToDatabase();

    const operations = (await db
        .collection('operations')
        .find()
        .toArray()) as IOperation[];

    res.json({ users: operations });
};
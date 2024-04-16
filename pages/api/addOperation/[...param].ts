import {NextApiRequest, NextApiResponse} from 'next';
import {connectToDatabase} from "@/src/database";
import IOperation from "@/src/types/IOperation";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const {param} = req.query;
    if (!param || param.length < 1) return res.json({});

    const {db} = await connectToDatabase();
    const collection = await db.collection('operations');

    const operation = JSON.parse(param[0]) as IOperation;

    await collection.insertOne(operation);

    res.json({result: operation});
};
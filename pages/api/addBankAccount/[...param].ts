import {NextApiRequest, NextApiResponse} from 'next';
import {connectToDatabase} from "@/src/database";
import IBankAccount from "@/src/types/IBankAccount";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const {param} = req.query;
    if (!param || param.length < 1) return res.json({});

    const {db} = await connectToDatabase();
    const collection = await db.collection('bankAccounts');

    const bankAccount = JSON.parse(param[0]) as IBankAccount;

    await collection.insertOne(bankAccount);

    res.json({result: bankAccount});
};

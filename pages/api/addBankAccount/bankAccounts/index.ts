import {NextApiRequest, NextApiResponse} from 'next';
import {connectToDatabase} from "@/src/database";
import IBankAccount from "@/src/types/IBankAccount";

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const {db} = await connectToDatabase();

    const bankAccounts = (await db
        .collection('bankAccounts')
        .find()
        .toArray()) as IBankAccount[];

    res.json({users: bankAccounts});
};
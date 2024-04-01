import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";
import IBankAccount from "@/src/types/IBankAccount";

export default async function userBankAccounts(req: NextApiRequest, res: NextApiResponse) {
    const { db } = await connectToDatabase();
    const {user_id} = req.body;

    const bankAccounts = (await db
        .collection('bankAccounts')
        .filter({user_id: user_id, secondUser_id: user_id})
        .find()
        .toArray()) as IBankAccount[];

    res.json({ bankAccounts: bankAccounts });
}
import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";
import IBankAccount from "@/src/types/IBankAccount";

export default async function userBankAccounts(req: NextApiRequest, res: NextApiResponse) {
    const { db } = await connectToDatabase();
    const { param } = req.query;
    if (!param || param.length < 1) return res.json({});
    const user_id = param[0];

    const bankAccounts = (await db
        .collection('bankAccounts')
        .find({user_id: user_id})
        .toArray()) as IBankAccount[];

    console.log("test: "+bankAccounts)

    res.json({ bankAccounts: bankAccounts });
}
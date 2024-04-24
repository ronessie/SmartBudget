import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";
import IBankAccount from "@/src/types/IBankAccount";

export default async function userBankAccounts(req: NextApiRequest, res: NextApiResponse) {
    const {param} = req.query;
    if (!param || param.length < 1) return res.json({});
    const user_id = param[0];

    const {db} = await connectToDatabase();
    const bankAccounts = (await db
        .collection('bankAccounts')
        .find({
            $or: [
                {user_id: user_id},
                {secondUser_id: user_id}
            ]
        })
        .toArray()) as IBankAccount[];

    const result: { label: string, value: string }[] = [];

    bankAccounts.map((e) => result.push({label: e.name ?? '', value: e._id}))
    console.log(result);

    res.json({result: result});
}
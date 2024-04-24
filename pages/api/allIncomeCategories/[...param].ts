import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";
import IBankAccount from "@/src/types/IBankAccount";

export default async function allIncomeCategories(req: NextApiRequest, res: NextApiResponse) {
    const {param} = req.query;
    if (!param || param.length < 1) return res.json({});
    const bankAccountId = param[0];

    const {db} = await connectToDatabase();
    const categories = (await db
        .collection('bankAccounts')
        .filter({bankAccount_id: bankAccountId})
        .toArray()) as IBankAccount[];

    /*const result: { category: string, sum: number, currency: string, date: string }[] = [];

    categories.map((e) => result.push({category: e.category ?? '', sum: e.sum ?? 0, currency: e.currency ?? '', date: e.date?.toString() ?? ''}))
    console.log(result);

    res.json({result: result});*/
}
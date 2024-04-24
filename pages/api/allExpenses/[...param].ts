import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";
import IOperation from "@/src/types/IOperation";

export default async function allExpenses(req: NextApiRequest, res: NextApiResponse) {
    const {param} = req.query;
    if (!param || param.length < 1) return res.json({});
    const bankAccountId = param[0];

    const {db} = await connectToDatabase();
    const operations = (await db
        .collection('operations')
        .filter({bankAccount_id: bankAccountId, operationsStatus: "-"})
        .toArray()) as IOperation[];

    const result: { category: string, sum: number, currency: string, date: string }[] = [];

    operations.map((e) => result.push({category: e.category ?? '', sum: e.sum ?? 0, currency: e.currency ?? '', date: e.date?.toString() ?? ''}))
    console.log(result);

    res.json({result: result});
}
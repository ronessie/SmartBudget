import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";
import ICheck from "@/src/types/ICheck";
import IUser from "@/src/types/IUser";

export default async function userChecks(req: NextApiRequest, res: NextApiResponse) {
    const {param} = req.query;
    if (!param || param.length < 1) return res.json({});
    const user = JSON.parse(param[0]) as IUser;


    const {db} = await connectToDatabase();
    const collection = await db.collection('checks')
    const checks = (await collection
        //.filter({user_id: user._id, bankAccount_id: user.currentBankAccount})
        .find()
        .toArray()) as ICheck[];

    console.log("Test: " + checks)

    const filePaths = checks.map(c => c.filePath) as string[];
    console.log(filePaths);

    res.json({result: filePaths});
}

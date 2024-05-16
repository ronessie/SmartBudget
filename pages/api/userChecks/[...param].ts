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
        .find({user_id: user._id, bankAccount_id: user.currentBankAccount})
        .toArray()) as ICheck[];


    const filePaths = checks.map(c => c.filePath) as string[];
    const recognitionText = checks.map(c => c.checkText ?? "") as string[];
    console.log(filePaths);

    res.json({result: filePaths, text: recognitionText??""});
}
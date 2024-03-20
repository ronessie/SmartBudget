import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";

export default async function updateBalance(req: NextApiRequest, res: NextApiResponse) {
    const {currentBankAccount_id} = JSON.parse(req.body);

    const {db} = await connectToDatabase();
    const collection = await db.collection('bankAccounts');
    const filter = {_id: currentBankAccount_id};
    const updateDocument = {
        $set: {
            lastUpdateDate: Date()
        }
    };
    const result = await collection.updateOne(filter, updateDocument);

    if (result.modifiedCount === 1) {
        console.log(`Balance updated successfully for ${currentBankAccount_id}`);
        return res.status(200).json({success: true});
    } else {
        console.log('No bankAccount found ${currentBankAccount_id}');
        return res.status(404);
    }
}

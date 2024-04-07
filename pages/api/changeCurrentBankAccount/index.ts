import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";

export default async function changeCurrentBankAccount(req: NextApiRequest, res: NextApiResponse) {
    const {bankAccount_id, user_id} = req.body;

    const {db} = await connectToDatabase();
    const collection = await db.collection('users');
    const filter = {_id: user_id};
    const updateDocument = {
        $set: {
            currentBankAccount: bankAccount_id,
        }
    };
    const result = await collection.updateOne(filter, updateDocument);

    const bankAccountCollection = await db.collection('bankAccounts');
    const bankAccount = await bankAccountCollection.findOne({_id: bankAccount_id});

    const userCollection = await db.collection('users');
    const user = await userCollection.findOne({_id: user_id});

    if (result.modifiedCount === 1) {
        console.log(`Bank account change successfully`);
        return res.status(200).json({success: true, bankAccount: bankAccount, user: user});
    } else {
        console.log('Bank account does not changed');
        return res.status(404);
    }
}

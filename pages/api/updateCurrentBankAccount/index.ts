import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";

export default async function updateCurrentBankAccount(req: NextApiRequest, res: NextApiResponse) {

    const {user_id, bankAccount_id, inviteCode} = req.body;


    const {db} = await connectToDatabase();
    const collection = await db.collection('bankAccounts');
    const filter = {invitingCode: inviteCode};
    const updateDocument = {
        $set: {
            secondUser_id: user_id
        }
    };
    const result = await collection.updateOne(filter, updateDocument);


    const collection2 = await db.collection('users');
    const filter2 = {_id: user_id};
    const updateDocument2 = {
        $set: {
            currentBankAccount: bankAccount_id
        }
    };
    const result2 = await collection2.updateOne(filter2, updateDocument2);


    if (result.modifiedCount === 1 && result2.modifiedCount === 1) {
        console.log('currentBankAccount updated successfully for ${user_id}');
    } else {
        console.log('No bankAccount found with the inviting code ${inviteCode}');
    }
}
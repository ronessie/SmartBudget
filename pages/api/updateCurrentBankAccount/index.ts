import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";
import IBankAccount from "@/src/types/IBankAccount";

export default async function updateCurrentBankAccount(req: NextApiRequest, res: NextApiResponse) {

    const {user_id, inviteCode} = req.body;


    const {db} = await connectToDatabase();
    const collection = await db.collection('bankAccounts');
    const filter = {invitingCode: inviteCode};
    const updateDocument = {
        $set: {
            secondUser_id: user_id
        }
    };
    const result = await collection.updateOne(filter, updateDocument);

    const currentBankAccount = (await collection.findOne(filter)) as IBankAccount;
    console.log('bankAccount: ', currentBankAccount);

    const collection2 = await db.collection('users');
    const filter2 = {_id: user_id};
    const updateDocument2 = {
        $set: {
            currentBankAccount: currentBankAccount._id
        }
    };
    const result2 = await collection2.updateOne(filter2, updateDocument2);


    if (result.modifiedCount === 1 && result2.modifiedCount === 1) {
        console.log(`currentBankAccount updated successfully for ${user_id}`);
    } else {
        console.log(`No bankAccount found with the inviting code ${inviteCode}`);
    }
}
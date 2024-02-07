import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";

export default async function updateBalance(req: NextApiRequest, res: NextApiResponse) {

    const {currentBankAccount_id, operationStatus, sum, balance} = req.body;
    let newBalance = 0
    if (operationStatus == "-") {
        newBalance = parseFloat(balance) - parseFloat(sum)
    }
    if (operationStatus == "+") {
        newBalance = parseFloat(balance) + parseFloat(sum)
    }
    alert(newBalance)
    const {db} = await connectToDatabase();
    const collection = await db.collection('bankAccounts');
    const filter = {_id: currentBankAccount_id};
    const updateDocument = {
        $set: {
            balance: newBalance
        }
    };
    const result = await collection.updateOne(filter, updateDocument);

    if (result.modifiedCount === 1) {
        console.log('Balance updated successfully for ${currentBankAccount_id}');
    } else {
        console.log('No bankAccount found ${currentBankAccount_id}');
    }
}
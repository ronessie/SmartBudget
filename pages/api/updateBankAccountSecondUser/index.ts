import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";

export default async function updateBankAccountSecondUser(req: NextApiRequest, res: NextApiResponse) {
    const {id, user_id} = req.body;

    const {db} = await connectToDatabase();
    const collection = await db.collection('bankAccounts');
    const filter = {_id: id};
    const updateDocument = {
        $set: {
            secondUser_id: user_id
        }
    };
    const result = await collection.updateOne(filter, updateDocument);

    if (result.modifiedCount === 1) {
        console.log(`Data updated successfully for user ${user_id}`);
        return res.status(200).json({success: true});
    } else {
        console.log(`Data does not update for user ${user_id}`);
        return res.status(404);
    }
}

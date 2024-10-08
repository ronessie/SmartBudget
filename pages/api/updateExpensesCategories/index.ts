import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";

export default async function updateExpensesCategories(req: NextApiRequest, res: NextApiResponse) {
    const {id, categories} = req.body;

    const {db} = await connectToDatabase();
    const collection = await db.collection('bankAccounts');
    const filter = {_id: id};
    const updateDocument = {
        $set: {
            expensesCategories: categories,
        }
    };
    const result = await collection.updateOne(filter, updateDocument);

    if (result.matchedCount === 1) {
        console.log(`Data updated successfully for ${id}`);
        return res.status(200).json({success: true});
    } else {
        console.log(`Data does not update ${id}`);
        return res.status(404).json({success: false});
    }
}

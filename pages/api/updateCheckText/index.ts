import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";

export default async function updateData(req: NextApiRequest, res: NextApiResponse) {
    const {filePath, text} = req.body;

    const {db} = await connectToDatabase();
    const collection = await db.collection('checks');
    const filter = {filePath: filePath};
    const updateDocument = {
        $set: {
            checkText: text,
        }
    };
    const result = await collection.updateOne(filter, updateDocument);

    if (result.modifiedCount === 1) {
        console.log(`Data updated successfully for ${filePath}`);
        return res.status(200).json({success: true});
    } else {
        console.log(`Data does not update ${filePath}`);
        return res.status(404);
    }
}
import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";

export default async function updateBalance(req: NextApiRequest, res: NextApiResponse) {
    const {user_id, fio, email, twoFA} = JSON.parse(req.body);

    const {db} = await connectToDatabase();
    const collection = await db.collection('users');
    const filter = {_id: user_id};
    const updateDocument = {
        $set: {
            fio: fio,
            email: email,
            twoStepAuth: twoFA
        }
    };
    const result = await collection.updateOne(filter, updateDocument);

    if (result.modifiedCount === 1) {
        console.log(`Data updated successfully for ${fio}`);
        return res.status(200).json({success: true});
    } else {
        console.log(`Data does not update ${fio}`);
        return res.status(404);
    }
}

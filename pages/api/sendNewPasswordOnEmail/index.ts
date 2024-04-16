import nodemailer from "nodemailer";
import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";

export default async function sendNewPasswordOnEmail(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({error: 'Method Not Allowed'});
    }
    try {
        const {email, password, fromEmail} = req.body;
        console.log(email + " - " + password);
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'vsakolinskaa@gmail.com',
                pass: 'hbjjwbstsgliuoco',
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"SmartBudget" <${fromEmail}>`,
            to: email,
            subject: 'Новый пароль SmartBudget',
            text: `Ваш новый пароль для сайта SmartBudget - ` + password,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Message sent: %s', info.messageId);

        if (res.status(200)) {
            const {db} = await connectToDatabase();
            const collection = await db.collection('users');
            const filter = {email: email};
            const updateDocument = {
                $set: {
                    password: password
                }
            };

            const result = await collection.updateOne(filter, updateDocument);

            if (result.modifiedCount === 1) {
                console.log('Password updated successfully for ${email}');
            } else {
                console.log('No user found with the email ${email}');
            }
        }

        return res.status(200).json({success: true});

    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({success: false, error: 'Internal Server Error'});
    }
}

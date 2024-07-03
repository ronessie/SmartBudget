import nodemailer from "nodemailer";
import {NextApiRequest, NextApiResponse} from "next";
import {connectToDatabase} from "@/src/database";

export default async function send2FAcodeOnEmail(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'POST') {
        return res.status(405).json({error: 'Method Not Allowed'});
    }
    try {
        const {email, twoStepAuthCode, fromEmail, subject, text} = req.body;
        console.log(email + " - " + twoStepAuthCode);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_AUTH_USER,
                pass: process.env.EMAIL_AUTH_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"SmartBudget" <${fromEmail}>`,
            to: email,
            subject: subject,
            text: text+twoStepAuthCode,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Message sent: %s', info.messageId);

        if (res.status(200)) {
            const {db} = await connectToDatabase();
            const collection = await db.collection('users');
            const filter = {email: email};
            const updateDocument = {
                $set: {
                    twoStepAuthCode: twoStepAuthCode
                }
            };

            const result = await collection.updateOne(filter, updateDocument);

            if (result.modifiedCount === 1) {
                console.log('2FA code updated successfully for ${email}');
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

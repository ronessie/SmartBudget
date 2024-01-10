import nodemailer from "nodemailer";
import {NextApiRequest, NextApiResponse} from "next";

export default async function sendEmail(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({error: 'Method Not Allowed'});
    }
    try {
        const {email, password, fromEmail} = req.body;
        console.log(email+" - "+password);
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'vsakolinskaa@gmail.com',
                pass: 'hbjjwbstsgliuoco',
            },
        });

        // Параметры электронного письма
        const mailOptions = {
            from: `"SmartBudget" <${fromEmail}>`,
            //from: 'vsakolinskaa@gmail.com',
            to: email,
            subject: 'Новый пароль SmartBudget',
            text: `Ваш новый пароль для сайта SmartBudget - ` + password,
        };

        // Отправка письма
        const info = await transporter.sendMail(mailOptions);

        console.log('Message sent: %s', info.messageId);

        // Возвращаем успешный ответ
        return res.status(200).json({success: true});

    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({success: false, error: 'Internal Server Error'});
    }
}
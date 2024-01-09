import nodemailer from "nodemailer";
import {useState} from "react";

const [date, setDate] = useState({
    password: "",
    newPassword: "",
    status: "NotAuthorized",
});
export default async function sendEmail(req, res, toEmail: any, newPassword: any) {
    if (req.method === 'POST') {

        try {
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
                from: 'vsakolinskaa@gmail.com',
                to: toEmail,
                subject: 'Новый пароль SmartBudget',
                text: `Ваш новый пароль для сайта SmartBudget` + newPassword,
            };

            // Отправка письма
            const info = await transporter.sendMail(mailOptions);

            console.log('Message sent: %s', info.messageId);

            if (res.status(200))
            {
                date.password=date.newPassword;
            }

            // Возвращаем успешный ответ
            return res.status(200).json({ success: true });

        } catch (error) {
            console.error('Error sending message:', error);
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    } else {
        // Метод не разрешен
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}
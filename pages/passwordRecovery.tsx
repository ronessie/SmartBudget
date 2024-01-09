import React, {useState} from "react";
import styles from '../styles/pages.module.css'
import validator from 'validator';
import IUser from "@/src/types/IUser";
import { useRouter } from 'next/router';
import {signIn} from "next-auth/react";
import { useTranslation } from 'next-i18next';
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Link from "next/link";
import nodemailer from 'nodemailer';
import {router} from "next/client";
export default function Page() {

    const [date, setDate] = useState({
        email: "",
        password: "",
        newPassword: "",
        status: "NotAuthorized",
    });
    const router = useRouter();
    async function checkDate(e: any) {
        e.preventDefault();

        if (!validator.isEmail(date.email)) {
            alert("Электронная почта введена не верно")
            return;
        }
        date.newPassword = generatePassword();
        sendEmail(1,1, date.email, date.newPassword);
    }

    function generatePassword() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return password;
    }

    async function sendEmail(req: any, res: any, toEmail: any, newPassword: any) {
        if (req.method === 'POST') {
            try {
                //const { name, email, message } = req.body;

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
                    //text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
                    text: `Ваш новый пароль для сайта SmartBudget` + newPassword,
                };

                // Отправка письма
                const info = await transporter.sendMail(mailOptions);

                console.log('Message sent: %s', info.messageId);

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

    function handleFieldChange(fieldName: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setDate({
            ...date,
            [fieldName]: event.target.value,
        });
    }

    return (
        <div className={styles.page}>
            <div className={styles.auth}>
                <form className={styles.form} style={{height: 320}}>
                    <h1 className={styles.bigBlackText} style={{fontSize: 40, paddingLeft: 70}}>Восстановление пароля</h1>
                    <h3 className={styles.text} style={{paddingTop: 35, fontSize: 16}}>Введите эл. почту к которой привязан аккаунт: </h3>
                    <input className={styles.input} style={{width: 335}} type="text" value={date.email} onChange={(e) => handleFieldChange("email", e)}
                           title="Пример: Ivanov@mail.ru"/>
                    <br/>
                    <button className={styles.button} style={{width: 351, marginTop: 20, fontSize: 20}} onClick={checkDate} title="Нажмите для смены пароля">Сменить пароль</button>
                    <br/>
                    <Link href="registration" className={styles.link}>Вернуться назад</Link>
                </form>
            </div>
        </div>
    )
}

export const getServerSideProps = async (ctx: any) => ({
    props: {
        ...(await serverSideTranslations(ctx.locale, ['common']))
    }
});
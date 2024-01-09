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
import fetch from "nodemailer/lib/fetch";
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
    }

    function generatePassword() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return password;
    }

    ////////////////////////////////////////////////////////
    const YourComponent = () => {
        const [formData, setFormData] = useState({
            email: date.email
        });

        const handleSubmit = async (e: any) => {
            e.preventDefault();

            try {
                const response = await fetch('/api/sendEmail/sendEmail', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (response.ok) {
                    console.log('Message sent successfully!');
                    // Здесь вы можете выполнить дополнительные действия после успешной отправки
                } else {
                    console.error('Failed to send message:', response.statusCode);//был statusText
                }
            } catch (error) {
                console.error('Error sending message:', error);
            }
        };

        const handleChange = (e) => {
            setFormData({...formData, [e.target.name]: e.target.value});
        };
    }
    ////////////////////////////////////////////////////////

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
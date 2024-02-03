import path from 'path';
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import styles from "@/styles/pages.module.css";
import React, {useState} from "react";
import {useRouter} from "next/router";
import {useTranslation} from "next-i18next";
import {getSession, signIn} from "next-auth/react";
import {connectToDatabase} from "@/src/database";
import IUser from "@/src/types/IUser";
import Link from "next/link";

path.resolve('./next.config.js');

export default function Page(props: { user: IUser}) {
    const [data, setData] = useState({
        email: props.user.email,
        status: "get 2FA",
        fromEmail: "vsakolinskaa@gmail.com",
        twoStepAuthCode: "",
        check2FA: props.user.twoStepAuthCode
    });
    const router = useRouter();
    const {t} = useTranslation('common');

    function handleFieldChange(fieldName: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setData({
            ...data,
            [fieldName]: event.target.value,
        });
    }

    function generate2FAcode() {
        const characters = '0123456789';
        let password = '';
        for (let i = 0; i < 6; i++) {
            password += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return password;
    }

    async function resend2FA() {
        data.twoStepAuthCode = generate2FAcode();
        const response2FA = await fetch('/api/send2FAcodeOnEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: data.email,
                twoStepAuthCode: generate2FAcode(),
                fromEmail: "vsakolinskaa@gmail.com"
            }),
        });

        if (response2FA.ok) {
            alert("Код уже отправлен Вам на почту");
            console.log('Email sent successfully!');
        } else {
            console.error('Failed to send email.');
        }
    }
    async function check2FA() {
        if (!data.check2FA || data.check2FA !== props.user.twoStepAuthCode)
        {
            alert("код введён не верно, попробуйте ещё раз");
            return
        }
        //await signIn('credentials', {username: props.user.email, password: props.user.password, redirect: false});
        alert("Вы успешно вошли")
        await router.push('/main');
    }

    return (
        <div className={styles.page}>
            <div className={styles.auth}>
                <form className={styles.form} style={{height: 260}}>
                    <h1 className={styles.bigBlackText}
                        style={{fontSize: 40, textAlign: "center"}}>Двухфакторка</h1>
                    <h3 className={styles.text}
                        style={{paddingTop: 35, fontSize: 16}}>Введите код:</h3>
                    <input className={styles.input} style={{width: 335}} type="text" value={data.twoStepAuthCode}
                           onChange={(e) => handleFieldChange("twoStepAuthCode", e)}
                           title="Введите шестизначный код который пришёл вам на почту"/>
                    <button className={styles.button}
                            style={{width: 351, marginTop: 5, fontSize: 20, backgroundColor: "grey"}}
                            onClick={check2FA}
                            title={t('authenticationPage.placeholder.button')}>Подтвердить
                    </button>
                    <Link href={""} onClick={resend2FA} className={styles.link}>Код не пришёл</Link>
                </form>
            </div>
        </div>
    )
}
export const getServerSideProps = async (ctx: any) => {
    const session = await getSession(ctx);

    const {db} = await connectToDatabase();

    const user = (await db
        .collection('users')
        .find({}, {email: session?.user?.email}).toArray())[0] as IUser;

    return {
        props: {
            user: user,
            ...(await serverSideTranslations(ctx.locale, ['common']))
        }
    }
};
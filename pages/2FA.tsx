import path from 'path';
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import styles from "@/styles/pages.module.css";
import React, {useState} from "react";
import {useRouter} from "next/router";
import {useTranslation} from "next-i18next";
import {getSession} from "next-auth/react";
import {connectToDatabase} from "@/src/database";
import IUser from "@/src/types/IUser";
import Link from "next/link";
import {Button, PinInput, TextInput} from "@mantine/core";
import Header from "../components/header"

path.resolve('./next.config.js');

export default function Page(props: { user: IUser }) {
    const [data, setData] = useState({
        email: props.user.email,
        status: "get 2FA",
        fromEmail: "vsakolinskaa@gmail.com",
        twoStepAuthCode: props.user.twoStepAuthCode,
        check2FA: ""
    });
    const router = useRouter();
    const {t} = useTranslation('common');

    function handleFieldChange(fieldName: string, value: any) {
        setData({
            ...data,
            [fieldName]: value,
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

    async function resend2FA(e: any) {
        e.preventDefault()
        data.twoStepAuthCode = generate2FAcode();
        const response2FA = await fetch('/api/send2FAcodeOnEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: props.user.email,
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

    async function check2FA(e: any) {
        e.preventDefault()
        alert(data.check2FA)
        if (!data.check2FA || data.check2FA != data.twoStepAuthCode) {
            alert("код введён не верно, попробуйте ещё раз");
            return
        }
        alert("Вы успешно вошли")
        await router.push('/main');
    }

    return (
        <div className={styles.page}>
            <Header/>
            <div className={styles.auth}>
                <form className={styles.form} style={{height: 330}}>
                    <h1 className={styles.bigBlackText}
                        style={{fontSize: 35, textAlign: "center", padding: 0}}>{t('2FA.label')}</h1>
                    <PinInput size="md" length={6} type="number" value={data.check2FA}
                              title="Введите код который пришёл вам на почту"
                              onChange={(e) => handleFieldChange("check2FA", e)}/><br/>
                    <Button className={styles.button}
                            style={{width: 276, marginTop: 5, fontSize: 20}}
                            onClick={check2FA}
                            title={t('authenticationPage.placeholder.button')}>{t('2FA.confirmButton')}
                    </Button>
                    <Link href={""} onClick={resend2FA} style={{marginLeft: 60}}
                          className={styles.link}>{t('2FA.resendLink')}</Link>
                </form>
            </div>
        </div>
    )
}
export const getServerSideProps = async (ctx: any) => {
    const session = await getSession(ctx);

    const {db} = await connectToDatabase();

    const user = (await db.collection('users').findOne({email: session?.user?.email})) as IUser;

    return {
        props: {
            user: user,
            ...(await serverSideTranslations(ctx.locale, ['common']))
        }
    }
};

import React, {useState} from "react";
import styles from '../styles/pages.module.css'
import validator from 'validator';
import IUser from "@/src/types/IUser";
import {useRouter} from 'next/router';
import {signIn} from "next-auth/react";
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Popup from 'reactjs-popup';

import Link from "next/link";

export default function Page() {
    const [date, setDate] = useState({
        email: "",
        password: "",
        status: "NotAuthorized",
        twoStepAuthCode: ""
    });
    const router = useRouter();
    const {t} = useTranslation('common');

    function generate2FAcode() {
        const characters = '0123456789';
        let password = '';
        for (let i = 0; i < 6; i++) {
            password += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return password;
    }

    async function checkDate(e: any) {
        e.preventDefault();
        const response = await fetch(`/api/authentication/users`);

        if (!response.ok) throw new Error(response.statusText);

        const json = await response.json();

        if (!validator.isEmail(date.email)) {
            alert("Электронная почта введена не верно")
            return;
        }
        if (!date.password) {
            alert("Введите пароль")
            return;
        }

        const userEmail = json.users.find((user: IUser) => user.email === date.email && user.password === date.password);
        if (!userEmail) {
            alert("Данные введены не верно, попробуйте ещё раз")
            return;
        }

        const user2FA = json.users.find((user: IUser) => user.twoStepAuth === true && user.email === date.email);//тут надо точно менять запрос
        if (user2FA) {
            date.twoStepAuthCode = generate2FAcode();
            //popUpElement();
            const response = await fetch('/api/send2FAcodeOnEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: date.email,
                    twoStepAuthCode: date.twoStepAuthCode,
                    fromEmail: "vsakolinskaa@gmail.com"
                }),
            });

            if (response.ok) {
                alert("Код уже отправлен Вам на почту");
                console.log('Email sent successfully!');
            } else {
                console.error('Failed to send email.');
            }
        }
        
        await signIn('credentials', { username: date.email, password: date.password });

        alert("Вы успешно вошли")

        await router.push('/main');
    }

    function handleFieldChange(fieldName: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setDate({
            ...date,
            [fieldName]: event.target.value,
        });
    }

    function twoStepAuthentication() {

    }

    async function googleAuthentication(e: any) {
        e.preventDefault()
        const response = await signIn('google');
        if (response && response.ok) {
            router.push('/main');
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.auth}>
                <form className={styles.form} style={{height: 420}}>
                    <h1 className={styles.bigBlackText}
                        style={{fontSize: 40, paddingLeft: 120}}>{t('authenticationPage.signIn')}</h1>
                    <h3 className={styles.text}
                        style={{paddingTop: 35, fontSize: 16}}>{t('authenticationPage.input.email')}</h3>
                    <input className={styles.input} style={{width: 335}} type="text" value={date.email}
                           onChange={(e) => handleFieldChange("email", e)}
                           title={t('authenticationPage.placeholder.email')}/>
                    <h3 className={styles.text}
                        style={{fontSize: 16, paddingTop: 10}}>{t('authenticationPage.input.password')}</h3>
                    <input className={styles.passwordInput} style={{width: 335}} type="password" value={date.password}
                           onChange={(e) => handleFieldChange("password", e)}
                           title={t('authenticationPage.placeholder.password')}/>
                    <br/>
                    <button id="auth" className={styles.button} style={{width: 351, marginTop: 20, fontSize: 20}}
                            onClick={checkDate}
                            title={t('authenticationPage.placeholder.button')}>{t('authenticationPage.signInButton')}</button>
                    <br/>
                    <button className={styles.button}
                            style={{width: 351, marginTop: 5, fontSize: 20, backgroundColor: "grey"}}
                            onClick={googleAuthentication}
                            title={t('authenticationPage.placeholder.button')}>{t('authenticationPage.googleLoginButton')}</button>
                    <Link href={"registration"} className={styles.link}
                          style={{paddingLeft: 50, fontSize: 16}}>{t('authenticationPage.registrationLink')}</Link><br/>
                    <Link href={"passwordRecovery"} className={styles.link}>Восстановить пароль</Link>
                </form>
            </div>
            <Popup trigger={<button>Жмяк</button>}>
                <div style={{paddingLeft: 200}}>
                    <form className={styles.form} style={{height: 420}}>
                        <h1 className={styles.bigBlackText}
                            style={{fontSize: 40, paddingLeft: 120}}>Двухфакторка</h1>
                        <h3 className={styles.text}
                            style={{paddingTop: 35, fontSize: 16}}>Введите код:</h3>
                        <input className={styles.input} style={{width: 335}} type="text" value={date.email}
                               onChange={(e) => handleFieldChange("email", e)}
                               title="Введите шестизначный код который пришёл вам на почту"/>
                        <button className={styles.button}
                                style={{width: 351, marginTop: 5, fontSize: 20, backgroundColor: "grey"}}
                                onClick={()=> router.push('/main')}
                                title={t('authenticationPage.placeholder.button')}>Подтвердить</button>
                    </form>
                </div>
            </Popup>
        </div>
    )
}

export const getServerSideProps = async (ctx: any) => ({
    props: {
        ...(await serverSideTranslations(ctx.locale, ['common']))
    }
});
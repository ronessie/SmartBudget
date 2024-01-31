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
    const [data, setData] = useState({
        email: "",
        password: "",
        status: "NotAuthorized",
        newPassword: generatePassword(),
        fromEmail: "vsakolinskaa@gmail.com",
        popUpEmail: "",
        twoStepAuthCode: "",
        check2FA: ""
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

        if (!validator.isEmail(data.email)) {
            alert("Электронная почта введена не верно")
            return;
        }
        if (!data.password) {
            alert("Введите пароль")
            return;
        }

        const userEmail = json.users.find((user: IUser) => user.email === data.email && user.password === data.password);
        if (!userEmail) {
            alert("Данные введены не верно, попробуйте ещё раз")
            return;
        }

        data.twoStepAuthCode = generate2FAcode();
        const response2FA = await fetch('/api/send2FAcodeOnEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: data.email,
                twoStepAuthCode: data.twoStepAuthCode,
                fromEmail: "vsakolinskaa@gmail.com"
            }),
        });

        if (response2FA.ok) {
            alert("Код уже отправлен Вам на почту");
            console.log('Email sent successfully!');
        } else {
            console.error('Failed to send email.');
        }


        await signIn('credentials', {username: data.email, password: data.password, redirect: false});

        alert("Вы успешно вошли")

        await router.push('/main');
    }

    function generatePassword() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return password;
    }
    async function checkDateForPasswrdRecovery(e: any) {
        e.preventDefault();

        if (!validator.isEmail(data.popUpEmail)) {
            alert("Электронная почта введена не верно")
            return;
        }

        const resp = await fetch(`/api/authentication/users`);

        if (!resp.ok) throw new Error(resp.statusText);

        const json = await resp.json();

        const userEmail = json.users.find((user: IUser) => user.email === data.popUpEmail);
        if (!userEmail) {
            alert("Пользователь с такой почтой не обнаружен")
            return;
        }
        const response = await fetch('/api/sendNewPasswordOnEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email: data.popUpEmail, password: data.newPassword, fromEmail: data.fromEmail}),
        });

        if (response.ok) {
            alert("Новый пароль отправлен вам на почту");
            console.log('Email sent successfully!');
            router.push('/authentication');
        } else {
            console.error('Failed to send email.');
        }
    }

    function handleFieldChange(fieldName: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setData({
            ...data,
            [fieldName]: event.target.value,
        });
    }

    async function googleAuthentication(e: any) {
        e.preventDefault()
        const response = await signIn('google', {redirect: false});
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
                    <input className={styles.input} style={{width: 335}} type="text" value={data.email}
                           onChange={(e) => handleFieldChange("email", e)}
                           title={t('authenticationPage.placeholder.email')}/>
                    <h3 className={styles.text}
                        style={{fontSize: 16, paddingTop: 10}}>{t('authenticationPage.input.password')}</h3>
                    <input className={styles.passwordInput} style={{width: 335}} type="password" value={data.password}
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
                    <Popup trigger={<Link href={""} className={styles.link} style={{paddingLeft: 100}}>Восстановить
                        пароль</Link>}>
                        <form className={styles.form} style={{height: 290, marginLeft: 63}}>
                            <h1 className={styles.bigBlackText} style={{fontSize: 40, padding: 0, textAlign: "center"}}>Восстановление
                                пароля</h1>
                            <h3 className={styles.text} style={{paddingTop: 35, fontSize: 16}}>Введите эл. почту к
                                которой привязан аккаунт: </h3>
                            <input autoFocus={true} className={styles.input} style={{width: 335}} type="text" value={data.popUpEmail}
                                   onChange={(e) => handleFieldChange("popUpEmail", e)}
                                   title="Пример: Ivanov@mail.ru"/>
                            <br/>
                            <button className={styles.button} style={{width: 351, marginTop: 20, fontSize: 20}}
                                    onClick={checkDateForPasswrdRecovery} title="Нажмите для смены пароля">Сменить пароль
                            </button>
                            <br/>
                        </form>
                    </Popup>
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

/*<Popup trigger={<button id="auth" className={styles.button}
                                            style={{width: 351, marginTop: 20, fontSize: 20}} onClick={checkDate}
                                            title={t('authenticationPage.placeholder.button')}>{t('authenticationPage.signInButton')}</button>}>
                        <div style={{paddingLeft: 200}}>
                            <form className={styles.form} style={{height: 420}}>
                                <h1 className={styles.bigBlackText}
                                    style={{fontSize: 40, paddingLeft: 120}}>Двухфакторка</h1>
                                <h3 className={styles.text}
                                    style={{paddingTop: 35, fontSize: 16}}>Введите код:</h3>
                                <input className={styles.input} style={{width: 335}} type="text" value={data.check2FA}
                                       onChange={(e) => handleFieldChange("email", e)}
                                       title="Введите шестизначный код который пришёл вам на почту"/>
                                <button className={styles.button}
                                        style={{width: 351, marginTop: 5, fontSize: 20, backgroundColor: "grey"}}
                                        onClick={() => router.push('/main')}
                                        title={t('authenticationPage.placeholder.button')}>Подтвердить
                                </button>
                            </form>
                        </div>
                    </Popup>*/
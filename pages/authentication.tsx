import React, {useState} from "react";
import styles from '../styles/pages.module.css'
import validator from 'validator';
import IUser from "@/src/types/IUser";
import {useRouter} from 'next/router';
import {signIn} from "next-auth/react";
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Popup from 'reactjs-popup';
import {Button, Text} from '@mantine/core';
import {modals} from '@mantine/modals';

import Link from "next/link";
import {TextInput} from "@mantine/core";

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

        if (!validator.isEmail(data.email.trim())) {
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

        const checkUser2FA = json.users.find((user: IUser) => user.email === data.email && user.password === data.password && user.twoStepAuth === true);
        if (checkUser2FA) {
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
                await router.push('/2FA');
                console.log('Email sent successfully!');
            } else {
                console.error('Failed to send email.');
            }
        } else {
            await signIn('credentials', {username: data.email, password: data.password, redirect: false});

            alert("Вы успешно вошли")

            await router.push('/main');
        }


    }

    function generatePassword() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return password;
    }

    async function checkDataForPasswordRecovery(e: any) {
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
            await router.push('/authentication');
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

    const openModalNewPassword = () => modals.openConfirmModal({
        title: 'Please confirm your action',
        children: (
            <form className={styles.form} style={{height: 290, marginLeft: 63}}>
                <h1 className={styles.bigBlackText}
                    style={{fontSize: 40, padding: 0, textAlign: "center"}}>Восстановление
                    пароля</h1>
                <TextInput
                    withAsterisk
                    label="Введите эл. почту к
                                которой привязан аккаунт:"
                    placeholder="your@email.com"
                    value={data.popUpEmail}
                    onChange={(e) => handleFieldChange("popUpEmail", e)}
                    title="Пример: your@email.com"
                />
                <button className={styles.button} style={{width: 275, marginTop: 20, fontSize: 20}}
                        onClick={checkDataForPasswordRecovery} title="Нажмите для смены пароля">Сменить
                    пароль
                </button>
                <br/>
            </form>
        ),
        labels: {confirm: 'Confirm', cancel: 'Cancel'},
        onCancel: () => console.log('Cancel'),
        onConfirm: () => console.log('Confirmed'),
    });

    async function googleAuthentication(e: any) {
        e.preventDefault()
        const response = await signIn('google', {redirect: false});
        if (response && response.ok) {
            await router.push('/main');
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.auth}>
                <form className={styles.form} style={{height: 420}}>
                    <h1 className={styles.bigBlackText}
                        style={{fontSize: 40, paddingLeft: 90}}>{t('authenticationPage.signIn')}</h1>
                    <TextInput
                        withAsterisk
                        label={t('authenticationPage.input.email')}
                        placeholder="your@email.com"
                        value={data.email}
                        onChange={(e) => handleFieldChange("email", e)}
                        title="Пример: your@email.com"
                    />
                    <TextInput
                        withAsterisk
                        label={t('authenticationPage.input.password')}
                        value={data.password}
                        onChange={(e) => handleFieldChange("email", e)}
                        title={t('authenticationPage.placeholder.password')}
                        type="password"
                    />
                    <Button className={styles.button} id="auth"
                            style={{width: 275, marginTop: 20, fontSize: 18}}
                            onClick={checkDate}
                            title={t('authenticationPage.placeholder.button')}>{t('authenticationPage.signInButton')}</Button>
                    <Button className={styles.button}
                            style={{width: 275, marginTop: 5, fontSize: 18, backgroundColor: "grey"}}
                            onClick={googleAuthentication}
                            title={t('authenticationPage.placeholder.button')}>{t('authenticationPage.googleLoginButton')}</Button>
                    <br/>
                    <Link href={"registration"} className={styles.link}
                          style={{fontSize: 16, paddingLeft: 15}}>{t('authenticationPage.registrationLink')}</Link><br/>
                    <Link href={""} className={styles.link} style={{marginLeft: 30, fontSize: 16}} onClick={() => {
                        modals.open({
                            title: 'Восстановление пароля',
                            children: (
                                <>
                                    <TextInput
                                        withAsterisk
                                        label="Введите эл. почту к
                                которой привязан аккаунт:"
                                        placeholder="your@email.com"
                                        value={data.popUpEmail}
                                        onChange={(e) => handleFieldChange("popUpEmail", e)}
                                        title="Пример: your@email.com"
                                    />
                                    <Button onClick={checkDataForPasswordRecovery} style={{marginTop: 10}}
                                            title="Нажмите для смены пароля">Сменить
                                        пароль</Button>
                                </>
                            ),
                        });
                    }}
                    >Восстановить пароль</Link>
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
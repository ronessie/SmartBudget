import React, {useState} from "react";
import styles from '../styles/pages.module.css'
import validator from 'validator';
import IUser from "@/src/types/IUser";
import {useRouter} from 'next/router';
import {signIn} from "next-auth/react";
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {Button, Modal, PasswordInput} from '@mantine/core';

import Link from "next/link";
import {TextInput} from "@mantine/core";
import {generate2FAcode, generatePassword} from "@/src/utils";

export default function Page() {
    const [passwordRecoveryModalState, setPasswordRecoveryModalState] = useState(false);
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
                await signIn('credentials', {username: data.email, password: data.password, redirect: false});
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

    function handleFieldChange(fieldName: string, value: any) {
        setData({
            ...data,
            [fieldName]: value,
        });
    }

    async function googleAuthentication(e: any) {
        e.preventDefault()
        const response = await signIn('google');
        if (response && response.ok) {
            await router.push('/main');
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.auth}>
                <form className={styles.form} style={{height: 420}}>
                    <h1 className={styles.bigBlackText}
                        style={{fontSize: 40, padding: 0, textAlign: "center"}}>{t('authenticationPage.signIn')}</h1>
                    <TextInput
                        label={t('authenticationPage.input.email')}
                        placeholder="your@email.com"
                        value={data.email}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        title={t('authenticationPage.placeholder.email')}
                    />
                    <PasswordInput
                        label={t('authenticationPage.input.password')}
                        value={data.password}
                        onChange={(e) => handleFieldChange("password", e.target.value)}
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
                          style={{fontSize: 16, paddingLeft: 15}} title={t('authenticationPage.placeholder.regLink')}>{t('authenticationPage.registrationLink')}</Link><br/>

                    <Link href={""} title={t('authenticationPage.placeholder.changePassLink')} className={styles.link} style={{marginLeft: 30, fontSize: 16}} onClick={() => setPasswordRecoveryModalState(!passwordRecoveryModalState)}
                    >{t('authenticationPage.changePasswordLink')}</Link>

                    <Modal opened={passwordRecoveryModalState} onClose={() => setPasswordRecoveryModalState(false)} title={t('authenticationPage.modals.header')}>
                        <TextInput
                            label={t('authenticationPage.modals.email')}
                            placeholder="your@email.com"
                            onChange={(e) => handleFieldChange("popUpEmail", e.target.value)}
                            title={t('authenticationPage.modals.title')}
                        />
                        <Button onClick={checkDataForPasswordRecovery} className={styles.button} style={{marginTop: 10, width: 408}}
                                title={t('authenticationPage.modals.buttonTitle')}>{t('authenticationPage.modals.button')}</Button>
                    </Modal>
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

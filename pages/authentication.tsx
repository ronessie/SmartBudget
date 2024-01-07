import React, {useState} from "react";
import styles from '../styles/pages.module.css'
import validator from 'validator';
import IUser from "@/src/types/IUser";
//import {useRouter} from "next/navigation";
import { useRouter } from 'next/router';
import {signIn} from "next-auth/react";
import {GetServerSideProps} from "next";
import { en } from '@/public/locales/english/en';
import { ru } from '@/public/locales/russian/ru';

export default function Page() {
    const [date, setDate] = useState({
        email: "",
        password: "",
        status: "NotAuthorized",
    });
    const router = useRouter();
    const t = router.locale === 'ru' ? ru : en;


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
        alert("Вы успешно вошли")

        router.push('/main');
    }

    function handleFieldChange(fieldName: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setDate({
            ...date,
            [fieldName]: event.target.value,
        });
    }

    async function googleAuthentication(e: any)
    {
        e.preventDefault()
        const  response = await signIn('google');
        if (response && response.ok) {
            router.push('/main');
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.auth}>
                <form className={styles.form} style={{height: 420}}>
                    <h1 className={styles.bigBlackText} style={{fontSize: 40, paddingLeft: 120}}>{t.authenticationPage.signIn}</h1>
                    <h3 className={styles.text} style={{paddingTop: 35, fontSize: 16}}>{t.authenticationPage.input.email}</h3>
                    <input className={styles.input} style={{width: 335}} type="text" value={date.email} onChange={(e) => handleFieldChange("email", e)}
                           title={t.authenticationPage.placeholder.email}/>
                    <h3 className={styles.text} style={{fontSize: 16, paddingTop: 10}}>{t.authenticationPage.input.password}</h3>
                    <input className={styles.passwordInput} style={{width: 335}} type="password" value={date.password} onChange={(e) => handleFieldChange("password", e)}
                           title={t.authenticationPage.placeholder.password}/>
                    <br/>
                    <button className={styles.button} style={{width: 351, marginTop: 20, fontSize: 20}} onClick={checkDate} title={t.authenticationPage.placeholder.button}>{t.authenticationPage.signInButton}</button>
                    <br/>
                    <button className={styles.button} style={{width: 351, marginTop: 5, fontSize: 20, backgroundColor: "grey"}} onClick={googleAuthentication} title={t.authenticationPage.placeholder.button}>{t.authenticationPage.googleLoginButton}</button>
                    <a href="registration" className={styles.link} style={{paddingLeft: 50, fontSize: 16}}>{t.authenticationPage.registrationLink}</a>
                </form>
            </div>
        </div>
    )
}
export const getServerSideProps: GetServerSideProps = async ctx => {
    return {
        props: {}
    };
};
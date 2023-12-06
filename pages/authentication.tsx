import React, {useState} from "react";
import styles from '../styles/pages.module.css'
import validator from 'validator';
import IUser from "@/src/types/IUser";
import {useRouter} from "next/navigation";

export default function Page() {
    const [date, setDate] = useState({
        email_or_phone: "",
        password: "",
        status: "NotAuthorized",
    });
    const router = useRouter();

    async function checkDate() {
        const response = await fetch(`/api/auth/users`);

        if (!response.ok) throw new Error(response.statusText);

        const json = await response.json();

        if (!validator.isMobilePhone(date.email_or_phone) && !validator.isEmail(date.email_or_phone)) {
            alert("Электронная почта или телефон введены не верно")
            return;
        }
        if (!date.password) {
            alert("Введите пароль")
            return;
        }

        const userEmailOrPhone = json.users.find((user: IUser) => user.email === date.email_or_phone || user.phone === date.email_or_phone && user.password === date.password);
        if (!userEmailOrPhone) {
            alert("Данные введены не верно, попробуйте ещё раз")
            return;
        }
        alert("Вы успешно вошли")

        router.replace('./account');
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
                <form className={styles.form}>
                    <h1 className={styles.bigBlackText} style={{fontSize: 40, paddingLeft: 120}}>Вход</h1>
                    <h3 className={styles.text} style={{paddingTop: 35, fontSize: 16}}>Введите электронную почту/номер телефона</h3>
                    <input className={styles.input} style={{width: 335}} type="text" value={date.email_or_phone} onChange={(e) => handleFieldChange("email_or_phone", e)}
                           title="Пример: Ivanov@mail.ru"/>
                    <h3 className={styles.text} style={{fontSize: 16, paddingTop: 10}}>Введите пароль</h3>
                    <input className={styles.passwordInput} style={{width: 335}} type="password" value={date.password} onChange={(e) => handleFieldChange("password", e)}
                           title="Пароль должен быть не менее 8 символов"/>
                    <br/>
                    <button className={styles.button} style={{width: 351, marginTop: 20, fontSize: 20}} onClick={checkDate} title="Нажмите кнопку что бы войти">Войти</button>
                    <br/>
                    <a href="registration" className={styles.link} style={{paddingLeft: 50, fontSize: 16}}>Нет аккаунта, зарегистрируйтесь</a>
                </form>
            </div>
        </div>
    )
}
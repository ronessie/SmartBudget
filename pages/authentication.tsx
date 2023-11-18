import React, {useState} from "react";
import styles from '../styles/pages.module.css'
import validator from 'validator';
import IUser from "@/src/types/IUser";

export default function Page() {
    const [date, setDate] = useState({
        email_or_phone: "",
        password: "",
        status: "NotAuthorized",
    });

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
        //goToAccount()
        alert("Вы успешно вошли")
    }

    /*function goToAccount()
    {
        const router = useRouter()
        router.push('/account')
    }*/

    function handleFieldChange(fieldName: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setDate({
            ...date,
            [fieldName]: event.target.value,
        });
    }

    return (
        <div className={styles.page}>
            <div className={styles.auth}>
                <h3 className={styles.text}>Введите электронную почту/номер телефона</h3>
                <input className={styles.input} type="text" value={date.email_or_phone} onChange={(e) => handleFieldChange("email_or_phone", e)}
                    title="Пример: Ivanov@mail.ru"/>
                <h3 className={styles.text}>Введите пароль</h3>
                <input className={styles.passwordInput} type="password" value={date.password} onChange={(e) => handleFieldChange("password", e)}
                    title="Пароль должен быть не менее 8 символов"/>
                <br/>
                <button className={styles.button} onClick={checkDate} title="Нажмите кнопку что бы войти">Войти</button>
                <br/>
                <a href="registration" className={styles.link}>Нет аккаунта, зарегистрируйтесь</a>
            </div>
        </div>
    )
}
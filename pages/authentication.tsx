import React, {useState} from "react";
import '../styles/test.module.css'
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

        /// ПРОВЕРЕНО ВСЁ ЧТО СВЕРХУ
        /// ПРОВЕРКИ ВНИЗУ НЕ РАБОТАЮТ :(
        const userEmailOrPhone = json.users.find((user: IUser) => user.email === date.email_or_phone || user.phone === date.email_or_phone && user.password === date.password);
        if (!userEmailOrPhone) {
            alert("Данные введены не верно, попробуйте ещё раз")
            return;
        }
        alert("Вы успешно вошли")
    }

    function handleFieldChange(fieldName: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setDate({
            ...date,
            [fieldName]: event.target.value,
        });
    }

    return (
        <div className="auth">
            <h3>Введите электронную почту/номер телефона</h3>
            <input type="text" value={date.email_or_phone} onChange={(e) => handleFieldChange("email_or_phone", e)}
                   title="Пример: Ivanov@mail.ru"/>
            <h3>Введите пароль</h3>
            <input type="text" value={date.password} onChange={(e) => handleFieldChange("password", e)}
                   title="Пароль должен быть не менее 8 символов"/>
            <br/>
            <button onClick={checkDate} title="Нажмите кнопку что бы войти">Войти</button>
            <br/>
            <a href="registration">Нет аккаунта, зарегистрируйтесь</a>
        </div>
    )
}
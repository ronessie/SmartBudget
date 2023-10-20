import React, {useState} from "react";
import '../styles/test.css'
import validator from 'validator';

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

        if (!validator.isMobilePhone(date.email_or_phone) || !validator.isEmail(date.email_or_phone)) {
            alert("Электронная почта или пароль введены не верно")
            return;
        }
        let attempt = 0;
        for (let f = 0; f < 3; f++) {
            for (let i = 0; i < json.length + 1; i++) {
                if (json.users[i].password != date.password) {
                    attempt++;
                    alert("Пароль введён не верно, осталось " + attempt + " попыток")
                    return;
                }
                if (json.users[i].email != date.email_or_phone || json.users[i].phone != date.email_or_phone) {
                    attempt++;
                    alert("Пользователя с таким номером телефона/адресом электронной почты")
                    return;
                }
            }
        }
        if (attempt == 3) {
            alert("тут должно быть предложено восстановить пароль")
        }
        if (attempt == 5) {
            alert("Тут должна быть блокировка на 1-5 минут")
        }
        alert("Вы успешно вошли")
    }
    function handleFieldChange(fieldName: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setDate({
            ...date,
            [fieldName]: event.target.value,
        });
    }

    return(
        <div className="auth">
            <h3>Введите электронную почту/номер телефона</h3>
            <input type="text" value={date.email_or_phone} onChange={(e) => handleFieldChange("email_or_phone", e)} title="Пример: Ivanov@mail.ru"/>
            <h3>Введите пароль</h3>
            <input type="text" value={date.password} onChange={(e) => handleFieldChange("password", e)} title="Пароль должен быть не менее 8 символов" />
            <br />
            <button onClick={checkDate} title="Нажмите кнопку что бы войти">Сохранить</button>
            <br />
            <a href="registration">Нет аккаунта, зарегистрируйтесь</a>
        </div>
    )
}
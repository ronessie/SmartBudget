import React, {useState} from "react";
import '../styles/test.css'
import validator from 'validator';

export default function Page() {
    const [date, setDate] = useState({
        email_or_phone: "",
        password: "",
        status: "NotAuthorized",
    });
    function checkDate()
    {
        if(!validator.isMobilePhone(date.email_or_phone) || !validator.isEmail(date.email_or_phone))
        {
            alert("Электронная почта или пароль введены не верно")
            return;
        }
    }
    function dateToDB()
    {

    }
    return(
        <div>
            <h3>Введите электронную почту/номер телефона</h3>
            <input type="text" value={date.email_or_phone} title="Пример: Ivanov@mail.ru"/>
            <h3>Введите пароль</h3>
            <input type="text" value={date.password} title="Пароль должен быть не менее 8 символов" />
            <br />
            <button title="Нажмите кнопку что бы войти">Сохранить</button>
            <br />
            <a href="registration">Нет аккаунта, зарегистрируйтесь</a>
        </div>
    )
}
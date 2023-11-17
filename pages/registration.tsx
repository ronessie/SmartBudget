import IUser from "@/src/types/IUser";
import { ObjectId } from "bson";
import React, { useState } from "react";
import styles from '../styles/pages.module.css'
import validator from 'validator';
import '../styles/pages.module.css'
export default function Page() {
    const [date, setDate] = useState({
        fio: "",
        email: "",
        phone: "",
        password: "",
        checkPassword: "",
        country:"RU",
        language: "ru",
        status: "NotAuthorized",
    });

    function handleFieldChange(fieldName: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setDate({
            ...date,
            [fieldName]: event.target.value,
        });
    }

    async function dateValidation() {
        const response = await fetch(`/api/auth/users`);
        if (!response.ok) throw new Error(response.statusText);
        const json = await response.json();
        const userExist = json.users.find((user: IUser) => user.email === date.email || user.phone === date.phone);

        if (!date.fio || !date.email || !date.phone || !date.password || !date.checkPassword) {
            alert("Все поля являются обязательными, проверьте введённые данные и попробуйте ещё раз")
            return
        }
        if (!(/^[A-Za-zА-Яа-яЁё\s]+$/).test(date.fio)) {
            alert("ФИО введено не верно")
            return;
        }
        if (!validator.isEmail(date.email)) {
            alert("Почта введена не верно")
            return;
        }
        if (!validator.isMobilePhone(date.phone)) {
            alert("Телефон введён не верно")
            return;
        }
        if (date.password.length < 8) {
            alert("Пароль должен содержать не менее 8 символов")
            return;
        }
        if (date.password != date.checkPassword) {
            alert("Пароль введён не верно")
            return;
        }
        if (!userExist)
        {
            dateToDB()
        }
        else {
            alert("Аккаунт с такой почтой/номером телефона уже существует")
        }
    }

    async function dateToDB() {
        const user: IUser = {
            _id: new ObjectId(),
            fio: date.fio,
            email: date.email,
            phone: date.phone,
            password: date.password,
            language: date.language,
            country: date.country,
            status: "Autorization",
        };

        const response = await fetch(`/api/auth/${JSON.stringify(user)}`);

        if (!response.ok) throw new Error(response.statusText);
        console.log(user);
    }


    return (
        <div className={styles.page}>
            <div className={styles.registration}>
                <h3 className={styles.text}>Введите ФИО</h3>
                <input type="text" value={date.fio} className={styles.input} onChange={(e) => handleFieldChange("fio", e)} title="Пример: Иванов Иван Иванович" />
                <h3 className={styles.text}>Введите эл. почту</h3>
                <input type="text" value={date.email} className={styles.input} onChange={(e) => handleFieldChange("email", e)} title="Пример: Ivanov@mail.ru"/>
                <h3 className={styles.text}>Введите номер телефона</h3>
                <input type="text" value={date.phone} className={styles.input} onChange={(e) => handleFieldChange("phone", e)} title="Пример: +777777777777"/>
                <h3 className={styles.text}>Введите пароль</h3>
                <input type="password" className={styles.passwordInput} value={date.password} id="pas" onChange={(e) => handleFieldChange("password", e)} title="Пароль должен быть не менее 8 символов" />
                <h3 className={styles.text}>Подтвердите пароль</h3>
                <input type="password" className={styles.passwordInput} value={date.checkPassword} onChange={(e) => handleFieldChange("checkPassword", e)} title="Повторите пароль" />
                <br />
                <h3 className={styles.text}>Выберите страну</h3>
                <select className={styles.selector} value={date.country} onChange={(e) => handleFieldChange("country", e)} title="Укажите страну в которой Вы находитесь. Пример: Беларусь">
                    <option value="RU">Россия</option>
                    <option value="BY">Беларусь</option>
                    <option value="US">США</option>
                    <option value="GB">Великобритания</option>
                    <option value="PL">Польша</option>
                    <option value="LT">Литва</option>
                    <option value="DE">Германия</option>
                </select>
                <br />
                <h3 className={styles.text}>Выберите язык</h3>
                <select className={styles.selector} value={date.language} onChange={(e) => handleFieldChange("language", e)} title="Выберите язык. Пример: русский">
                    <option value="ru">Русский</option>
                    <option value="en">Английский</option>
                </select>
                <br />
                <button className={styles.button} onClick={dateValidation} title="Нажмите кнопку что бы зарегистрироваться">Сохранить</button>
                <br />
                <a className={styles.link} href="authentication">У Вас уже есть аккаунт, войдите</a>
            </div>
        </div>
    );
}
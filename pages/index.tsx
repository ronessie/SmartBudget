import IUser from "@/src/types/IUser";
import { ObjectId } from "bson";
import React, { useState } from "react";
import validator from 'validator';

export default function Page() {
    const [date, setDate] = useState({
        fio: "",
        email: "",
        phone: "",
        password: "",
        checkPassword: "",
        country:"",
        language: "",
        status: "NotAuthorized",
    });

    function handleFieldChange(fieldName: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setDate({
            ...date,
            [fieldName]: event.target.value,
        });
    }

    function validatePhoneNumber(phoneNumber: string) {
        return validator.isMobilePhone(phoneNumber);
    }
    function validateEmail(email: string)
    {
        return validator.isEmail(email);
    }
    function isTextOnly(inputText: string) {
        return /^[a-zA-Z]+$/.test(inputText);
    }

    function dateValidation() {
        if (date.fio !== "" && date.email !== "" && date.phone !== "" && date.password !== "" && date.checkPassword !== "")
        {
            if (isTextOnly(date.fio))
            {
                if (validateEmail(date.email)) {
                    if (validatePhoneNumber(date.phone)) {
                        if (date.password == date.checkPassword) {
                            dateToDB()
                        } else {
                            alert("Пароль введён не верно")
                        }
                    }
                    else {
                        alert("Номер телефона введён не верно")
                    }
                }
                else {
                    alert("Почта введена не верно")
                }
            }
            else {
                alert("Имя введено не верно")
            }
        }
        else {
            alert("Все поля являются обязательными, проверьте введённые данные и попробуйте ещё раз")
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

        const response = await fetch(`/api/test/${JSON.stringify(user)}`);

        if (!response.ok) throw new Error(response.statusText);
        console.log(user);
    }

    return (
        <div>
            <h3>Введите ФИО</h3>
            <input type="text" value={date.fio} onChange={(e) => handleFieldChange("fio", e)} title="Пример: Иванов Иван Иванович" />
            <h3>Введите эл. почту</h3>
            <input type="text" value={date.email} onChange={(e) => handleFieldChange("email", e)} title="Пример: Ivanov@mail.ru"/>
            <h3>Введите номер телефона</h3>
            <input type="text" value={date.phone} onChange={(e) => handleFieldChange("phone", e)} />
            <h3>Введите пароль</h3>
            <input type="text" value={date.password} id="pas" onChange={(e) => handleFieldChange("password", e)} />
            <h3>Подтвердите пароль</h3>
            <input type="text" value={date.checkPassword} onChange={(e) => handleFieldChange("checkPassword", e)} />
            <br />
            <h3>Выберите страну</h3>
            <select value={date.country} onChange={(e) => handleFieldChange("country", e)}>
                <option value="RU">Россия</option>
                <option value="BY">Беларусь</option>
                <option value="US">США</option>
                <option value="GB">Великобритания</option>
                <option value="PL">Польша</option>
                <option value="LT">Литва</option>
                <option value="DE">Германия</option>
            </select>
            <br />
            <h3>Выберите язык</h3>
            <select value={date.language} onChange={(e) => handleFieldChange("language", e)}>
                <option value="ru">Русский</option>
                <option value="en">Английский</option>
            </select>
            <br />
            <button onClick={dateValidation}>Сохранить</button>
        </div>
    );
}
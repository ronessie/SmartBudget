"use client"
import IUser from "@/src/types/IUser";
import {ObjectId} from "bson";
import {useState} from "react";
import React from "react";

export default function Page() {
    const [date, setDate] = useState({
        fio: "", email: "lala", phone: "", password: "",
        checkPassword: "", language: "", status: "NotAuthorized"
    })

    function handleFioChange(event: any) {
        setDate({
            ...date,
            [date.fio]: event.target.value,
        })
        console.log(date.fio)
    }
    function handleEmailChange(event: any) {
        setDate({
            ...date,
            [date.email]: event.target.value,
        })
        console.log(date.email)
    }
    function handlePhoneChange(event: any) {
        setDate({
            ...date,
            [date.phone]: event.target.value,
        })
    }
    function handlePasswordChange(event: any) {
        setDate({
            ...date,
            [date.password]: event.target.value,
        })
    }
    function handleCheckPasswordChange(event: any) {
        setDate({
            ...date,
            [date.checkPassword]: event.target.value,
        })
    }
    function handleLanguageChange(event: any) {
        setDate({
            ...date,
            [date.language]: event.target.value,
        })
    }

    async function dateToDB() {
        const user: IUser = {
            _id: new ObjectId(),
            fio: "Veronika",
            email: "lala@mail.ru",
            phone: "+375889462151",
            password: "password",
            language: "ru",
            status: "autorization",
        };
        alert(date.fio.toString())
        alert(date.language.toString())
        /*const response = await fetch(
            `/api/test/${JSON.stringify(user)}`
        );

        if (!response.ok) throw new Error(response.statusText);
        console.log(user)*/
    }

    return (
        <div>
            <h3>Введите ФИО</h3>
            <input type={"text"} onChange={handleFioChange}></input>
            <h3>Введите эл. почту</h3>
            <input type={"text"} onChange={handleEmailChange}></input>
            <h3>Введите номер телефона</h3>
            <input type={"text"} onChange={handlePhoneChange}></input>
            <h3>Введите пароль</h3>
            <input type={"text"} onChange={handlePasswordChange}></input>
            <h3>Подтвердите пароль</h3>
            <input type={"text"} onChange={handleCheckPasswordChange}></input><br/>
            <h3>Выберите язык</h3>
            <select onSelect={handleLanguageChange}>
                <option value="ru">Русский</option>
                <option value="en">Английский</option>
            </select><br/>
            <button onClick={dateToDB}>Сохранить</button>
        </div>)
}
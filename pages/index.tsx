import IUser from "@/src/types/IUser";
import { ObjectId } from "bson";
import React, { useState } from "react";

export default function Page() {
    const [date, setDate] = useState({
        fio: "",
        email: "",
        phone: "",
        password: "",
        checkPassword: "",
        language: "",
        status: "NotAuthorized",
    });

    function handleFieldChange(fieldName: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setDate({
            ...date,
            [fieldName]: event.target.value,
        });
    }

    async function dateToDB() {
        const user: IUser = {
            _id: new ObjectId(),
            fio: date.fio,
            email: date.email,
            phone: date.phone,
            password: date.password,
            language: date.language,
            status: "Autorization",
        };

        const response = await fetch(`/api/test/${JSON.stringify(user)}`);

        if (!response.ok) throw new Error(response.statusText);
        console.log(user);
    }

    return (
        <div>
            <h3>Введите ФИО</h3>
            <input type="text" value={date.fio} onChange={(e) => handleFieldChange("fio", e)} />
            <h3>Введите эл. почту</h3>
            <input type="text" value={date.email} onChange={(e) => handleFieldChange("email", e)} />
            <h3>Введите номер телефона</h3>
            <input type="text" value={date.phone} onChange={(e) => handleFieldChange("phone", e)} />
            <h3>Введите пароль</h3>
            <input type="text" value={date.password} onChange={(e) => handleFieldChange("password", e)} />
            <h3>Подтвердите пароль</h3>
            <input type="text" value={date.checkPassword} onChange={(e) => handleFieldChange("checkPassword", e)} />
            <br />
            <h3>Выберите язык</h3>
            <select value={date.language} onChange={(e) => handleFieldChange("language", e)}>
                <option value="ru">Русский</option>
                <option value="en">Английский</option>
            </select>
            <br />
            <button onClick={dateToDB}>Сохранить</button>
        </div>
    );
}
import {GetServerSideProps} from "next";
import IUser from "@/src/types/IUser";
import {ObjectId} from "bson";

export default function Page() {
    async function fioToDB() {
        const user: IUser = {
            _id: new ObjectId(),
            fio: "Veronika",
            email: "lala@mail.ru",
            phone: "+375889462151",
            password: "password",
            language: "ru",
            status: "autorization",
        };
        const response = await fetch(
            `/api/test/${JSON.stringify(user)}`
        );

        if (!response.ok) throw new Error(response.statusText);
        console.log(user)
    }

    return (
        <div>
            <h2>Введите ФИО</h2>
            <input type={"text"}></input>
            <h2>Введите эл. почту</h2>
            <input type={"text"}></input>
            <h2>Введите номер телефона</h2>
            <input type={"text"}></input>
            <h2>Введите пароль</h2>
            <input type={"text"}></input>
            <h2>Подтвердите пароль</h2>
            <input type={"text"}></input><br/>
            <button onClick={fioToDB}>Сохранить</button>
        </div>)
}
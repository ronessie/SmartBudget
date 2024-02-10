import IUser from "@/src/types/IUser";
import { ObjectId } from "bson";
import React, { useState } from "react";
import styles from '../styles/pages.module.css'
import validator from 'validator';
import '../styles/pages.module.css'
import {useRouter} from "next/navigation";
import {signIn} from "next-auth/react";
import IBankAccount from "@/src/types/IBankAccount";
import Link from "next/link";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {TextInput} from "@mantine/core";
export default function Page() {
    const [data, setData] = useState({
        fio: "",
        email: "",
        password: "",
        checkPassword: "",
        status: "NotAuthorized",
    });

    const router = useRouter();

    function handleFieldChange(fieldName: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setData({
            ...data,
            [fieldName]: event.target.value,
        });
    }

    async function dateValidation(e: any) {
        e.preventDefault();
        const response = await fetch(`/api/authentication/users`);
        if (!response.ok) throw new Error(response.statusText);
        const json = await response.json();
        const userExist = json.users.find((user: IUser) => user.email === data.email);

        if (!data.fio || !data.email || !data.password || !data.checkPassword) {
            alert("Все поля являются обязательными, проверьте введённые данные и попробуйте ещё раз")
            return
        }
        if (!(/^[A-Za-zА-Яа-яЁё\s]+$/).test(data.fio)) {
            alert("ФИО введено не верно")
            return;
        }
        if (!validator.isEmail(data.email.trim())) {
            alert("Почта введена не верно")
            return;
        }
        if (data.password.length < 8) {
            alert("Пароль должен содержать не менее 8 символов")
            return;
        }
        if (data.password != data.checkPassword) {
            alert("Пароль введён не верно")
            return;
        }
        if (!userExist)
        {
            await dateToDB()
            await signIn('credentials', {username: data.email, password: data.password, redirect: false});
            router.push('/main')
        }
        else {
            alert("Аккаунт с такой почтой уже существует")
        }
    }

    function inviteCode()
    {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
        let code = '';
        for (let i = 0; i < 16; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
    }

    async function dateToDB() {
        const bankAccount_id = new ObjectId();
        const user: IUser = {
            _id: new ObjectId(),
            fio: data.fio,
            email: data.email,
            password: data.password,
            status: "Authorized",
            currentBankAccount: bankAccount_id,
            twoStepAuth: false
        };

        const userResponse = await fetch(`/api/authentication/${JSON.stringify(user)}`);

        if (!userResponse.ok) throw new Error(userResponse.statusText);
        console.log(user);

        const bankAccount: IBankAccount = {
            _id: bankAccount_id,
            user_id: user._id,
            name: "Счёт",
            currency: "BYN",
            balance: 0,
            invitingCode: inviteCode(),
        };

        const response = await fetch(`/api/addBankAccount/${JSON.stringify(bankAccount)}`);

        if (!response.ok) throw new Error(response.statusText);
        console.log(user);
    }

    async function googleAuthentication(e: any)
    {
        e. preventDefault();
        await signIn('google');
    }


    return (
        <div className={styles.page}>
            <div className={styles.registration}>
                <form className={styles.form} style={{height: 550}}>
                    <h1 className={styles.bigBlackText} style={{marginTop: 5, paddingBottom: 25, fontSize: 35, paddingLeft: 30}}>Регистрация</h1>
                    <TextInput
                        withAsterisk
                        label="Введите ФИО"
                        placeholder="Иванов Иван Иванович"
                        value = {data.fio}
                        onChange = {(e) => handleFieldChange("fio", e)}
                        title="Пример: Иванов Иван Иванович"
                    />
                    <TextInput
                        withAsterisk
                        label="Введите эл. почту"
                        placeholder="your@email.com"
                        value = {data.email}
                        onChange = {(e) => handleFieldChange("email", e)}
                        title="Пример: your@email.com"
                    />
                    <TextInput
                        withAsterisk
                        label="Введите пароль"
                        value = {data.password}
                        onChange = {(e) => handleFieldChange("password", e)}
                        title="Пароль должен быть не менее 8 символов"
                        type = "password"
                    />
                    <TextInput
                        withAsterisk
                        label="Подтвердите пароль"
                        value = {data.checkPassword}
                        onChange = {(e) => handleFieldChange("checkPassword", e)}
                        title="Пароль должен быть не менее 8 символов"
                        type = "password"
                    />
                    <button className={styles.button} onClick={dateValidation} style={{width: 275, marginTop: 20, fontSize: 20}} title="Нажмите кнопку что бы зарегистрироваться">Зарегистрироваться</button>
                    <br />
                    <button className={styles.button} onClick={googleAuthentication} style={{width: 275, marginTop: 5, fontSize: 20, backgroundColor: "grey"}}>Вход с помощью Google</button>
                    <Link className={styles.link} href={"authentication"}>У Вас уже есть аккаунт, войдите</Link>
                </form>
            </div>
        </div>
    );
}

export const getServerSideProps = async (ctx: any) => ({
    props: {
        ...(await serverSideTranslations(ctx.locale, ['common']))
    }
});
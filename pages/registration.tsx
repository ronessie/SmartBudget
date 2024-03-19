import IUser from "@/src/types/IUser";
import {ObjectId} from "bson";
import React, {useState} from "react";
import styles from '../styles/pages.module.css'
import validator from 'validator';
import '../styles/pages.module.css'
import {useRouter} from "next/navigation";
import {signIn} from "next-auth/react";
import {useTranslation} from 'next-i18next';
import Link from "next/link";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {Button, PasswordInput, TextInput} from "@mantine/core";
import {createBankAccountObj, createUserObj} from "@/src/utils";

export default function Page() {
    const [data, setData] = useState({
        fio: "",
        email: "",
        password: "",
        checkPassword: "",
        status: "NotAuthorized",
    });

    const router = useRouter();
    const {t} = useTranslation('common');

    function handleFieldChange(fieldName: string, value: any) {
        setData({
            ...data,
            [fieldName]: value,
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
        if (!userExist) {
            await dateToDB()
            await signIn('credentials', {username: data.email, password: data.password, redirect: false});
            router.push('/main')
        } else {
            alert("Аккаунт с такой почтой уже существует")
        }
    }

    async function dateToDB() {
        const bankAccount_id = new ObjectId().toString();

        const user = createUserObj(data.fio, data.email, data.password, bankAccount_id);

        const userResponse = await fetch(`/api/authentication/${JSON.stringify(user)}`);
        if (!userResponse.ok) throw new Error(userResponse.statusText);

        const bankAccount = createBankAccountObj(user._id, bankAccount_id);

        const response = await fetch(`/api/addBankAccount/${JSON.stringify(bankAccount)}`);
        if (!response.ok) throw new Error(response.statusText);
    }

    async function googleAuthentication(e: any) {
        e.preventDefault();
        await signIn('google', { callbackUrl: '/main' } );
    }

    return (
        <div className={styles.page}>
            <div className={styles.registration}>
                <form className={styles.form} style={{height: 550}}>
                    <h1 className={styles.bigBlackText}
                        style={{marginTop: 5, paddingBottom: 25, fontSize: 35, paddingLeft: 30}}>{t('registrationPage.label')}</h1>
                    <TextInput
                        withAsterisk
                        label={t('registrationPage.inputFIO')}
                        placeholder={t('registrationPage.inputPlaceholder.fio')}
                        value={data.fio}
                        onChange={(e) => handleFieldChange("fio", e.target.value)}
                        title={t('registrationPage.placeholder.fio')}
                    />
                    <TextInput
                        withAsterisk
                        label={t('registrationPage.inputEmail')}
                        placeholder={t('registrationPage.inputPlaceholder.email')}
                        value={data.email}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        title={t('registrationPage.placeholder.email')}
                    />
                    <PasswordInput
                        withAsterisk
                        label={t('registrationPage.inputPassword')}
                        value={data.password}
                        onChange={(e) => handleFieldChange("password", e.target.value)}
                        title={t('registrationPage.placeholder.password')}
                    />
                    <PasswordInput
                        withAsterisk
                        label={t('registrationPage.checkPassword')}
                        value={data.checkPassword}
                        onChange={(e) => handleFieldChange("checkPassword", e.target.value)}
                        title={t('registrationPage.placeholder.password')}
                    />
                    <Button className={styles.button} onClick={dateValidation}
                            style={{width: 275, marginTop: 20, fontSize: 20}}
                            title={t('registrationPage.placeholder.button')}>{t('registrationPage.button')}</Button>
                    <br/>
                    <Button className={styles.button} onClick={googleAuthentication}
                            style={{width: 275, marginTop: 5, fontSize: 20, backgroundColor: "grey"}}>{t('registrationPage.googleButton')}</Button>
                    <Link className={styles.link} href={"authentication"}>{t('registrationPage.link')}</Link>
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

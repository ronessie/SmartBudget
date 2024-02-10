import '../styles/pages.module.css'
import IUser from "@/src/types/IUser";
import React, {useState} from "react";
import styles from '../styles/pages.module.css'
import {useRouter} from "next/router";
import {getSession} from "next-auth/react";
import {connectToDatabase} from "@/src/database";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {ObjectId} from "bson";
import Link from "next/link";
import IBankAccount from "@/src/types/IBankAccount";
import {modals} from "@mantine/modals";
import {Button, Group, NativeSelect, TextInput} from "@mantine/core";

export default function Page(props: { user: IUser, currentBankAccount: ObjectId }) {
    const [data, setData] = useState({
        name: "Счёт",
        currency: "BYN",
        balance: 0,
        lastBalanceUpdateDate: new Date(),
        inviteCode: "",
        date: new Date(),
    });

    function handleFieldChange(fieldName: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setData({
            ...data,
            [fieldName]: event.target.value,
        });
    }

    function inviteCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
        let code = '';
        for (let i = 0; i < 16; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
    }

    async function dateValidation(e: any) {
        e.preventDefault();
        const response = await fetch(`/api/addBankAccount/bankAccounts`);
        if (!response.ok) throw new Error(response.statusText);

        if (!data.balance || !(/^[\d]+$/).test(data.balance.toString())) {
            alert("Сумма введена не верно, попробуйте ещё раз.")
            return
        }
        if (!data.name) {
            alert("Укажите название счёта")
            return
        } else {
            await dateToDB();
            alert("всё оки, работаем дальше")
            await router.push('/main')
        }
    }

    async function checkInviteCode(e: any) {
        e.preventDefault()
        const response = await fetch(`/api/addBankAccount/bankAccounts`);

        if (!response.ok) throw new Error(response.statusText);

        const json = await response.json();
        const inviteToBankAccount = json.users.find((bankAccount: IBankAccount) => bankAccount.invitingCode === data.inviteCode)//тут проблемкинс
        if (!inviteToBankAccount) {
            alert("Код введён не верно, попробуйте ещё раз")  // попробовать отменить перезагрузку
            return;
        } else {
            alert("Всё круто")
            await router.push('/main')
            //тут надо прописать смену текущего аккаунта для данного пользователя и переход на главную
        }
    }

    async function dateToDB() {
        const bankAccount: IBankAccount = {
            _id: new ObjectId(),
            user_id: props.user._id,
            name: data.name,
            currency: data.currency,
            balance: data.balance,
            invitingCode: inviteCode(),
        };

        const response = await fetch(`/api/addBankAccount/${JSON.stringify(bankAccount)}`);

        if (!response.ok) throw new Error(response.statusText);
    }

    const router = useRouter();

    return (
        <div>
            <h2>ФИО:</h2><h3>{props.user.fio}</h3>
            <h2>Электронная почта:</h2><h3>{props.user.email}</h3>
            <Button style={{width: 200}} className={styles.button} onClick={() => {
                modals.open({
                    title: 'Добавление счёта',
                    children: (
                        <>
                            <TextInput
                                label="Введите название счёта"
                                placeholder="Счёт"
                                onChange={(e) => handleFieldChange("name", e)}
                                title="Пример: Счёт №1"
                            />
                            <Group>
                                <TextInput
                                    label="Введите
                                начальную сумму"
                                    placeholder="1000"
                                    style={{width: 310}}
                                    onChange={(e) => handleFieldChange("balance", e)}
                                    title="Пример: 1000 BYN"
                                />
                                <NativeSelect label="Укажите валюту"
                                              onChange={(e) => handleFieldChange("currency", e)}
                                              title="Укажите валюту. Пример: BYN"
                                              data={['BYN', 'RUB', 'USD', 'PLN', 'EUR']}>
                                </NativeSelect></Group>
                            <Button className={styles.button} onClick={dateValidation}
                                    style={{width: 410, marginTop: 20, fontSize: 20}}>Добавить
                            </Button>

                            <Link className={styles.link} style={{paddingLeft: 100}} href={""} onClick={() => {
                                modals.open({
                                    title: 'Подключение к банковскому счёту',
                                    children: (
                                        <>
                                            <TextInput
                                                label="Введите пригласительный код"
                                                onChange={(e) => handleFieldChange("inviteCode", e)}
                                                title="Введите 16-значный код"
                                            />
                                            <Button className={styles.button} onClick={checkInviteCode}
                                                    style={{width: 410, marginTop: 20, fontSize: 20}}>Добавить
                                            </Button>
                                        </>
                                    ),
                                });
                            }}
                            >У меня есть пригласительный код</Link>
                        </>
                    ),
                });
            }}
            >Добавить счёт</Button>
            <br/>
            <button style={{width: 200}} className={styles.button}>Сменить счёт</button>
            <button style={{width: 200}} className={styles.button}>Удалить счёт</button>
        </div>
    )
}
//доделать функционал кнопок
export const getServerSideProps = async (ctx: any) => {
    const session = await getSession(ctx);

    const {db} = await connectToDatabase();

    const user = (await db.collection('users').findOne({email: session?.user?.email})) as IUser;

    return {
        props: {
            user: user, currentBankAccount: session?.user,
            ...(await serverSideTranslations(ctx.locale, ['common']))
        }
    }
};
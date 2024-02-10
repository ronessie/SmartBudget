import styles from '../styles/pages.module.css'
import IUser from "@/src/types/IUser";
import {ObjectId} from "bson";
import {getSession, useSession} from "next-auth/react";
import React, {useState} from 'react';
import Link from "next/link";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import IOperation from "@/src/types/IOperation";
import validator from "validator";
import {connectToDatabase} from "@/src/database";
import IBankAccount from "@/src/types/IBankAccount";
import {Button, Group, NativeSelect, TextInput} from "@mantine/core";
import {modals} from "@mantine/modals";
import {DateInput} from '@mantine/dates';


export default function Page(props: { user: IUser, currentBankAccount: ObjectId, bankAccount: IBankAccount }) {
    const [data, setData] = useState({
        sum: "",
        currency: "BYN",
        category: "",
        date: new Date(),
        status: "",
        balance: 0,
        lastUpdateDate: Date.now(),
        operationStatus: "",
        newBalance: 0
    });


    function handleFieldChange(fieldName: string, value: any) {
        setData({
            ...data,
            [fieldName]: value,
        });
    }

    async function addIncome(e: any) {
        e.preventDefault()
        data.operationStatus = "+";
        if (!data.category) data.category = "salary";
        await dateValidation();
    }

    async function addExpenses(e: any) {
        e.preventDefault()
        data.operationStatus = "-";
        if (!data.category) data.category = "products";
        await dateValidation()
    }

    async function dateToDB() {
        const operation: IOperation = {
            _id: new ObjectId(),
            user_id: props.user._id,
            bankAccount_id: props.currentBankAccount,
            sum: parseFloat(data.sum),
            currency: data.currency,
            date: data.date,
            category: data.category,
            operationsStatus: data.operationStatus
        };

        const response = await fetch(`/api/addOperation/${JSON.stringify(operation)}`);

        if (!response.ok) throw new Error(response.statusText);
        alert("всё оки, работаем дальше")
        await updateBalance()
    }

    async function updateBalance() {
        console.log('updateBalance')

        const responseUpdate = await fetch('/api/updateBalance', {
            method: 'POST',
            body: JSON.stringify({
                currentBankAccount_id: props.currentBankAccount.id,
                sum: data.sum,
                operationStatus: data.operationStatus,
                balance: props.bankAccount.balance
            }),
        });
        alert("hello2")
        if (!responseUpdate.ok) throw new Error(responseUpdate.statusText);
        alert("Операция проведена успешно")
    }

    async function dateValidation() {
        const response = await fetch(`/api/addOperation/operations`);
        if (!response.ok) throw new Error(response.statusText);

        if (!data.sum || !(/^[\d]+$/).test(data.sum.toString())) {
            alert("Сумма введена не верно, попробуйте ещё раз." + data.sum)
            return
        }
        if ((!data.date || !validator.isDate(data.date.toString())) && data.date > new Date()) {
            alert("Дата введена не верно")
            return
        } else {
            await dateToDB();
        }
    }

    const {data: session} = useSession();
    console.log(session);

    return (
        <div className={styles.page}>
            <div className={styles.pages}>
                <div className={styles.conteiners}>
                    <h1 className={styles.bigBlackText}>Здравствуйте, {props.user.fio}</h1>
                    <Link href={"settings"}
                          style={{fontSize: 32, marginTop: 15, textDecorationLine: "none", marginRight: 15}}>⚙️</Link>
                </div>
                <h1 className={styles.text}>Ваш счёт</h1>
                <div className={styles.rectangle}><br/>
                    <h1 className={styles.whiteText}>{props.bankAccount.name}</h1><br/>
                    <h1 className={styles.bigWhiteText}>{props.bankAccount.balance} {props.bankAccount.currency}</h1>
                    <br/>
                    <h1 className={styles.whiteText}>Последнее обновление 00/00/0000</h1>
                </div>
                <div>
                    <button className={styles.incomeButton} onClick={() => {
                        modals.open({
                            title: 'Добавление дохода',
                            children: (
                                <>
                                    <Group><TextInput
                                        label="Введите сумму"
                                        placeholder="Пример: 100"
                                        onChange={(e) => handleFieldChange("sum", e.target.value)}
                                        title="Пример: 100"
                                        style={{width: 300}}
                                    />
                                        <NativeSelect label="Укажите валюту"
                                                      onChange={(e) => handleFieldChange("currency", e)}
                                                      data={['BYN', 'RUB', 'USD', 'PLN', 'EUR']}
                                                      title="Выберите валюту. Пример: BYN"/>
                                    </Group>
                                    <br/>
                                    <NativeSelect label="Выберите источник дохода"
                                                  onChange={(e) => handleFieldChange("category", e)}
                                                  title="Выберите источник дохода. Пример: Подарок" data={[
                                        {value: 'salary', label: 'Зарплата'},
                                        {value: 'gift', label: 'Подарок'},
                                        {value: 'premium', label: 'Премия'},
                                        {value: 'debt refund', label: 'Возврат долга'},
                                        {value: 'cachek', label: 'Кэшбек'},
                                    ]}>
                                    </NativeSelect><br/>
                                    <DateInput onChange={(e) => handleFieldChange("date", e)}
                                               label="Укажите дату"
                                               placeholder="Date input"></DateInput>
                                    <Button className={styles.button} onClick={addIncome}
                                            style={{width: 351, marginTop: 20, fontSize: 20}}>Добавить
                                    </Button>
                                </>
                            ),
                        });
                    }}
                    >+ Доход
                    </button>
                    <button className={styles.expenseButton} onClick={() => {
                        modals.open({
                            title: 'Добавление расхода',
                            children: (
                                <>
                                    <Group><TextInput
                                        label="Введите сумму"
                                        placeholder="Пример: 100"
                                        onChange={(e) => handleFieldChange("sum", e)}
                                        title="Пример: 100"
                                        style={{width: 300}}
                                    />
                                        <NativeSelect label="Укажите валюту"
                                                      onChange={(e) => handleFieldChange("currency", e)}
                                                      data={['BYN', 'RUB', 'USD', 'PLN', 'EUR']}
                                                      title="Выберите валюту. Пример: BYN"/></Group>
                                    <br/>
                                    <NativeSelect label="Выберите категорию трат"
                                                  onChange={(e) => handleFieldChange("category", e)}
                                                  title="Выберите категорию трат. Пример: Продукты"
                                                  data={[
                                                      {value: 'products', label: 'Продукты'},
                                                      {value: 'clothes', label: 'Одежда'},
                                                      {value: 'house', label: 'жильё'},
                                                      {value: 'car', label: 'автомобиль'},
                                                      {value: 'entertainment', label: 'развлечения'},
                                                      {value: 'duty', label: 'долг'},
                                                  ]}>
                                    </NativeSelect><br/>
                                    <DateInput
                                        onChange={(e) => handleFieldChange("date", e)}
                                        label="Укажите дату"
                                        placeholder="Date input"></DateInput>
                                    <Button className={styles.button} onClick={addExpenses}
                                            style={{width: 351, marginTop: 20, fontSize: 20}}>Добавить
                                    </Button>
                                </>
                            ),
                        });
                    }}
                    >+ Расход
                    </button>
                </div>
            </div>
        </div>
    )
}

export const getServerSideProps = async (ctx: any) => {
    const session = await getSession(ctx);

    const {db} = await connectToDatabase();


    const user = (await db.collection('users').findOne({email: session?.user?.email})) as IUser;

    const bankAcc = (await db.collection('bankAccounts').findOne({_id: user.currentBankAccount})) as IBankAccount;

    return {
        props: {
            user: user, bankAccount: bankAcc, currentBankAccount: session?.user,
            ...(await serverSideTranslations(ctx.locale, ['common']))
        }
    }
};

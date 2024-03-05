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
import {Button, Modal, NativeSelect, TextInput} from "@mantine/core";
import {DateInput} from '@mantine/dates';
import {DonutChart} from "@mantine/charts";

export default function Page(props: { user: IUser, bankAccount: IBankAccount }) {
    const [incomeModalState, setIncomeModalState] = useState(false);
    const [expensesModalState, setExpensesModalState] = useState(false);
    const [data, setData] = useState({
        sum: 0.0,
        currency: props.bankAccount.currency,
        category: "",
        date: new Date(),
        status: "",
        balance: props.bankAccount.balance,
        lastUpdateDate: Date.now(),
        operationStatus: "",
        newBalance: 0
    });
    const dataChart = [
        {name: 'USA', value: 400, color: 'blue.6'},
        {name: 'India', value: 300, color: 'yellow.6'},
        {name: 'Japan', value: 100, color: 'pink.6'},
        {name: 'Other', value: 200, color: 'red.6'},
    ];


    function handleFieldChange(fieldName: string, value: any) {
        console.log(`set ${fieldName} with value: ${value}`)
        setData({
            ...data,
            [fieldName]: value,
        });
        console.log(data)
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
            _id: new ObjectId().toString(),
            user_id: props.user._id,
            bankAccount_id: props.bankAccount._id,
            sum: data.sum,
            currency: data.currency,
            date: data.date,
            category: data.category,
            operationsStatus: data.operationStatus
        };

        const response = await fetch(`/api/addOperation/${JSON.stringify(operation)}`);

        if (!response.ok) throw new Error(response.statusText);
        await updateBalance()
    }

    async function updateBalance() {
        const responseUpdate = await fetch('/api/updateBalance', {
            method: 'POST',
            body: JSON.stringify({
                currentBankAccount_id: props.bankAccount._id,
                sum: data.sum,
                operationStatus: data.operationStatus,
                balance: props.bankAccount.balance
            }),
        });
        if (!responseUpdate.ok) throw new Error(responseUpdate.statusText);
        if (data.operationStatus === '+') {
            handleFieldChange("balance", +(data?.balance ?? 0) + +data.sum)
        } else {
            handleFieldChange("balance", +(data?.balance ?? 0) - +data.sum)
        }
        setIncomeModalState(false)
        setExpensesModalState(false);
        alert("Операция проведена успешно")
    }

    async function dateValidation() {
        const response = await fetch(`/api/addOperation/operations`);
        if (!response.ok) throw new Error(response.statusText);
        console.log('data: ', data);
        if (!data.sum || !(/^[\d]+$/).test(data.sum.toString())) {
            alert("Сумма введена не верно, попробуйте ещё раз.")
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
                    <h1 className={styles.bigWhiteText}>{data.balance} {props.bankAccount.currency}</h1>
                    <br/>
                    <h1 className={styles.whiteText}>Последнее обновление 00/00/0000</h1>
                </div>
                <div>
                    <button className={styles.incomeButton} onClick={() => setIncomeModalState(!incomeModalState)}>+
                        Доход
                    </button>
                    <Modal opened={incomeModalState} onClose={() => setIncomeModalState(false)}
                           title={'Добавление дохода'}>
                        <TextInput
                            label="Введите сумму"
                            placeholder="Пример: 100"
                            onChange={(e) => handleFieldChange("sum", e.target.value)}
                            title="Пример: 100"
                        />
                        <br/>
                        <NativeSelect label="Выберите источник дохода"
                                      onChange={(e) => handleFieldChange("category", e.target.value)}
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
                                style={{width: 408, marginTop: 20, fontSize: 20}}>Добавить
                        </Button>
                    </Modal>
                    <button className={styles.expenseButton}
                            onClick={() => setExpensesModalState(!expensesModalState)}>+ Расход
                    </button>
                    <Modal opened={expensesModalState} onClose={() => setExpensesModalState(false)}
                           title={'Добавление расхода'}>
                        <TextInput
                            label="Введите сумму"
                            placeholder="Пример: 100"
                            onChange={(e) => handleFieldChange("sum", e.target.value)}
                            title="Пример: 100"
                        />
                        <br/>
                        <NativeSelect label="Выберите категорию трат"
                                      onChange={(e) => handleFieldChange("category", e.target.value)}
                                      title="Выберите категорию трат. Пример: Продукты"
                                      data={[
                                          {value: 'products', label: 'Продукты'},
                                          {value: 'clothes', label: 'Одежда'},
                                          {value: 'house', label: 'Жильё'},
                                          {value: 'car', label: 'Автомобиль'},
                                          {value: 'entertainment', label: 'Развлечения'},
                                          {value: 'duty', label: 'Долг'},
                                      ]}>
                        </NativeSelect><br/>
                        <DateInput
                            onChange={(e) => handleFieldChange("date", e)}
                            label="Укажите дату"
                            placeholder="Date input"></DateInput>
                        <Button className={styles.button} onClick={addExpenses}
                                style={{width: 408, marginTop: 20, fontSize: 20}}>Добавить
                        </Button>
                    </Modal>
                </div>
                <div>
                    <DonutChart data={dataChart} title="Расходы"/>
                    <DonutChart data={dataChart} title="Доходы"/>
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
            user: user, bankAccount: bankAcc,
            ...(await serverSideTranslations(ctx.locale, ['common']))
        }
    }
};

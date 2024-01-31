import styles from '../styles/pages.module.css'
import {useRouter} from "next/navigation";
import IUser from "@/src/types/IUser";
import {ObjectId} from "bson";
import {getSession, useSession} from "next-auth/react";
import React, {useState} from 'react';
import Link from "next/link";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Popup from "reactjs-popup";
import IOperation from "@/src/types/IOperation";
import validator from "validator";
import {connectToDatabase} from "@/src/database";


export default function Page(props: { user: IUser, currentBankAccount: ObjectId }) {
    const [data, setData] = useState({
        sum: "",
        currency: "BYN",
        category: "",
        date: new Date(),
        status: "",
        balance: 0,
        lastUpdateDate: "",
        operationStatus: ""
    });

    const router = useRouter();

    function handleFieldChange(fieldName: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setData({
            ...data,
            [fieldName]: event.target.value,
        });
    }

    function addIncome() {
        data.operationStatus = "+";
        if (!data.category) data.category = "salary";
        dateValidation();
    }

    function addExpenses() {
        data.operationStatus = "-";
        if (!data.category) data.category = "products";
        dateValidation()
    }

    async function dateToDB() {
        alert(data.category)
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
        console.log(operation);
    }

    async function dateValidation() {
        const response = await fetch(`/api/addOperation/operations`);
        if (!response.ok) throw new Error(response.statusText);

        if (!data.sum || !(/^[\d]+$/).test(data.sum)) {
            alert("Сумма введена не верно, попробуйте ещё раз.")
            return
        }
        if ((!data.date || !validator.isDate(data.date.toString())) && data.date > new Date()) {
            alert("Дата введена не верно")
            return
        }
        else {
            dateToDB();
            alert("всё оки, работаем дальше")
            router.push('/main')
        }
    }

    const {data: session} = useSession();
    console.log(session);

    return (
        <div className={styles.page}>
            <div className={styles.pages}>
                <div className={styles.conteiners}>
                    <h1 className={styles.bigBlackText}>Hi, UserName</h1>
                    <Link href={"settings"}
                          style={{fontSize: 32, marginTop: 15, textDecorationLine: "none", marginRight: 15}}>⚙️</Link>
                </div>
                <h1 className={styles.text}>Ваш счёт</h1>
                <div className={styles.rectangle}><br/>
                    <h1 className={styles.whiteText}>Счёт 1</h1><br/>
                    <h1 className={styles.bigWhiteText}>{data.balance}</h1><br/>
                    <h1 className={styles.whiteText}>Последнее обновление 29/01/22</h1>
                </div>
                <div>
                    <Popup trigger={<button className={styles.incomeButton}>+ Доход</button>}>
                        <form className={styles.form} style={{height: 420, marginLeft: 886, marginTop: 170}}>
                            <h1 className={styles.bigBlackText}
                                style={{fontSize: 27, paddingLeft: 40}}>Добавление дохода</h1><br/>
                            <h1 className={styles.text}
                                style={{fontSize: 16, margin: 0, padding: 0, marginTop: 15}}>Введите сумму</h1>
                            <br/>
                            <div><input value={data.sum} className={styles.inputMoney}
                                        onChange={(e) => handleFieldChange("sum", e)} type="text"
                                        style={{width: 260}}
                                        title="Пример: 100"/>
                                <select className={styles.selectorCurrency}
                                        onChange={(e) => handleFieldChange("currency", e)}
                                        value={data.currency} style={{width: 74}}
                                        title="Укажите валюту. Пример: BYN">
                                    <option value="BYN">BYN</option>
                                    <option value="RUB">RUB</option>
                                    <option value="USD">USD</option>
                                    <option value="PLN">PLN</option>
                                    <option value="EUR">EUR</option>
                                </select></div>
                            <br/>
                            <h1 className={styles.text} style={{fontSize: 16, margin: 0, padding: 0}}>Выберите
                                источник дохода</h1><br/>
                            <select className={styles.selector}
                                    onChange={(e) => handleFieldChange("category", e)} value={data.category}
                                    style={{width: 351}} title="Выберите источник дохода. Пример: Подарок">
                                <option value="salary">Заработная плата</option>
                                <option value="gift">Подарок</option>
                                <option value="premium">Премия</option>
                                <option value="debt refund">Возврат долга</option>
                                <option value="cachek">Кэшбэк</option>
                            </select><br/>
                            <h1 className={styles.text}
                                style={{fontSize: 16, margin: 0, padding: 0, marginTop: 17}}>Укажите дату</h1>
                            <br/>
                            <input type="date" style={{width: 337}}
                                   onChange={(e) => handleFieldChange("date", e)} className={styles.input}
                                   value={data.date.toString()}/><br/>
                            <button className={styles.button} onClick={addIncome}
                                    style={{width: 351, marginTop: 20, fontSize: 20}}>Добавить
                            </button>
                        </form>
                    </Popup>
                    <Popup trigger={<button className={styles.expenseButton}>+ Расход</button>} >
                        <form className={styles.form} style={{height: 420, marginLeft: 740, marginTop: 170}}>
                            <h1 className={styles.bigBlackText} style={{fontSize: 27, paddingLeft: 35}}>Добавление
                                расхода</h1><br/>
                            <h1 className={styles.text}
                                style={{fontSize: 16, margin: 0, padding: 0, marginTop: 15}}>Введите сумму</h1><br/>
                            <div><input value={data.sum} className={styles.inputMoney}
                                        onChange={(e) => handleFieldChange("sum", e)} type="text" style={{width: 260}}
                                        title="Пример: 100"/>
                                <select className={styles.selectorCurrency}
                                        onChange={(e) => handleFieldChange("currency", e)}
                                        value={data.currency} style={{width: 74}} title="Укажите валюту. Пример: BYN">
                                    <option value="BYN">BYN</option>
                                    <option value="RUB">RUB</option>
                                    <option value="USD">USD</option>
                                    <option value="PLN">PLN</option>
                                    <option value="EUR">EUR</option>
                                </select></div>
                            <br/>
                            <h1 className={styles.text} style={{fontSize: 16, margin: 0, padding: 0}}>Выберите категорию
                                трат</h1><br/>
                            <select className={styles.selector} onChange={(e) => handleFieldChange("category", e)}
                                    value={data.category} style={{width: 351}}
                                    title="Выберите категорию трат. Пример: Продукты">
                                <option value="products">Продукты</option>
                                <option value="clothes">Одежда</option>
                                <option value="house">Жильё</option>
                                <option value="car">Автомобиль</option>
                                <option value="entertainment">Развлечения</option>
                                <option value="duty">Долг</option>
                            </select><br/>
                            <h1 className={styles.text}
                                style={{fontSize: 16, margin: 0, padding: 0, marginTop: 17}}>Укажите дату</h1><br/>
                            <input type="date" style={{width: 337}} onChange={(e) => handleFieldChange("date", e)}
                                   className={styles.input} value={data.date.toString()}/><br/>
                            <button className={styles.button} onClick={addExpenses}
                                    style={{width: 351, marginTop: 20, fontSize: 20}}>Добавить
                            </button>
                        </form>
                    </Popup>
                </div>
            </div>
        </div>
    )
}

export const getServerSideProps = async (ctx: any) => {
    const session = await getSession(ctx);

    const {db} = await connectToDatabase();

    const user = (await db
        .collection('users')
        .find({}, {email: session?.user?.email}).toArray())[0] as IUser;

    return {
        props: {
            user: user, currentBankAccount: session?.user,
            ...(await serverSideTranslations(ctx.locale, ['common']))
        }
    }
};
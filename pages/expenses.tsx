import styles from '../styles/pages.module.css'
import React, {useState} from "react";
import {ObjectId} from "bson";
import {useRouter} from "next/navigation";
import validator from "validator";
import IOperation from "@/src/types/IOperation";
import {getSession} from "next-auth/react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {connectToDatabase} from "@/src/database";
import IUser from "@/src/types/IUser";

export default function Page(props: { user: IUser, currentBankAccount: ObjectId }) {
    const [data, setData] = useState({
        sum: "",
        currency: "",
        category: "",
        date: new Date(),
    });

    const router = useRouter();

    function handleFieldChange(fieldName: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setData({
            ...data,
            [fieldName]: event.target.value,
        });
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
            operationsStatus: "-"
        };

        const response = await fetch(`/api/addOperation/${JSON.stringify(operation)}`);
        if (!response.ok) throw new Error(response.statusText);
        console.log(operation);
    }

    async function dateValidation(e: any) {
        e.preventDefault();
        const response = await fetch(`/api/addOperation/operations`);
        if (!response.ok) throw new Error(response.statusText);

        if (!data.sum || !(/^[\d]+$/).test(data.sum)) {
            alert("Сумма введена не верно, попробуйте ещё раз.")
            return
        }
        if ((!data.date || !validator.isDate(data.date.toString())) && data.date>new Date()){
            alert("Дата введена не верно")
            return
        }
        else {
            dateToDB();
            alert("всё оки, работаем дальше")
            router.push('/main')
        }
    }

    return(
        <div className={styles.page}>
            <div className={styles.registration}>
                <form className={styles.form} style={{height: 420}}>
                    <h1 className={styles.bigBlackText} style={{fontSize: 27, paddingLeft: 25}}>Добавление операции</h1><br/>
                    <h1 className={styles.text} style={{fontSize: 16, margin:0, padding:0, marginTop: 15}}>Введите сумму</h1><br/>
                    <div><input value={data.sum} className={styles.inputMoney} onChange={(e) => handleFieldChange("sum", e)} type="text" style={{width: 260}}
                                title="Пример: 100"/>
                        <select className={styles.selectorCurrency} onChange={(e) => handleFieldChange("currency", e)}
                                value={data.currency} style={{width: 74}} title="Укажите валюту. Пример: BYN">
                            <option value="BYN">BYN</option>
                            <option value="RUB">RUB</option>
                            <option value="USD">USD</option>
                            <option value="PLN">PLN</option>
                            <option value="EUR">EUR</option>
                        </select></div>
                    <br/>
                    <h1 className={styles.text} style={{fontSize: 16, margin:0, padding:0}}>Выберите категорию трат</h1><br/>
                    <select className={styles.selector} onChange={(e) => handleFieldChange("category", e)} value={data.category} style={{width: 351}} title="Выберите категорию трат. Пример: Продукты">
                        <option value="products">Продукты</option>
                        <option value="clothes">Одежда</option>
                        <option value="house">Жильё</option>
                        <option value="car">Автомобиль</option>
                        <option value="entertainment">Развлечения</option>
                        <option value="duty">Долг</option>
                    </select><br/>
                    <h1 className={styles.text} style={{fontSize: 16, margin:0, padding:0, marginTop: 17}}>Укажите дату</h1><br/>
                    <input type="date" style={{ width: 337}} onChange={(e) => handleFieldChange("date", e)} className={styles.input} value={data.date.toString()}/><br/>
                    <button className={styles.button} onClick={dateValidation} style={{width: 351, marginTop: 20, fontSize: 20}}>Добавить</button>
                </form>
            </div>
        </div>
    )
}

export const getServerSideProps = async (ctx: any) => {
    const session = await getSession(ctx);

    const { db } = await connectToDatabase();

    const user = (await db
        .collection('users')
        .find({}, { email: session?.user?.email }).toArray())[0] as IUser;

    return {
        props: { user: user, currentBankAccount: session?.user,
            ...(await serverSideTranslations(ctx.locale, ['common']))}
    }
};
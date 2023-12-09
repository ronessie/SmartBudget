import styles from '../styles/pages.module.css'
import React, {useState} from "react";
import IUser from "@/src/types/IUser";
import {ObjectId} from "bson";
import {useRouter} from "next/navigation";
import validator from "validator";

export default function Page() {
    const [data, setData] = useState({
        sum: "",
        currency: "",
        category: "",
        date: "",
    });

    const router = useRouter();

    function handleFieldChange(fieldName: string, event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setData({
            ...data,
            [fieldName]: event.target.value,
        });
    }
    async function dateToDB() {
        const user: IUser = {
            _id: new ObjectId(),
            fio: "",
            email: "",
            password: "",
            status: "Autorization",
            sum: parseFloat(data.sum),
            balance: 0.00,
            lastUpdateDate: "",
            currency: data.currency,
            date: data.date,
            category: data.category,
            operationsStatus: ""
        };

        const response = await fetch(`/api/auth/${JSON.stringify(user)}`);
        if (!response.ok) throw new Error(response.statusText);
        console.log(user);
    }

    async function dateValidation(e: any) {
        e.preventDefault();
        const response = await fetch(`/api/auth/users`);
        if (!response.ok) throw new Error(response.statusText);
        const json = await response.json();
        //const userExist = json.users.find((user: IUser) => user.email === date.email || user.phone === date.phone);

        if (!data.sum || !(/^[\d]+$/).test(data.sum)) {
            alert("Сумма введена не верно, попробуйте ещё раз.")
            return
        }
        if (!data.date || !validator.isDate(data.date)){
            alert("Дата введена не верно")
            return
        }
        else {
            alert("всё оки, работаем дальше")
            dateToDB();
            alert("Мы всё сохранили")
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
                        <select className={styles.selectorCurrency} onChange={(e) => handleFieldChange("currency", e)} value={data.currency} style={{width: 74}} title="Укажите валюту. Пример: BYN">
                            <option value="RUB">RUB</option>
                            <option value="BYN">BYN</option>
                            <option value="USD">USD</option>
                            <option value="PLN">PLN</option>
                            <option value="EUR">EUR</option>
                        </select></div><br/>
                    <h1 className={styles.text} style={{fontSize: 16, margin:0, padding:0}}>Выберите категорию трат</h1><br/>
                    <select className={styles.selector} onChange={(e) => handleFieldChange("category", e)} value={data.date} style={{width: 351}} title="Выберите категорию трат. Пример: Продукты">
                        <option value="products">Продукты</option>
                        <option value="clothes">Одежда</option>
                        <option value="house">Жильё</option>
                        <option value="car">Автомобиль</option>
                        <option value="entertainment">Развлечения</option>
                    </select><br/>
                    <h1 className={styles.text} style={{fontSize: 16, margin:0, padding:0, marginTop: 17}}>Укажите дату</h1><br/>
                    <input type="date" style={{ width: 337}} onChange={(e) => handleFieldChange("date", e)} className={styles.input} value={data.date}/><br/>
                    <button className={styles.button} onClick={dateValidation} style={{width: 351, marginTop: 20, fontSize: 20}}>Добавить</button>
                </form>
            </div>
        </div>
    )
}
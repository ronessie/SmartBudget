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
import Popup from "reactjs-popup";
import Link from "next/link";
import bankAccounts from "@/pages/api/addBankAccount/bankAccounts";
import IBankAccount from "@/src/types/IBankAccount";

export default function Page(props: { user: IUser, currentBankAccount: ObjectId }) {
    const [data, setData] = useState({
        name: "",
        currency: "",
        balance: "",
        lastBalanceUpdateDate: new Date(),
        inviteCode: "",
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
        /*const operation: IOperation = {
            _id: new ObjectId(),
            user_id: props.user._id,
            bankAccount_id: props.currentBankAccount,
            sum: parseFloat(data.balance),
            currency: data.currency,
            date: data.date,
            category: data.category,
            operationsStatus: ""
        };

        const response = await fetch(`/api/addOperation/${JSON.stringify(operation)}`);
        if (!response.ok) throw new Error(response.statusText);
        console.log(operation);*/
    }

    async function checkInviteCode()
    {
        /*const response = await fetch(`/api/addBankAccount/bankAccounts`);

        if (!response.ok) throw new Error(response.statusText);

        const json = await response.json();
        const inviteToBankAccount = json.bankAccounts.find((bankAccount: IBankAccount) => bankAccount.invitingCode === data.inviteCode)
        if (!inviteToBankAccount)
        {
            alert("Код введён не верно, попробуйте ещё раз")
            return;
        }
        //const userEmail = json.users.find((user: IUser) => user.email === date.email && user.password === date.password);
        */
    }

    async function dateValidation(e: any) {
        e.preventDefault();
        const response = await fetch(`/api/addBankAccount/bankAccounts`);
        if (!response.ok) throw new Error(response.statusText);

        if (!data.balance || !(/^[\d]+$/).test(data.balance)) {
            alert("Сумма введена не верно, попробуйте ещё раз.")
            return
        }
        if (!data.name){
            alert("Укажите название счёта")
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
                <form className={styles.form} style={{height: 380}}>
                    <h1 className={styles.bigBlackText} style={{fontSize: 27, paddingLeft: 45}}>Добавление счёта</h1>
                    <br/>
                    <h1 className={styles.text} style={{fontSize: 16, margin: 0, padding: 0, marginTop: 17}}>Введите название счёта</h1><br/>
                    <input type="text" style={{width: 337}} onChange={(e) => handleFieldChange("date", e)}
                           className={styles.input} value={data.name}/><br/>
                    <h1 className={styles.text} style={{fontSize: 16, margin: 0, padding: 0, marginTop: 15}}>Введите сумму на счету</h1><br/>
                    <div><input value={data.balance} className={styles.input} onChange={(e) => handleFieldChange("sum", e)}
                                type="text" style={{width: 260}}
                                title="Пример: BYN"/>
                        <select className={styles.selectorCurrency} onChange={(e) => handleFieldChange("currency", e)}
                                value={data.currency} style={{width: 74}} title="Укажите валюту. Пример: BYN">
                            <option value="BYN">BYN</option>
                            <option value="RUB">RUB</option>
                            <option value="USD">USD</option>
                            <option value="PLN">PLN</option>
                            <option value="EUR">EUR</option>
                        </select></div>
                    <br/>
                    <button className={styles.button} onClick={dateValidation}
                            style={{width: 351, marginTop: 20, fontSize: 20}}>Добавить
                    </button>
                    <Popup trigger={<Link className={styles.link} style={{paddingLeft: 60}} href={""}>У меня есть пригласительный код</Link>}>
                        <div>
                            <form className={styles.form} style={{height: 200}}>
                                <h1 className={styles.text}
                                    style={{fontSize: 16, margin: 0, padding: 0, marginTop: 17}}>Введите код</h1><br/>
                                <input type="text" style={{width: 337}} onChange={(e) => handleFieldChange("date", e)}
                                       className={styles.input} value={data.inviteCode}/><br/>
                                <button className={styles.button} onClick={checkInviteCode}
                                        style={{width: 351, marginTop: 20, fontSize: 20}}>Добавить
                                </button>
                            </form>
                        </div>
                    </Popup>
                </form>
            </div>
        </div>
    )
}

export const getServerSideProps = async (ctx: any) => {
    const session = await getSession(ctx);

    const {db} = await connectToDatabase();

    const user = (await db
        .collection('users')
        .find({}, {email: session?.user?.email }).toArray())[0] as IUser;

    return {
        props: { user: user, currentBankAccount: session?.user,
            ...(await serverSideTranslations(ctx.locale, ['common']))}
    }
};
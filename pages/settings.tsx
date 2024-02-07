import '../styles/pages.module.css'
import IUser from "@/src/types/IUser";
import React, {useState} from "react";
import styles from "@/styles/pages.module.css";
import Popup from "reactjs-popup";
import Link from "next/link";
import {getSession} from "next-auth/react";
import {connectToDatabase} from "@/src/database";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/navigation";
import IBankAccount from "@/src/types/IBankAccount";
import {ObjectId} from "bson";
export default function Page(props: { user: IUser, currentBankAccount: ObjectId }) {

    const [data, setData] = useState({
        name: "Счёт",
        currency: "BYN",
        balance: 0,
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

    function inviteCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
        let code = '';
        for (let i = 0; i < 16; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return code;
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

    async function checkInviteCode(e: any) {
        e.preventDefault()
        const response = await fetch(`/api/addBankAccount/bankAccounts`);

        if (!response.ok) throw new Error(response.statusText);

        const json = await response.json();
        const inviteToBankAccount = json.users.find((bankAccount: IBankAccount) => bankAccount.invitingCode === data.inviteCode)//тут проблемкинс
        if (!inviteToBankAccount)
        {
            alert("Код введён не верно, попробуйте ещё раз")  // попробовать отменить перезагрузку
            return;
        }
        else{
            alert("Всё круто")
            router.push('/main')
            //тут надо прописать смену текущего аккаунта для данного пользователя и переход на главную
        }
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
            router.push('/main')
        }
    }

    return (
        <div>
            <Popup nested={true} trigger={<button className={styles.button}>Добавить
                счёт</button>}>
                <form className={styles.form} style={{height: 370, marginLeft: 560, marginTop: 400}}>
                    <h1 className={styles.bigBlackText} style={{fontSize: 27, paddingLeft: 45}}>Добавление счёта</h1>
                    <br/>
                    <h1 className={styles.text} style={{fontSize: 16, margin: 0, padding: 0, marginTop: 17}}>Введите
                        название счёта</h1><br/>
                    <input type="text" style={{width: 337}} onChange={(e) => handleFieldChange("name", e)}
                           className={styles.input} value={data.name}/><br/>
                    <h1 className={styles.text} style={{fontSize: 16, margin: 0, padding: 0, marginTop: 15}}>Введите
                        начальную сумму и валюту</h1><br/>
                    <div><input value={data.balance} className={styles.input}
                                onChange={(e) => handleFieldChange("balance", e)}
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
                    <Popup trigger={<Link className={styles.link} style={{paddingLeft: 65}} href={""}>У меня есть
                        пригласительный код</Link>}>
                        <div>
                            <form className={styles.form} style={{height: 180, marginLeft: 33}}>
                                <h1 className={styles.text}
                                    style={{fontSize: 16, margin: 0, padding: 0, marginTop: 17}}>Введите пригласительный код</h1><br/>
                                <input type="text" style={{width: 337}} onChange={(e) => handleFieldChange("inviteCode", e)}
                                       className={styles.input} value={data.inviteCode}/><br/>
                                <button className={styles.button} onClick={checkInviteCode}
                                        style={{width: 351, marginTop: 20, fontSize: 20}}>Добавить
                                </button>
                            </form>
                        </div>
                    </Popup>
                </form>
            </Popup>
        </div>
    )
}
export const getServerSideProps = async (ctx: any) => {
    const session = await getSession(ctx);

    const {db} = await connectToDatabase();

    const user = (await db.collection('users').findOne({ email: session?.user?.email })) as IUser;


    return {
        props: {
            user: user, currentBankAccount: session?.user,
            ...(await serverSideTranslations(ctx.locale, ['common']))
        }
    }
};
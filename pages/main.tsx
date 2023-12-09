import styles from '../styles/pages.module.css'
import {useRouter} from "next/navigation";
import {useState} from "react";
import IUser from "@/src/types/IUser";
import {ObjectId} from "bson";
import session from "next-session";
import {id} from "postcss-selector-parser";
import {text} from "stream/consumers";
import {number} from "prop-types";


export default function Page(props: { sum: string, email: string }) {
    const [accountDate, setAccountDate] = useState({
        sum: props.sum,
        email: props.email,
    });
    const router = useRouter();
    const [data, setData] = useState({
        status: "",
        currency: "",
        balance: 0.00,
        lastUpdateDate: "",
    });
    const user: IUser = {
        _id: new ObjectId(),
        fio: "",
        email: "",
        password: "",
        status: "Autorization",
        balance: 0.00,
        sum: 0.00,
        lastUpdateDate:"",
        currency: "",
        date: "",
        category: "",
        operationsStatus: ""
    };

    function exitButton()
    {
        setData({
            ...data,
            ["status"]: "NotAuthorized",
        });
    }

    return(
        <div className={styles.page}>
            <div className={styles.pages}>
                <div className={styles.conteiners}>
                    <h1 className={styles.bigBlackText}>Hi, UserName</h1>
                    <a href="settings" style={{fontSize: 32, marginTop: 15, textDecorationLine: "none", marginRight:15}}>⚙️</a>
                </div>
                <h1 className={styles.text}>Ваш счёт</h1>
                <div className={styles.rectangle}><br/>
                    <h1 className={styles.whiteText}>Счёт 1</h1><br/>
                    <h1 className={styles.bigWhiteText}>000000</h1><br/>
                    <h1 className={styles.whiteText}>Последнее обновление 29/01/22</h1>
                </div>
                <div>
                    <button className={styles.incomeButton} onClick={() => router.push('/operations')}>+ Доход</button>
                    <button className={styles.expenseButton} onClick={() => router.push('/operations')}>+ Расход</button>
                </div>
            </div>
        </div>
    )
}
/*<button className={styles.logOutButton} onClick={exitButton}>Выйти</button>*/
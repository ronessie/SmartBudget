import styles from '../styles/pages.module.css'
import {useRouter} from "next/navigation";
import IUser from "@/src/types/IUser";
import {ObjectId} from "bson";
import {getSession, useSession} from "next-auth/react";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";


export default function Page(props: { sum: string, email: string }) {
    const [accountDate, setAccountDate] = useState({
        sum: props.sum,
        email: props.email,
    });
    const router = useRouter();
    const [data, setData] = useState({
        status: "",
        currency: "",
        balance: 0,
        lastUpdateDate: "",
    });

    const {data: session} = useSession();
    console.log(session);

    const user: IUser = {
        _id: new ObjectId(),
        fio: "",
        email: "",
        password: "",
        status: "Autorization",
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
                    <Link href={"settings"} style={{fontSize: 32, marginTop: 15, textDecorationLine: "none", marginRight:15}}>⚙️</Link>
                </div>
                <h1 className={styles.text}>Ваш счёт</h1>
                <div className={styles.rectangle}><br/>
                    <h1 className={styles.whiteText}>Счёт 1</h1><br/>
                    <h1 className={styles.bigWhiteText}>{data.balance}</h1><br/>
                    <h1 className={styles.whiteText}>Последнее обновление 29/01/22</h1>
                </div>
                <div>
                    <button className={styles.incomeButton} onClick={() => router.push('/income')}>+ Доход</button>
                    <button className={styles.expenseButton} onClick={() => router.push('/expenses')}>+ Расход</button>
                </div>

            </div>
        </div>
    )
}

export const getServerSideProps = async (ctx: any) => {
    const session = await getSession(ctx);
    console.log('session: ', session?.user)

    return {
        props: {...(await serverSideTranslations(ctx.locale, ['common']))}
    }
};
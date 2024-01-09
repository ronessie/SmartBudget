import styles from '../styles/pages.module.css'
import {useRouter} from "next/navigation";
import IUser from "@/src/types/IUser";
import {ObjectId} from "bson";
import {GetServerSideProps} from "next";
import {getSession, useSession} from "next-auth/react";
import React, { useState, useEffect } from 'react';


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

    const {data: session} = useSession();
    console.log(session);

    const user: IUser = {
        _id: new ObjectId(),
        fio: "",
        email: "",
        password: "",
        status: "Autorization",
        balance: 0.00,
        lastUpdateDate:"",
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
                    <h1 className={styles.bigWhiteText}>{data.balance}</h1><br/>
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

export const getServerSideProps: GetServerSideProps = async ctx => {
    const session = await getSession(ctx);

    return {
        props: {}
    };
};
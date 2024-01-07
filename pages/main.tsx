import styles from '../styles/pages.module.css'
import {useRouter} from "next/navigation";
//import {useState} from "react";
import IUser from "@/src/types/IUser";
import {ObjectId} from "bson";
import {GetServerSideProps} from "next";
import {getSession, useSession} from "next-auth/react";
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {any, number} from "prop-types";


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

const CurrencyConverter = () => {
    const [exchangeRates, setExchangeRates] = useState("");
    const [amount, setAmount] = useState(1);
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [convertedAmount, setConvertedAmount] = useState(null);

    useEffect(() => {
        const getExchangeRates = async () => {
            try {
                const response = await axios.get(
                    `https://api.openexchangerates.org/latest?base=${fromCurrency}&app_id=YOUR_API_KEY`
                );
                setExchangeRates(response.data.rates);
            } catch (error) {
                console.error('Error fetching exchange rates:', error);
            }
        };

        getExchangeRates();
    }, [fromCurrency]);

    const convertCurrency = () => {
        const rate = exchangeRates[toCurrency];
        const result = amount * rate;
        setConvertedAmount(result.toFixed(2));
    };

    useEffect(() => {
        convertCurrency();
    }, [amount, fromCurrency, toCurrency, exchangeRates]);

    return (
        <div>
            <h2>Currency Converter</h2>
            <label>
                Amount:
                <input
                    type="number"
                    value={amount}
                    onChange={(e:any) => setAmount(e.target.value)}
                />
            </label>
            <br />
            <label>
                From Currency:
                <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                >
                    {/* Add options for different currencies */}
                </select>
            </label>
            <br />
            <label>
                To Currency:
                <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                >
                    {/* Add options for different currencies */}
                </select>
            </label>
            <br />
            <p>Converted Amount: {convertedAmount}</p>
        </div>
    );
};
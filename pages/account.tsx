import '../styles/pages.module.css'
import IUser from "@/src/types/IUser";
import React, {useState} from "react";
import styles from '../styles/pages.module.css'
import {GetServerSideProps} from "next";
import {useRouter} from "next/router";

export default function Page(props: { fio: string, email: string }) {
    const [accountDate, setAccountDate] = useState({
        fio: props.fio,
        email: props.email,
    });

    const router = useRouter();

    return (
        <div>
            <div>
                <button className={styles.button} style={{marginRight: 10}} onClick={() => router.push('/addBankAccount')}>+ счёт</button>
            </div>
            <h2>ФИО:</h2><h3>{accountDate.fio}</h3>
            <h2>Электронная почта:</h2><h3>{accountDate.email}</h3>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
    const { NEXTAUTH_URL } = process.env;
    console.log('url: ', NEXTAUTH_URL)

    const response = await fetch(`${NEXTAUTH_URL}/api/authentication/users`);
    if (!response.ok) throw new Error(response.statusText);

    const user = (await response.json()).users.find((user: IUser) => user.fio=="Veronika");

    return {
        props: {
            fio: user?.fio,
            email: user?.email
        }
    };
};
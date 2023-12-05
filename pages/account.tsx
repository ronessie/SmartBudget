import '../styles/pages.module.css'
import IUser from "@/src/types/IUser";
import React, {useState} from "react";
import {GetServerSideProps} from "next";
export default function Page(props: { fio: string; phone: string, email: string }) {
    const [accountDate, setAccountDate] = useState({
        fio: props.fio,
        email: props.email,
        phone: props.phone,
    });

    return (
        <div>
            <h2>ФИО:</h2><h3>{accountDate.fio}</h3>
            <h2>Электронная почта:</h2><h3>{accountDate.email}</h3>
            <h2>Номер телефона:</h2><h3>{accountDate.phone}</h3>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
    const { NEXTAUTH_URL } = process.env;
    console.log('url: ', NEXTAUTH_URL)

    const response = await fetch(`${NEXTAUTH_URL}/api/auth/users`);
    if (!response.ok) throw new Error(response.statusText);

    const user = (await response.json()).users.find((user: IUser) => user.fio=="Veronika");

    return {
        props: {
            fio: user?.fio,
            phone: user?.phone,
            email: user?.email
        }
    };
};
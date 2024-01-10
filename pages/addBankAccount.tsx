import '../styles/pages.module.css'
import IUser from "@/src/types/IUser";
import React, {useState} from "react";
import styles from '../styles/pages.module.css'
import {GetServerSideProps} from "next";
import {useRouter} from "next/router";

export default function Page() {
    const [accountDate, setAccountDate] = useState({
        fio: "",
        email: "",
    });


    return (
        <div>
            <h1>hello</h1>
        </div>
    )
}
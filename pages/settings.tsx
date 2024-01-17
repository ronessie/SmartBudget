import '../styles/pages.module.css'
import IUser from "@/src/types/IUser";
import React, {useState} from "react";
import {GetServerSideProps} from "next";
import styles from "@/styles/pages.module.css";
import {router} from "next/client";
export default function Page() {
    return (
        <div>
            <button className={styles.button} onClick={() => router.push('/addBankAccount')}>Добавить счёт</button>
        </div>
    )
}
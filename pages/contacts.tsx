import {getSession} from "next-auth/react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import styles from "@/styles/pages.module.css";
import React, {useState} from "react";
import Footer from "@/components/footer";
import {useRouter} from "next/navigation";
import {useTranslation} from "next-i18next";
import SmallHeader from "../components/smallHeader"

export default function Page() {
    const router = useRouter();
    const { t } = useTranslation('common');

    return (
        <div className={styles.page}>
            <SmallHeader/>
            <div className={styles.pageContent} style={{width: 800, textAlign: "justify", marginLeft: 500}}>
                <h1>Contacts</h1>
            </div>
            <Footer/>
        </div>
    )
}

export const getServerSideProps = async (ctx: any) => {
    const session = await getSession(ctx);

    return {
        props: {
            ...(await serverSideTranslations(ctx.locale, ['common']))
        }
    }
};
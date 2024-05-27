import {getSession} from "next-auth/react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import styles from "@/styles/pages.module.css";
import React from "react";
import Footer from "@/components/footer";
import {useTranslation} from "next-i18next";
import SmallHeader from "../components/smallHeader"
import {List} from "@mantine/core";

export default function Page() {
    const {t} = useTranslation('common');

    return (
        <div className={styles.page}>
            <SmallHeader/>
            <div className={styles.pageContent} style={{width: 800, textAlign: "justify", marginLeft: 560}}>
                <h1 className={styles.blueText}>{t('aboutPage.1')}</h1>
                <h1>{t('aboutPage.2')}</h1>
                <h1>{t('aboutPage.3')}</h1>
                <h1>{t('aboutPage.4')}</h1>
                <List listStyleType="disc" withPadding={true}>
                    <List.Item style={{width: 768}}>{t('aboutPage.4-1')}</List.Item>
                    <List.Item style={{width: 768}}>{t('aboutPage.4-2')}</List.Item>
                    <List.Item style={{width: 768}}>{t('aboutPage.4-3')}</List.Item>
                </List>
                <h1>{t('aboutPage.5')}</h1>
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
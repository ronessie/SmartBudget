import {getSession} from "next-auth/react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import SmallHeader from "../components/smallHeader"
import styles from "@/styles/pages.module.css";
import React, {useState} from "react";
import LongFooter from "@/components/longFooter";
import {List} from "@mantine/core";
import {useTranslation} from "next-i18next";

export default function Page() {
    const {t} = useTranslation('common');

    return (
        <div className={styles.page}>
            <SmallHeader/>
            <div className={styles.pageContent} style={{width: 800, textAlign: "justify", marginLeft: 560}}>
                <h1 className={styles.policyText}>{t('policyPage.title.1')}</h1>
                <h2>{t('policyPage.text.1')}</h2><br/>

                <h1 className={styles.policyText}>{t('policyPage.title.2')}</h1>
                <h2>{t('policyPage.text.2')}</h2><br/>

                <h1 className={styles.policyText}>{t('policyPage.title.3')}</h1>
                <h2>{t('policyPage.text.3')}</h2><br/>

                <h1 className={styles.policyText}>{t('policyPage.title.4')}</h1>
                <h2>{t('policyPage.text.4')}</h2><br/>

                <h1 className={styles.policyText}>{t('policyPage.title.5')}</h1>
                <h2>{t('policyPage.text.5')}
                    <List withPadding={true} listStyleType="disc">
                        <List.Item>{t('policyPage.text.5-1')}</List.Item>
                        <List.Item>{t('policyPage.text.5-2')}</List.Item>
                        <List.Item>{t('policyPage.text.5-3')}</List.Item></List></h2><br/>

                <h1 className={styles.policyText}>{t('policyPage.title.6')}</h1>
                <h2>{t('policyPage.text.6')}</h2><br/>

                <h1 className={styles.policyText}>{t('policyPage.title.7')}</h1>
                <h2>{t('policyPage.text.7')}</h2><br/>

                <h1 className={styles.policyText}>{t('policyPage.title.8')}</h1>
                <h2>{t('policyPage.text.8')}</h2><br/>

                <h1 className={styles.policyText}>{t('policyPage.title.9')}</h1>
                <h2>{t('policyPage.text.9')}</h2><br/>

                <h1 className={styles.policyText}>{t('policyPage.title.10')}</h1>
                <h2>{t('policyPage.text.10')}</h2><br/>
            </div>
            <LongFooter/>
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
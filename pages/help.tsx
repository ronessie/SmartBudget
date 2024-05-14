import {getSession} from "next-auth/react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import styles from "@/styles/pages.module.css";
import React, {useState} from "react";
import Footer from "@/components/footer";
import {Button, Container, Group} from "@mantine/core";
import classes from "@/styles/header.module.css";
import {useRouter} from "next/navigation";
import {useTranslation} from "next-i18next";

export default function Page() {
    const router = useRouter();
    const { t } = useTranslation('common');

    return (
        <div className={styles.page}>
            <header className={classes.header}>
                <Container size="md" className={classes.inner}>
                    <img src="/images/small_logo.svg" alt="SmartBudget" style={{paddingTop: 9}}
                         onClick={() => router.push('/')}/>
                    <Group gap={5} visibleFrom="xs">
                        <Button className={classes.button} onClick={()=> router.push('/about')}>{t('indexPage.about')}</Button>
                        <Button className={classes.button}>{t('indexPage.contacts')}</Button>
                        <Button className={classes.button} onClick={()=> router.push('/')}>{t('indexPage.onMain')}</Button>
                    </Group>
                </Container>
            </header>
            <div className={styles.pageContent} style={{width: 800, textAlign: "justify", marginLeft: 500}}>
                <h1>Help</h1>
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
import {Container, Group, Button, NativeSelect} from '@mantine/core';
import classes from '../styles/header.module.css';
import {signOut} from 'next-auth/react'
import {useTranslation} from "next-i18next";
import React, {useState} from "react";
import {useRouter} from "next/router";

export default function Header() {
    const router = useRouter();
    const { t } = useTranslation('common');

    const [language, setLanguage] = useState({
        lan: [{"value": "ru", "label": "RU"}, {"value": "en", "label": "EN"}],
        selectedLan: router.locale?.toString(),
    });

    const changeLanguage = async (language: string) => {
        await router.push(router.pathname, router.asPath, {locale: language});
    };
    function handleLanguageChange(fieldName: string, value: any) {
        setLanguage({
            ...language,
            [fieldName]: value,
        });
        changeLanguage(value)
    }

    const signOutAccount = async () => {
        await signOut({redirect: false})
        router.push('/')
    }


    return (
        <header className={classes.header}>
            <Container size="md" className={classes.inner}>
                <img src="/images/small_logo.svg" alt="SmartBudget" style={{paddingTop: 9}}
                     onClick={() => router.push('/main')}/>
                <Group gap={5} visibleFrom="xs">
                    <Button variant="light" radius="xl" style={{fontSize: 18}} onClick={() => router.push('/main')}>{t('header.main')}</Button>
                    <Button variant="light" radius="xl" style={{fontSize: 18}} onClick={() => router.push('/account')}>{t('header.account')}</Button>
                    <Button variant="light" radius="xl" style={{fontSize: 18}} onClick={() => router.push('/addingCheck')}>{t('header.addingCheck')}</Button>
                    <Button variant="light" radius="xl" style={{fontSize: 18}} onClick={() => router.push('/checks')}>{t('header.checks')}</Button>
                    <Button variant="light" radius="xl" style={{fontSize: 18}} onClick={signOutAccount}>{t('header.logOut')}</Button>
                    <NativeSelect data={language.lan} variant="light" radius="xl" style={{fontSize: 18}} defaultValue={language.selectedLan} onChange={(e) => handleLanguageChange("selectedLan", e.target.value)}/>
                </Group>
            </Container>
        </header>
    );
}
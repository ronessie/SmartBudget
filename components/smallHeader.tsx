import {Container, Group, Button, NativeSelect} from '@mantine/core';
import classes from '../styles/header.module.css';
import {useTranslation} from "next-i18next";
import React, {useState} from "react";
import {useRouter} from "next/router";

export default function SmallHeader() {
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


    return (
        <header className={classes.header}>
            <Container size="md" className={classes.inner}>
                <img src="/images/small_logo.svg" alt="SmartBudget" style={{paddingTop: 9}}
                     onClick={() => router.push('/')}/>
                <Group gap={5} visibleFrom="xs">
                    <Button variant="light" radius="xl" style={{fontSize: 18}}
                            onClick={() => router.push('/about')}>{t('indexPage.about')}</Button>
                    <Button variant="light" radius="xl" style={{fontSize: 18}} onClick={()=> router.push('/contacts')}>{t('indexPage.contacts')}</Button>
                    <Button variant="light" radius="xl" style={{fontSize: 18}} onClick={()=> router.push('/policy')}>{t('indexPage.privacy')}</Button>
                    <Button variant="light" radius="xl" style={{fontSize: 18}} onClick={() => router.push('/main')}>{t('indexPage.onMain')}</Button>
                    <NativeSelect data={language.lan} variant="light" radius="xl" style={{fontSize: 18}} defaultValue={language.selectedLan} onChange={(e) => handleLanguageChange("selectedLan", e.target.value)}/>
                </Group>
            </Container>
        </header>
    );
}
import {Container, Group, Button} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import classes from '../styles/header.module.css';
import {useRouter} from "next/navigation";
import {useTranslation} from "next-i18next";
import React from "react";

export default function SmallHeader() {
    const [opened, {toggle}] = useDisclosure(false);
    const router = useRouter();
    const { t } = useTranslation('common');


    return (
        <header className={classes.header}>
            <Container size="md" className={classes.inner}>
                <img src="/images/small_logo.svg" alt="SmartBudget" style={{paddingTop: 9}}
                     onClick={() => router.push('/')}/>
                <Group gap={5} visibleFrom="xs">
                    <Button className={classes.button}
                            onClick={() => router.push('/about')}>{t('indexPage.about')}</Button>
                    <Button className={classes.button}>{t('indexPage.contacts')}</Button>
                    <Button className={classes.button} onClick={() => router.push('/')}>{t('indexPage.onMain')}</Button>
                </Group>
            </Container>
        </header>
    );
}
import {Container, Group, Burger, Button} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import classes from '../styles/header.module.css';
import {useRouter} from "next/navigation";
import {signOut} from 'next-auth/react'
import {useTranslation} from "next-i18next";

export default function Header() {
    const [opened, {toggle}] = useDisclosure(false);
    const router = useRouter();
    const { t } = useTranslation('common');


    const signOutAccount = async () => {
        await signOut({redirect: false})
        router.push('/')
    }


    return (
        <header className={classes.header}>
            <Container size="md" className={classes.inner}>
                <img src="/images/small_logo.svg" alt="SmartBudget" style={{paddingTop: 9}}
                     onClick={() => router.push('/')}/>
                <Group gap={5} visibleFrom="xs">
                    <Button className={classes.button} onClick={() => router.push('/main')}>{t('header.main')}</Button>
                    <Button className={classes.button} onClick={() => router.push('/account')}>{t('header.account')}</Button>
                    <Button className={classes.button} onClick={() => router.push('/addingCheck')}>{t('header.addingCheck')}</Button>
                    <Button className={classes.button} onClick={() => router.push('/checks')}>{t('header.checks')}</Button>
                    <Button className={classes.button} onClick={signOutAccount}>{t('header.logOut')}</Button>
                </Group>
            </Container>
        </header>
    );
}
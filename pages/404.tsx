import React from 'react';
import {Button, Container, Image, Text, Title} from '@mantine/core';
import {useRouter} from 'next/router';
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {GetStaticProps} from "next";

const Error404Page = () => {
    const router = useRouter();
    const { t } = useTranslation('common');

    const handleBackHome = () => {
        router.push('/');
    };

    return (
        <Container size="sm">
            <Image src='/images/404.png' alt="Image 404"
                   style={{width: 500, height: 500, marginLeft: 100, marginTop: 100, marginBottom: 50}}/>
            <Title order={1} style={{marginBottom: 10, textAlign: "center"}}>{t('404.title')}</Title>
            <Text style={{marginBottom: 20, textAlign: "center"}}>{t('404.text')}</Text>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <Button onClick={handleBackHome}>{t('404.button')}</Button>
            </div>
        </Container>
    );
};

export default Error404Page;

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    return {
        props: {
            ...(await serverSideTranslations(locale ?? 'en', ['common'])),
        },
    }
}

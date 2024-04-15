import '../styles/globals.css';
import type {AppProps} from 'next/app';
import {SessionProvider} from "next-auth/react";
import {appWithTranslation} from "next-i18next";
import Head from "next/head";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';
import {MantineProvider} from '@mantine/core';
import {ModalsProvider} from "@mantine/modals";
import {Notifications} from "@mantine/notifications";

const App = ({Component, pageProps: {session, ...pageProps}}: AppProps) => {
    return (
        <MantineProvider defaultColorScheme="light">
            <Notifications/>
            <ModalsProvider>
                <SessionProvider session={session}>
                    <Head>
                        <title>SmartBudget</title>
                        <meta name='description' content='Income and expense calculation website'/>
                        <link rel="icon" href="/favicon.ico"/>
                    </Head>
                    <Component {...pageProps} />
                </SessionProvider>
            </ModalsProvider>
        </MantineProvider>
    );
};

export default appWithTranslation(App);
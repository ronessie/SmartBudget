import '../styles/globals.css';
import type {AppProps} from 'next/app';
import {SessionProvider} from "next-auth/react";
import {appWithTranslation} from "next-i18next";
import Head from "next/head";
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';
import {createTheme, MantineProvider} from '@mantine/core';
import {ModalsProvider} from "@mantine/modals";

const theme = createTheme({
});

const App = ({Component, pageProps: {session, ...pageProps}}: AppProps) => {
    return (
        <MantineProvider theme={theme}>
            <ModalsProvider>
                <SessionProvider session={session}>
                    <Head>
                        <title>SmartBudget</title>
                        <meta name='description' content='Income and expense calculation website'/>
                    </Head>
                    <Component {...pageProps} />
                </SessionProvider>
            </ModalsProvider>
        </MantineProvider>
    );
};

export default appWithTranslation(App);
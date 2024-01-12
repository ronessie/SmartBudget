import '../styles/globals.css';
import type {AppProps} from 'next/app';
import {SessionProvider} from "next-auth/react";
import {appWithTranslation} from "next-i18next";
import Head from "next/head";

const App = ({Component, pageProps: {session, ...pageProps}}: AppProps) => {
    return (
        <SessionProvider session={session}>
            <Head>
                <title>SmartBudget</title>
                <meta name='description' content='Income and expense calculation website' />
            </Head>
            <Component {...pageProps} />
        </SessionProvider>
    );
};

export default appWithTranslation(App);
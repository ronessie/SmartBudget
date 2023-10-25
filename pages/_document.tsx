import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang='ru'>
            <Head>
                <title>Financial accounting</title>
                <meta name='description' content='Income and expense calculation website' />
            </Head>
            <body>
            <Main />
            <NextScript />
            </body>
        </Html>
    );
}
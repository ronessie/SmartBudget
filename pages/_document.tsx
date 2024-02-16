import {Head, Html, Main, NextScript} from 'next/document';
import {ColorSchemeScript} from '@mantine/core';

export default function Document() {
    return (
        <Html lang='indexPage'>
            <Head>
                <ColorSchemeScript defaultColorScheme="auto"/>
            </Head>
            <body>
            <Main/>
            <NextScript/>
            </body>
        </Html>
    );
}
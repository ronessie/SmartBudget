import '../styles/globals.css';
import type {AppProps} from 'next/app';

const App = ({Component, pageProps: {session, ...pageProps}}: AppProps) => {
    return (
        <Component {...pageProps} />
    );
};

export default App;
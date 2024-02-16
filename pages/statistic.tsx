import path from 'path';
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

path.resolve('./next.config.js');

export default function Page() {
    return (
        <div>
            <h1>hello it is statistic</h1>
        </div>
    )
}
export const getServerSideProps = async (ctx: any) => ({
    props: {
        ...(await serverSideTranslations(ctx.locale, ['common']))
    }
});
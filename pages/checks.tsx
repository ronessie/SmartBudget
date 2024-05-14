import {getSession} from "next-auth/react";
import {connectToDatabase} from "@/src/database";
import IUser from "@/src/types/IUser";
import IBankAccount from "@/src/types/IBankAccount";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {Image} from "@mantine/core";
import Header from "../components/header"
import styles from "@/styles/pages.module.css";
import Footer from "../components/footer"
import {Carousel} from '@mantine/carousel';
import {useState} from "react";
import {authRedirect} from "@/src/server/authRedirect";

export default function Page(props: {
    user: IUser,
    bankAccount: IBankAccount,
    checks: string[],
    checksText: string[]
}) {
    const [data, setData] = useState({
        images: props.checks,
        texts: props.checksText
    });

    function Carusel() {

        const slides = data.images.map((url, i) => (
            <Carousel.Slide key={url} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column'
            }}>
                <Image src={'/uploads/' + url} w={600} h={600} alt={'image'}/>
                <h1>{data.texts[i]}</h1>
            </Carousel.Slide>
        ));

        return <Carousel withIndicators>{slides}</Carousel>;
    }

    return (
        <div className={styles.page}>
            <Header/>
            <div className={styles.pageContent}>
                <Carusel/>
            </div>
            <Footer/>
        </div>
    )
}

export const getServerSideProps = async (ctx: any) => {
    const session = await getSession(ctx);

    const {db} = await connectToDatabase();

    const user = (await db.collection('users').findOne({email: session?.user?.email})) as IUser;
    let bankAcc, checks, checksText;

    if (user) {
        bankAcc = (await db.collection('bankAccounts').findOne({_id: user.currentBankAccount})) as IBankAccount;

        const {NEXTAUTH_URL} = process.env;
        const response = await fetch(`${NEXTAUTH_URL}/api/userChecks/${JSON.stringify(user)}`);
        if (!response.ok) throw new Error(response.statusText);
        const userChecksJson = await response.json();
        checks = userChecksJson.result as string[];
        checksText = userChecksJson.text as string[];
        console.log(checks);
    }

    return {
        redirect: await authRedirect(ctx, '/'),
        props: {
            user: user, bankAccount: bankAcc,
            checks: checks,
            checksText: checksText,
            ...(await serverSideTranslations(ctx.locale, ['common']))
        }
    }
};

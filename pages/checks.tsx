import {getSession} from "next-auth/react";
import {connectToDatabase} from "@/src/database";
import IUser from "@/src/types/IUser";
import IBankAccount from "@/src/types/IBankAccount";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {Image} from "@mantine/core";
import Header from "../components/header"
import styles from "@/styles/pages.module.css";
import Footer from "../components/footer"
import { Carousel } from '@mantine/carousel';
import {useState} from "react";
import {currency} from "@/src/utils";

export default function Page(props: { user: IUser, bankAccount: IBankAccount, checks: string[] }) {
    const [data, setData] = useState({
        images: props.checks,
    });

    function Carusel(){
        const slides = data.images.map((url) => (
            <Carousel.Slide key={url} style={{width: 700, height: 500}}>
                <Image src={'/uploads/' + url}/>
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
    const bankAcc = (await db.collection('bankAccounts').findOne({_id: user.currentBankAccount})) as IBankAccount;

    const {NEXTAUTH_URL} = process.env;
    const response = await fetch(`${NEXTAUTH_URL}/api/userChecks/${JSON.stringify(user)}`);
    if (!response.ok) throw new Error(response.statusText);
    const checks = (await response.json()).result as string[];

    return {
        props: {
            user: user, bankAccount: bankAcc,
            checks: checks,
            ...(await serverSideTranslations(ctx.locale, ['common']))
        }
    }
};
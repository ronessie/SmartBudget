import {getSession} from "next-auth/react";
import {connectToDatabase} from "@/src/database";
import IUser from "@/src/types/IUser";
import IBankAccount from "@/src/types/IBankAccount";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {Image} from "@mantine/core";
import Header from "../components/header"

export default function Page(props: { user: IUser, bankAccount: IBankAccount }) {
    return(
        <div>
            <Header/>
            <Image src="/uploads/1710020725878.png" h={"auto"}/>
        </div>
    )
}

export const getServerSideProps = async (ctx: any) => {
    const session = await getSession(ctx);

    const {db} = await connectToDatabase();

    const user = (await db.collection('users').findOne({email: session?.user?.email})) as IUser;
    const bankAcc = (await db.collection('bankAccounts').findOne({_id: user.currentBankAccount})) as IBankAccount;

    return {
        props: {
            user: user, bankAccount: bankAcc,
            ...(await serverSideTranslations(ctx.locale, ['common']))
        }
    }
};
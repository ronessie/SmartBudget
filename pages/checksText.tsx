import {Button, Textarea} from "@mantine/core";
import IUser from "@/src/types/IUser";
import IBankAccount from "@/src/types/IBankAccount";
import {getSession} from "next-auth/react";
import {connectToDatabase} from "@/src/database";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useState} from "react";

export default function Page(props: { user: IUser, bankAccount: IBankAccount }) {
    const [data, setData] = useState({
        text: "",
    });

    function handleFieldChange(fieldName: string, value: any) {
        console.log(`set ${fieldName} with value: ${value}`)
        setData({
            ...data,
            [fieldName]: value,
        });
        console.log(data)
    }
    async function textRecognition() {
        const path = "/uploads/1713362951985.png"
        //const path = "/uploads/1713298101422.png"
        const response = await fetch('/api/textRecognition', {
            method: 'POST',
            body: JSON.stringify({
                path
            }),
        });

        if (response.ok) {
            console.log('api worked successfully!');
            const result = (await response.json()).result;
            handleFieldChange("text", result)
        } else {
            console.error('Failed work.');
        }
    }
    return (
        <div>
                <Textarea value={data.text}></Textarea>
                <Button onClick={textRecognition}>Test</Button>
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
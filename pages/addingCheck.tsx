import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useState} from "react";
import {FileInput} from "@mantine/core";
import Header from "../components/header"
import styles from '../styles/pages.module.css'
import {ObjectId} from "bson";
import ICheck from "@/src/types/ICheck";
import {getSession} from "next-auth/react";
import {connectToDatabase} from "@/src/database";
import IUser from "@/src/types/IUser";
import IBankAccount from "@/src/types/IBankAccount";

export default function Page(props: { user: IUser, bankAccount: IBankAccount }) {
    const [image, setImage] = useState(null);

    const handleImageChange = (e: any) => {
        setImage(e);
    };

    const handleUpload = async () => {
        if (image) {
            try {
                const formData = new FormData();
                formData.append('image', image);

                const response = await fetch('/api/addCheck/checks', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Ошибка HTTP: ' + response.status);
                }

                setImage(null);

                const data = await response.json();

                const check: ICheck = {
                    _id: new ObjectId().toString(),
                    user_id: props.user._id,
                    bankAccount_id: props.bankAccount._id,
                    filePath: data.filePath,
                    //checkText: "",
                    dateTime: Date()
                };

                const dbResponse = await fetch(`/api/addCheck`, {
                    method: "POST",
                    body: JSON.stringify(check),
                });

                if (!dbResponse.ok) throw new Error(dbResponse.statusText);
                alert("Файл успешно загружен")
            } catch (error) {
                console.error("Ошибка при сохранении изображения:", error);
            }
        } else {
            console.warn("Изображение не выбрано");
        }
    };

    return (
        <div className={styles.page}>
            <Header/>
            <div className={styles.pageContent}>
                <h1>Check Upload</h1>
                <FileInput value={image} accept="image/*" onChange={handleImageChange} placeholder="Выберите файл"
                           style={{width: 400}}/>
                <button onClick={handleUpload}>Upload</button>
            </div>
        </div>
    );
};

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

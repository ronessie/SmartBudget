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
import {useRef} from 'react';
import {Text, Group, Button, rem, useMantineTheme} from '@mantine/core';
import {Dropzone, MIME_TYPES} from '@mantine/dropzone';
import {IconCloudUpload, IconX, IconDownload} from '@tabler/icons-react';
import classes from '@/styles/dropzoneButton.module.css';

export default function Page(props: { user: IUser, bankAccount: IBankAccount }) {
    const [image, setImage] = useState(null);
    const theme = useMantineTheme();
    const openRef = useRef<() => void>(null);

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
                <Dropzone
                    openRef={openRef}
                    onDrop={handleImageChange}
                    className={classes.dropzone}
                    radius="md"
                    accept={[MIME_TYPES.png]}
                    maxSize={30 * 1024 ** 2}>
                    <div style={{pointerEvents: 'none'}}><br/>
                        <Group justify="center">
                            <Dropzone.Accept>
                                <IconDownload
                                    style={{width: rem(50), height: rem(50)}}
                                    color={theme.colors.blue[6]}
                                    stroke={1.5}
                                />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX
                                    style={{width: rem(50), height: rem(50)}}
                                    color={theme.colors.red[6]}
                                    stroke={1.5}
                                />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconCloudUpload style={{width: rem(50), height: rem(50)}} stroke={1.5}/>
                            </Dropzone.Idle>
                        </Group>

                        <Text ta="center" fw={700} fz="lg" mt="xl">
                            <Dropzone.Accept>Drop files here</Dropzone.Accept>
                            <Dropzone.Reject>Png file less than 30mb</Dropzone.Reject>
                            <Dropzone.Idle>Upload file</Dropzone.Idle>
                        </Text>
                        <Text ta="center" fz="sm" mt="xs" c="dimmed">
                            Drag&apos;n&apos;drop files here to upload.
                        </Text>
                    </div><br/>
                </Dropzone><br/>
                <Button className={classes.control} size="md" radius="xl" onClick={handleUpload}>
                    Upload
                </Button>
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

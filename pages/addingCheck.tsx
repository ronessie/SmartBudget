import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import React, {useState} from "react";
import Footer from "../components/footer"
import Header from "../components/header"
import styles from '../styles/pages.module.css'
import {ObjectId} from "bson";
import ICheck from "@/src/types/ICheck";
import {getSession} from "next-auth/react";
import {connectToDatabase} from "@/src/database";
import IUser from "@/src/types/IUser";
import IBankAccount from "@/src/types/IBankAccount";
import {useRef} from 'react';
import {Text, Group, Button, rem, useMantineTheme, Modal, Textarea, Loader} from '@mantine/core';
import {Dropzone, MIME_TYPES} from '@mantine/dropzone';
import {IconCloudUpload, IconX, IconDownload} from '@tabler/icons-react';
import {notifications} from "@mantine/notifications";
import {useTranslation} from "next-i18next";

export default function Page(props: { user: IUser, bankAccount: IBankAccount }) {
    const [image, setImage] = useState(null);
    const theme = useMantineTheme();
    const openRef = useRef<() => void>(null);
    const [textModalState, setTextModalState] = useState(false);
    const [loaderModalState, setLoaderModalState] = useState(false);
    const {t} = useTranslation('common');
    const [checkText, setCheckText] = useState({
        text: "",
        filePath: "",
        fileName: "",
    });

    const clearFile = () => {
        setImage(null);
        handleFieldChange("fileName", "")
    };

    function handleFieldChange(fieldName: string, value: any) {
        setCheckText(prevData => ({
            ...prevData,
            [fieldName]: value,
        }));
    }

    async function textRecognition(check: ICheck) {
        const path = "/uploads/" + check.filePath;
        const response = await fetch('/api/textRecognition', {
            method: 'POST',
            body: JSON.stringify({
                path
            }),
        });

        if (response.ok) {
            console.log('api worked successfully!');
            const result = (await response.json()).result;
            handleFieldChange("text", result);
            handleFieldChange("filePath", check.filePath);
            setLoaderModalState(false)
            setTextModalState(!textModalState);

        } else {
            console.error('Failed work.');
        }
    }

    const handleImageChange = (e: any) => {
        setImage(e);
        handleFieldChange("fileName", e[0].name)
        console.log(e[0].name)
    };

    const handleUpload = async () => {
        if (image) {
            try {
                setLoaderModalState(true)
                const formData = new FormData();
                formData.append('image', image[0]);

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
                    checkText: "",
                    dateTime: Date()
                };
                await dataToDB(check)
                await textRecognition(check)
            } catch (error) {
                console.error("Ошибка при сохранении изображения:", error);
            }
        } else {
            console.warn("Изображение не выбрано");
            notifications.show({
                title: 'Уведомление',
                message: 'Файл не выбран',
            })
        }
    };

    async function dataToDB(check: ICheck) {
        try {
            const dbResponse = await fetch(`/api/addCheck`, {
                method: "POST",
                body: JSON.stringify(check),
            });

            if (!dbResponse.ok) throw new Error(dbResponse.statusText);
            notifications.show({
                title: 'Уведомление',
                message: 'Файл успешно загружен',
            })
        } catch (error) {
            console.error("Ошибка при сохранении изображения:", error);
        }
    }

    async function updateCheckText() {
        const response = await fetch(`/api/updateCheckText`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filePath: checkText.filePath,
                text: checkText.text
            }),
        });
        if (!response.ok) throw new Error(response.statusText);
        setTextModalState(false);
        notifications.show({
            title: 'Уведомление',
            message: 'Текст успешно сохранён',
        })
    }

    return (
        <div className={styles.page}>
            <Header/>
            <div className={styles.pageContent}><br/>
                <Text size="sm" ta="center" mt="sm" style={{fontSize: 20}}>
                    {t('addFilePage.pickedFile')} {checkText.fileName}
                </Text>
                <Dropzone
                    maxFiles={1}
                    openRef={openRef}
                    onDrop={handleImageChange}
                    radius="md"
                    accept={[MIME_TYPES.png]}
                    maxSize={30 * 1024 ** 2}>
                    <div style={{pointerEvents: 'none'}}><br/>
                        <h1></h1>
                        <Group justify="center">
                            <Dropzone.Accept>
                                <IconDownload
                                    style={{width: rem(150), height: rem(150)}}
                                    color={theme.colors.blue[6]}
                                    stroke={1.5}
                                />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX
                                    style={{width: rem(150), height: rem(150)}}
                                    color={theme.colors.red[6]}
                                    stroke={1.5}
                                />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconCloudUpload style={{width: rem(150), height: rem(150)}} stroke={1.5}/>
                            </Dropzone.Idle>
                        </Group>

                        <Text ta="center" fw={700} fz="lg" mt="xl">
                            <Dropzone.Accept>{t('addFilePage.accept')}</Dropzone.Accept>
                            <Dropzone.Reject>{t('addFilePage.reject')}</Dropzone.Reject>
                            <Dropzone.Idle>{t('addFilePage.idle')}</Dropzone.Idle>
                        </Text>
                        <Text ta="center" fz="sm" mt="xs" c="dimmed">
                            {t('addFilePage.description')}
                        </Text>
                    </div>
                    <br/>
                </Dropzone><br/>
                <Button style={{position: "absolute", width: 250, left: 820}} size="md"
                        radius="xl" onClick={handleUpload}>{t('addFilePage.upload')}</Button> <br/>
                <Button style={{width: 200, marginTop: 30, left: 845}} size="md" variant={"outline"} color="red"
                        disabled={!image}
                        radius="xl" onClick={clearFile}>Отменить</Button>
                <Modal title={"Расшифровка чека"}
                       opened={textModalState} onClose={() => setTextModalState(false)}
                       withCloseButton={false}
                       closeOnClickOutside={false}
                       closeOnEscape={false}
                       overlayProps={{backgroundOpacity: 0, blur: 4}}>
                    <div>
                        <Textarea size="xl" autosize
                                  value={checkText.text} onChange={(e) => handleFieldChange("text", e.target.value)}/>
                        <Button onClick={updateCheckText}
                                style={{width: 410, marginTop: 20, fontSize: 20}}>Save</Button>
                    </div>
                </Modal>
                <Modal opened={loaderModalState} withCloseButton={false} closeOnClickOutside={false}
                       closeOnEscape={false} onClose={() => setLoaderModalState(false)}
                       overlayProps={{backgroundOpacity: 0, blur: 4}}>
                    <div>
                        <h1>Загрузка фото, а так же ожидание расшифровки может занять некоторое время.</h1><br/>
                        <Loader color="blue" style={{marginLeft: 170}}/>
                    </div>
                </Modal>
            </div>
            <Footer/>
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

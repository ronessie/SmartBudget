import {useTranslation} from 'next-i18next';
import path from 'path';
import {GoogleIcon} from '@/public/images/GoogleIcon';
import Link from "next/link";
import {useRouter} from "next/router";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {
    Button,
    Container,
    Drawer,
    Group,
    Modal, NativeSelect,
    PasswordInput,
    PinInput,
    SegmentedControl,
    TextInput
} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import styles from "@/styles/pages.module.css";
import React, {useState} from "react";
import {createBankAccountObj, createUserObj, currency, generate2FAcode, generatePassword} from "@/src/utils";
import validator from "validator";
import IUser from "@/src/types/IUser";
import {getSession, signIn} from "next-auth/react";
import {ObjectId} from "bson";
import Footer from "../components/footer"
import {connectToDatabase} from "@/src/database";
import classes from "@/styles/header.module.css";
import {notifications} from '@mantine/notifications';

path.resolve('./next.config.js');

export default function Page(props: { user: IUser }) {
    const router = useRouter()
    const {t} = useTranslation('common');
    const [passwordRecoveryModalState, setPasswordRecoveryModalState] = useState(false);
    const [data, setData] = useState({
        email: "",
        password: "",
        status: "NotAuthorized",
        newPassword: generatePassword(),
        fromEmail: "vsakolinskaa@gmail.com",
        popUpEmail: "",
        fio: "",
        checkPassword: "",
        twoStepAuthCode: "",
        check2FA: ""
    });
    const [authDrawerState, drawerAuthMethods] = useDisclosure(false);
    const [registrationDrawerState, drawerRegistrationMethods] = useDisclosure(false);
    const [segmentState, setSegmentState] = useState('Sign In');
    const [twoFAState, setTwoFAState] = useState(false);
    const [converterDrawerState, converterAuthMethods] = useDisclosure(false);
    const [convertData, setConvertData] = useState({
        sum: 1,
        currency: currency(),
        beforeCurrency: "AED",
        afterCurrency: "AED",
        newSum: 0
    });

    const changeLanguage = async (language: string) => {
        await router.push(router.pathname, router.asPath, {locale: language});
    };

    function handleConvertChange(fieldName: string, value: any) {
        setConvertData({
            ...convertData,
            [fieldName]: value,
        });
        console.log(convertData)
    }

    function IndexHeader() {
        const [opened, {toggle}] = useDisclosure(false);
        const router = useRouter();

        return (
            <header className={classes.header}>
                <Container className={classes.inner}>
                    <img src="/images/small_logo.svg" alt="SmartBudget" style={{paddingTop: 9}}
                         onClick={() => router.push('/')}/>
                    <Group gap={5} visibleFrom="xs">
                        <Button variant="light" radius="xl" style={{fontSize: 18}}
                                onClick={() => router.push('/about')}>{t('indexPage.about')}</Button>
                        <Button variant="light" radius="xl" style={{fontSize: 18}}
                                onClick={() => router.push('/contacts')}>{t('indexPage.contacts')}</Button>
                        <Button variant="light" radius="xl" style={{fontSize: 18}}
                                onClick={converterAuthMethods.open}>{t('indexPage.converter')}</Button>
                        <Button variant="light" radius="xl" style={{fontSize: 18}}
                                onClick={drawerAuthMethods.open}>{t('indexPage.logIn/signIn')}</Button>
                    </Group>
                </Container>
            </header>
        );
    }

    async function resend2FA(e: any) {
        e.preventDefault()
        data.twoStepAuthCode = generate2FAcode();
        const response2FA = await fetch('/api/send2FAcodeOnEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: props.user.email,
                twoStepAuthCode: generate2FAcode(),
                fromEmail: "vsakolinskaa@gmail.com"
            }),
        });

        if (response2FA.ok) {
            notifications.show({
                title: 'Уведомление',
                message: 'Код уже отправлен Вам на почту',
            })
            console.log('Email sent successfully!');
        } else {
            console.error('Failed to send email.');
        }
    }

    async function check2FA(e: any) {
        e.preventDefault()
        if (!data.check2FA || data.check2FA != data.twoStepAuthCode) {
            notifications.show({
                title: 'Уведомление',
                message: 'код введён не верно, попробуйте ещё раз',
            })
            return
        }
        notifications.show({
            title: 'Уведомление',
            message: 'Вы успешно вошли',
        })
        await router.push('/main');
    }

    async function checkDate(e: any) {
        e.preventDefault();
        const response = await fetch(`/api/authentication/users`);

        if (!response.ok) throw new Error(response.statusText);

        const json = await response.json();

        if (!validator.isEmail(data.email.trim())) {
            notifications.show({
                title: 'Уведомление',
                message: 'Электронная почта введена не верно',
            })
            return;
        }
        if (!data.password) {
            notifications.show({
                title: 'Уведомление',
                message: 'Введите пароль',
            })
            return;
        }

        const userEmail = json.users.find((user: IUser) => user.email === data.email && user.password === data.password);
        if (!userEmail) {
            notifications.show({
                title: 'Уведомление',
                message: 'Данные введены не верно, попробуйте ещё раз',
            })
            return;
        }
        const checkUser2FA = json.users.find((user: IUser) => user.email === data.email && user.password === data.password && user.twoStepAuth === true);
        if (checkUser2FA) {
            data.twoStepAuthCode = generate2FAcode();
            const response2FA = await fetch('/api/send2FAcodeOnEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    twoStepAuthCode: data.twoStepAuthCode,
                    fromEmail: "vsakolinskaa@gmail.com"
                }),
            });

            if (response2FA.ok) {
                await signIn('credentials', {username: data.email, password: data.password, redirect: false});
                setTwoFAState(true)
                notifications.show({
                    title: 'Уведомление',
                    message: 'Код уже отправлен Вам на почту',
                })
                console.log('Email sent successfully!');
            } else {
                console.error('Failed to send email.');
            }
        } else {
            await signIn('credentials', {username: data.email, password: data.password, redirect: false});

            notifications.show({
                title: 'Уведомление',
                message: 'Вы успешно вошли',
            })

            await router.push('/main');
        }
    }

    async function checkDataForPasswordRecovery(e: any) {
        e.preventDefault();

        if (!validator.isEmail(data.popUpEmail)) {
            notifications.show({
                title: 'Уведомление',
                message: 'Электронная почта введена не верно',
            })
            return;
        }

        const resp = await fetch(`/api/authentication/users`);

        if (!resp.ok) throw new Error(resp.statusText);

        const json = await resp.json();

        const userEmail = json.users.find((user: IUser) => user.email === data.popUpEmail);
        if (!userEmail) {
            notifications.show({
                title: 'Уведомление',
                message: 'Пользователь с такой почтой не обнаружен',
            })
            return;
        }
        const response = await fetch('/api/sendNewPasswordOnEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email: data.popUpEmail, password: data.newPassword, fromEmail: data.fromEmail}),
        });

        if (response.ok) {
            notifications.show({
                title: 'Уведомление',
                message: 'Новый пароль отправлен вам на почту',
            })
            console.log('Email sent successfully!');
            setPasswordRecoveryModalState(false);
        } else {
            console.error('Failed to send email.');
        }
    }

    function handleFieldChange(fieldName: string, value: any) {
        setData(prevData => ({
            ...prevData,
            [fieldName]: value,
        }));
    }

    async function googleAuthentication(e: any) {
        e.preventDefault()
        await signIn('google', {callbackUrl: '/main', redirect: false});
    }

    async function dateValidation(e: any) {
        e.preventDefault();
        const response = await fetch(`/api/authentication/users`);
        if (!response.ok) throw new Error(response.statusText);
        const json = await response.json();
        const userExist = json.users.find((user: IUser) => user.email === data.email);

        if (!data.fio || !data.email || !data.password || !data.checkPassword) {
            notifications.show({
                title: 'Уведомление',
                message: 'Все поля являются обязательными, проверьте введённые данные и попробуйте ещё раз',
            })
            return
        }
        if (!(/^[A-Za-zА-Яа-яЁё\s]+$/).test(data.fio)) {
            notifications.show({
                title: 'Уведомление',
                message: 'ФИО введено не верно',
            })
            return;
        }
        if (!validator.isEmail(data.email.trim())) {
            notifications.show({
                title: 'Уведомление',
                message: 'Почта введена не верно',
            })
            return;
        }
        if (data.password.length < 8) {
            notifications.show({
                title: 'Уведомление',
                message: 'Пароль должен содержать не менее 8 символов',
            })
            return;
        }
        if (data.password != data.checkPassword) {
            notifications.show({
                title: 'Уведомление',
                message: 'Пароль введён не верно',
            })
            return;
        }
        if (!userExist) {
            await dataToDB()
            await signIn('credentials', {username: data.email, password: data.password, redirect: false});
            await router.push('/main')
        } else {
            notifications.show({
                title: 'Уведомление',
                message: 'Аккаунт с такой почтой уже существует',
            })
        }
    }

    async function dataToDB() {
        const bankAccount_id = new ObjectId().toString();

        const user = createUserObj(data.fio, data.email, data.password, bankAccount_id);

        const userResponse = await fetch(`/api/authentication/${JSON.stringify(user)}`);
        if (!userResponse.ok) throw new Error(userResponse.statusText);

        const bankAccount = createBankAccountObj(user._id, bankAccount_id);

        const response = await fetch(`/api/addBankAccount`, {
            method: 'POST',
            body: JSON.stringify(bankAccount)
        });
        if (!response.ok) throw new Error(response.statusText);
    }

    async function convert() {
        if (!convertData.sum || !(/^[\d]+$/).test(convertData.sum.toString())) {
            notifications.show({
                title: 'Уведомление',
                message: 'Сумма введена не верно',
            })
            handleConvertChange("sum", 0)
            return
        }
        let {sum, afterCurrency, beforeCurrency} = convertData;

        const response = await fetch('/api/converter', {
            method: 'POST',
            body: JSON.stringify({
                sum,
                afterCurrency,
                beforeCurrency
            }),
        });

        if (response.ok) {
            console.log('converter api worked successfully!');
            const convert = (await response.json()).result;
            handleConvertChange("newSum", convert?.toFixed(2));
        } else {
            console.error('Failed work converter.');
        }
    }

    function authToReg() {
        drawerAuthMethods.close();
        drawerRegistrationMethods.open();
    }

    function regToAuth() {
        drawerRegistrationMethods.close();
        drawerAuthMethods.open();
    }

    return (
        <div className={styles.page}>
            <IndexHeader/>
            <div className={styles.pageContent}>
                <Button onClick={() => changeLanguage('en')}>EN</Button>
                <Button onClick={() => changeLanguage('ru')}>RU</Button>
                <br/>
                <h1 className={styles.welcomeText}>{t('indexPage.hello')}</h1><br/>
                <Group style={{marginTop: 30}}>
                    <img alt="" src="/images/bigTriangle.svg"/>
                    <h1 style={{
                        color: "grey",
                        marginLeft: -300,
                        marginTop: -100,
                        fontSize: 40,
                        paddingTop: 0
                    }}>{t('indexPage.aboutText')}</h1><br/>
                    <Button style={{position: "absolute", width: 250, marginTop: 100, marginLeft: 800, fontSize: 20}}
                            size="md"
                            radius="xl" onClick={drawerAuthMethods.open}>{t('indexPage.startButton')}</Button>
                </Group><br/>
                <div>
                    <Drawer
                        opened={authDrawerState}
                        onClose={()=>{drawerAuthMethods.close(); setSegmentState('Sign In')}}
                        overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                        position="right"
                        offset={8} radius="md">
                        <h1
                            style={{
                                fontSize: 40,
                                padding: 0,
                                marginTop: -15,
                                marginBottom: 10,
                                textAlign: "center"
                            }}>{t('authenticationPage.signIn')}</h1>
                        <SegmentedControl value={segmentState} fullWidth data={['Sign In', 'Sign Up']} radius='xl'
                                          onChange={(e) => {
                                              setSegmentState(e);
                                              if (e === 'Sign In') {
                                                  regToAuth()
                                              } else if (e === 'Sign Up') {
                                                  authToReg()
                                              }
                                          }}/><br/>
                        <TextInput
                            label={t('authenticationPage.input.email')}
                            placeholder="your@email.com"
                            value={data.email}
                            onChange={(e) => handleFieldChange("email", e.target.value)}
                            title={t('authenticationPage.placeholder.email')}
                        />
                        <PasswordInput
                            label={t('authenticationPage.input.password')}
                            value={data.password}
                            onChange={(e) => handleFieldChange("password", e.target.value)}
                            title={t('authenticationPage.placeholder.password')}
                        />
                        <Button id="auth"
                                style={{width: 410, marginTop: 20, fontSize: 18}}
                                onClick={checkDate}
                                title={t('authenticationPage.placeholder.button')}>{t('authenticationPage.signInButton')}</Button>
                        <Button style={{width: 410, marginTop: 5, fontSize: 18}}
                                leftSection={<GoogleIcon/>}
                                variant={"outline"}
                                onClick={googleAuthentication}
                                title={t('authenticationPage.placeholder.button')}>{t('authenticationPage.googleLoginButton')}</Button>
                        <br/>
                        <Button variant={"transparent"} onClick={() => {
                            setSegmentState('Sign In');
                            authToReg();
                        }}
                                style={{fontSize: 16, textAlign: "center", marginLeft: 80}}
                                title={t('authenticationPage.placeholder.regLink')}>{t('authenticationPage.registrationLink')}</Button><br/>

                        <Button variant={"transparent"} title={t('authenticationPage.placeholder.changePassLink')}
                                style={{marginLeft: 120, fontSize: 16, textAlign: "center"}}
                                onClick={() => setPasswordRecoveryModalState(!passwordRecoveryModalState)}>
                            {t('authenticationPage.changePasswordLink')}</Button>

                        <Modal opened={passwordRecoveryModalState} onClose={() => setPasswordRecoveryModalState(false)}
                               overlayProps={{backgroundOpacity: 0, blur: 4}}
                               title={t('authenticationPage.modals.header')}>
                            <TextInput
                                label={t('authenticationPage.modals.email')}
                                placeholder="your@email.com"
                                onChange={(e) => handleFieldChange("popUpEmail", e.target.value)}
                                title={t('authenticationPage.modals.title')}
                            />
                            <Button onClick={checkDataForPasswordRecovery}
                                    style={{marginTop: 10, width: 408}}
                                    title={t('authenticationPage.modals.buttonTitle')}>{t('authenticationPage.modals.button')}</Button>
                        </Modal>
                    </Drawer>
                    <Drawer
                        opened={registrationDrawerState}
                        onClose={()=>{drawerRegistrationMethods.close(); setSegmentState('Sign In') }}
                        overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                        position="right"
                        offset={8} radius="md">
                        <h1 style={{
                            fontSize: 35,
                            marginTop: -15,
                            marginBottom: 12,
                            paddingLeft: 100
                        }}>{t('registrationPage.label')}</h1>
                        <SegmentedControl value={segmentState} fullWidth
                                          data={['Sign In', 'Sign Up']} radius='xl'
                                          onChange={(e) => {
                                              setSegmentState(e);
                                              if (e === 'Sign In') {
                                                  regToAuth()
                                              } else if (e === 'Sign Up') {
                                                  authToReg()
                                              }
                                          }}/><br/>
                        <TextInput
                            withAsterisk
                            label={t('registrationPage.inputFIO')}
                            placeholder={t('registrationPage.inputPlaceholder.fio')}
                            value={data.fio}
                            onChange={(e) => handleFieldChange("fio", e.target.value)}
                            title={t('registrationPage.placeholder.fio')}
                        />
                        <TextInput
                            withAsterisk
                            label={t('registrationPage.inputEmail')}
                            placeholder={t('registrationPage.inputPlaceholder.email')}
                            value={data.email}
                            onChange={(e) => handleFieldChange("email", e.target.value)}
                            title={t('registrationPage.placeholder.email')}
                        />
                        <PasswordInput
                            withAsterisk
                            label={t('registrationPage.inputPassword')}
                            value={data.password}
                            onChange={(e) => handleFieldChange("password", e.target.value)}
                            title={t('registrationPage.placeholder.password')}
                        />
                        <PasswordInput
                            withAsterisk
                            label={t('registrationPage.checkPassword')}
                            value={data.checkPassword}
                            onChange={(e) => handleFieldChange("checkPassword", e.target.value)}
                            title={t('registrationPage.placeholder.password')}
                        />
                        <Button onClick={dateValidation}
                                style={{width: 410, marginTop: 20, fontSize: 20}}
                                title={t('registrationPage.placeholder.button')}>{t('registrationPage.button')}</Button>
                        <br/>
                        <Button onClick={googleAuthentication}
                                leftSection={<GoogleIcon/>}
                                variant={"outline"}
                                style={{
                                    width: 410,
                                    marginTop: 5,
                                    fontSize: 20,
                                }}>{t('registrationPage.googleButton')}</Button>
                        <Button style={{textAlign: "center", marginLeft: 70, fontSize: 16}} variant={"transparent"}
                                onClick={() => {
                                    setSegmentState('Log In');
                                    regToAuth();
                                }}>{t('registrationPage.link')}</Button>
                    </Drawer></div>
                <Modal opened={twoFAState} onClose={() => setTwoFAState(false)}
                       overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                       title={t('2FA.label')}>
                    <PinInput size="md" length={6} type="number" value={data.check2FA}
                              title={t('2FA.inputCodeText')}
                              onChange={(e) => handleFieldChange("check2FA", e)}/><br/>
                    <Button style={{width: 276, marginTop: 5, fontSize: 20}}
                            onClick={check2FA}
                            title={t('authenticationPage.placeholder.button')}>{t('2FA.confirmButton')}
                    </Button><br/>
                    <Link href={""} onClick={resend2FA} style={{marginLeft: 60}}>{t('2FA.resendLink')}</Link>
                </Modal>
                <Drawer
                    title={t('indexPage.converterDrawer.title')}
                    opened={converterDrawerState}
                    onClose={converterAuthMethods.close}
                    overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                    position="right"
                    offset={8} radius="md">
                    <Group>
                        <TextInput style={{width: 307}} label={t('indexPage.converterDrawer.label-1')}
                                   onChange={(e) => handleConvertChange("sum", e.target.value)}/>
                        <NativeSelect style={{width: 85, paddingTop: 25}} data={convertData.currency}
                                      onChange={(e) => handleConvertChange("beforeCurrency", e.target.value)}/>
                    </Group>
                    <Group>
                        <TextInput readOnly={true} style={{width: 307}} label={t('indexPage.converterDrawer.label-2')}
                                   value={convertData.newSum}/>
                        <NativeSelect style={{width: 85, paddingTop: 25}} data={convertData.currency}
                                      onChange={(e) => handleConvertChange("afterCurrency", e.target.value)}/></Group>
                    <br/>
                    <Button style={{width: 410, fontSize: 20}} onClick={convert}>{t('indexPage.converterDrawer.button')}</Button>
                </Drawer>
            </div>
            <Footer/>
        </div>
    )
}
export const getServerSideProps = async (ctx: any) => {
    const session = await getSession(ctx);

    const {db} = await connectToDatabase();

    const user = (await db.collection('users').findOne({email: session?.user?.email})) as IUser;

    return {
        props: {
            user: user,
            ...(await serverSideTranslations(ctx.locale, ['common']))
        }
    }
};
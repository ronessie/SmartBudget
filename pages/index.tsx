import {useTranslation} from 'next-i18next';
import path from 'path';
import Link from "next/link";
import {useRouter} from "next/router";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {Button, Drawer, Modal, PasswordInput, SegmentedControl, TextInput} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import styles from "@/styles/pages.module.css";
import React, {useState} from "react";
import {createBankAccountObj, createUserObj, generate2FAcode, generatePassword} from "@/src/utils";
import validator from "validator";
import IUser from "@/src/types/IUser";
import {signIn} from "next-auth/react";
import {ObjectId} from "bson";
import IndexHeader from "../components/indexHeader"

path.resolve('./next.config.js');

export default function Page() {
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
    const [segmentState, setSegmentState] = useState('Log In');

    const changeLanguage = async (language: string) => {
        await router.push(router.pathname, router.asPath, {locale: language});
    };

    async function checkDate(e: any) {
        e.preventDefault();
        const response = await fetch(`/api/authentication/users`);

        if (!response.ok) throw new Error(response.statusText);

        const json = await response.json();

        if (!validator.isEmail(data.email.trim())) {
            alert("Электронная почта введена не верно")
            return;
        }
        if (!data.password) {
            alert("Введите пароль")
            return;
        }

        const userEmail = json.users.find((user: IUser) => user.email === data.email && user.password === data.password);
        if (!userEmail) {
            alert("Данные введены не верно, попробуйте ещё раз")
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
                alert("Код уже отправлен Вам на почту");
                await router.push('/2FA');
                console.log('Email sent successfully!');
            } else {
                console.error('Failed to send email.');
            }
        } else {
            await signIn('credentials', {username: data.email, password: data.password, redirect: false});

            alert("Вы успешно вошли")

            await router.push('/main');
        }
    }

    async function checkDataForPasswordRecovery(e: any) {
        e.preventDefault();

        if (!validator.isEmail(data.popUpEmail)) {
            alert("Электронная почта введена не верно")
            return;
        }

        const resp = await fetch(`/api/authentication/users`);

        if (!resp.ok) throw new Error(resp.statusText);

        const json = await resp.json();

        const userEmail = json.users.find((user: IUser) => user.email === data.popUpEmail);
        if (!userEmail) {
            alert("Пользователь с такой почтой не обнаружен")
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
            alert("Новый пароль отправлен вам на почту");
            console.log('Email sent successfully!');
            setPasswordRecoveryModalState(false);
        } else {
            console.error('Failed to send email.');
        }
    }

    function handleFieldChange(fieldName: string, value: any) {
        setData({
            ...data,
            [fieldName]: value,
        });
    }

    async function googleAuthentication(e: any) {
        e.preventDefault()
        await signIn('google', { callbackUrl: '/main' });
    }

    async function dateValidation(e: any) {
        e.preventDefault();
        const response = await fetch(`/api/authentication/users`);
        if (!response.ok) throw new Error(response.statusText);
        const json = await response.json();
        const userExist = json.users.find((user: IUser) => user.email === data.email);

        if (!data.fio || !data.email || !data.password || !data.checkPassword) {
            alert("Все поля являются обязательными, проверьте введённые данные и попробуйте ещё раз")
            return
        }
        if (!(/^[A-Za-zА-Яа-яЁё\s]+$/).test(data.fio)) {
            alert("ФИО введено не верно")
            return;
        }
        if (!validator.isEmail(data.email.trim())) {
            alert("Почта введена не верно")
            return;
        }
        if (data.password.length < 8) {
            alert("Пароль должен содержать не менее 8 символов")
            return;
        }
        if (data.password != data.checkPassword) {
            alert("Пароль введён не верно")
            return;
        }
        if (!userExist) {
            await dataToDB()
            await signIn('credentials', {username: data.email, password: data.password, redirect: false});
            router.push('/main')
        } else {
            alert("Аккаунт с такой почтой уже существует")
        }
    }

    async function dataToDB() {
        const bankAccount_id = new ObjectId().toString();

        const user = createUserObj(data.fio, data.email, data.password, bankAccount_id);

        const userResponse = await fetch(`/api/authentication/${JSON.stringify(user)}`);
        if (!userResponse.ok) throw new Error(userResponse.statusText);

        const bankAccount = createBankAccountObj(user._id, bankAccount_id);

        const response = await fetch(`/api/addBankAccount/${JSON.stringify(bankAccount)}`);
        if (!response.ok) throw new Error(response.statusText);
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
            <div style={{paddingTop: 70}}>
                <Link href={"authentication"}>{t('indexPage.authentication')}</Link>
                <br/>
                <Link href={"registration"}>{t('indexPage.registration')}</Link>
                <br/>
                <Link href={"main"}>{t('indexPage.main')}</Link>
                <br/>
                <Link href={"addingCheck"}>Чеки</Link>
                <br/>
                <Link href={"account"}>Аккаунт</Link>
                <br/>
                <Button onClick={() => changeLanguage('en')}>EN</Button>
                <Button onClick={() => changeLanguage('ru')}>RU</Button>
                <Button onClick={drawerAuthMethods.open}>Open drawer Auth</Button>
                <div>
                    <Drawer
                        opened={authDrawerState}
                        onClose={drawerAuthMethods.close}
                        overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                        position="right"
                        offset={8} radius="md">
                        <SegmentedControl value={segmentState} data={['Log In', 'Sign In']} onChange={(e) => {
                            setSegmentState(e);
                            if (e === 'Log In') {
                                regToAuth()
                            } else if (e === 'Sign In') {
                                authToReg()
                            }
                        }}/>
                        <h1 className={styles.bigBlackText}
                            style={{
                                fontSize: 40,
                                padding: 0,
                                textAlign: "center"
                            }}>{t('authenticationPage.signIn')}</h1>
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
                        <Button className={styles.button} id="auth"
                                style={{width: 410, marginTop: 20, fontSize: 18}}
                                onClick={checkDate}
                                title={t('authenticationPage.placeholder.button')}>{t('authenticationPage.signInButton')}</Button>
                        <Button className={styles.button}
                                style={{width: 410, marginTop: 5, fontSize: 18, backgroundColor: "grey"}}
                                onClick={googleAuthentication}
                                title={t('authenticationPage.placeholder.button')}>{t('authenticationPage.googleLoginButton')}</Button>
                        <br/>
                        <Link href="" onClick={() => {setSegmentState('Sign In'); authToReg();}} className={styles.link}
                              style={{fontSize: 16, textAlign: "center", paddingLeft: 80}}
                              title={t('authenticationPage.placeholder.regLink')}>{t('authenticationPage.registrationLink')}</Link><br/>

                        <Link href={""} title={t('authenticationPage.placeholder.changePassLink')}
                              className={styles.link}
                              style={{paddingLeft: 120, fontSize: 16, textAlign: "center"}}
                              onClick={() => setPasswordRecoveryModalState(!passwordRecoveryModalState)}>
                            {t('authenticationPage.changePasswordLink')}</Link>

                        <Modal opened={passwordRecoveryModalState} onClose={() => setPasswordRecoveryModalState(false)}
                               overlayProps={{backgroundOpacity: 0}}
                               title={t('authenticationPage.modals.header')}>
                            <TextInput
                                label={t('authenticationPage.modals.email')}
                                placeholder="your@email.com"
                                onChange={(e) => handleFieldChange("popUpEmail", e.target.value)}
                                title={t('authenticationPage.modals.title')}
                            />
                            <Button onClick={checkDataForPasswordRecovery} className={styles.button}
                                    style={{marginTop: 10, width: 408}}
                                    title={t('authenticationPage.modals.buttonTitle')}>{t('authenticationPage.modals.button')}</Button>
                        </Modal>
                    </Drawer>
                    <Drawer
                        opened={registrationDrawerState}
                        onClose={drawerRegistrationMethods.close}
                        overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                        position="right"
                        offset={8} radius="md">
                        <SegmentedControl value={segmentState} data={['Log In', 'Sign In']} onChange={(e) => {
                            setSegmentState(e);
                            if (e === 'Log In') {
                                regToAuth()
                            } else if (e === 'Sign In') {
                                authToReg()
                            }
                        }}/>
                        <h1 className={styles.bigBlackText}
                            style={{
                                fontSize: 35,
                                paddingLeft: 100
                            }}>{t('registrationPage.label')}</h1>
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
                        <Button className={styles.button} onClick={dateValidation}
                                style={{width: 410, marginTop: 20, fontSize: 20}}
                                title={t('registrationPage.placeholder.button')}>{t('registrationPage.button')}</Button>
                        <br/>
                        <Button className={styles.button} onClick={googleAuthentication}
                                style={{
                                    width: 410,
                                    marginTop: 5,
                                    fontSize: 20,
                                    backgroundColor: "grey"
                                }}>{t('registrationPage.googleButton')}</Button>
                        <Link className={styles.link} style={{textAlign: "center", paddingLeft: 100}} href=""
                              onClick={() => {setSegmentState('Log In'); regToAuth();}}>{t('registrationPage.link')}</Link>
                    </Drawer></div>
            </div>
        </div>
    )
}
export const getServerSideProps = async (ctx: any) => ({
    props: {
        ...(await serverSideTranslations(ctx.locale, ['common']))
    }
});
//ТУТ БУДЕТ СТРАНИЦА - РЕКЛАМА, ВСЁ О ПРИЛОЖЕНИ И ТД + КНОПКА ВХОДА/РЕГИСТРАЦИИ

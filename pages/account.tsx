import '../styles/pages.module.css'
import IUser from "@/src/types/IUser";
import React, {useState} from "react";
import {AppShell, Avatar} from '@mantine/core';
import styles from '../styles/pages.module.css'
import {getSession} from "next-auth/react";
import {connectToDatabase} from "@/src/database";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {IconCopy, IconCheck} from '@tabler/icons-react';
import {ObjectId} from "bson";
import IBankAccount from "@/src/types/IBankAccount";
import Footer from "../components/footer"
import {
    ActionIcon,
    Button,
    CopyButton,
    Fieldset,
    Group,
    Modal,
    NativeSelect,
    Switch,
    Text,
    TextInput,
    Tooltip, SegmentedControl, TagsInput, InputBase, Pill
} from "@mantine/core";
import {createBankAccountObj, defaultExpensesCategories, defaultIncomeCategories} from "@/src/utils";
import Header from "../components/header"
import {currency} from "@/src/utils";
import {notifications} from "@mantine/notifications";
import {useTranslation} from "next-i18next";
import {authRedirect} from "@/src/server/authRedirect";

export default function Page(props: {
    user: IUser,
    bankAccount: IBankAccount,
    bankAccounts: { label: string, value: string }[]
}) {
    const {t} = useTranslation();
    const [changeModalState, setChangeModalState] = useState(false);
    const [changeAccountModalState, setChangeAccountModalState] = useState(false);
    const [addIncomeCategoryModalState, setAddIncomeCategoryModalState] = useState(false);
    const [addExpensesCategoryModalState, setAddExpensesCategoryModalState] = useState(false);
    const [billModalState, setBillModalState] = useState(false);
    const [inviteCodeModalState, setInviteCodeModalState] = useState(false);
    const [segmentState, setSegmentState] = useState(t('accountPage.income'));
    const [codeModalState, setCodeModalState] = useState(false);
    const [data, setData] = useState({
        name: t('accountPage.bankAcc'),
        currency: props.bankAccount.currency,
        balance: 0,
        inviteCode: props.bankAccount.invitingCode,
        fio: props.user.fio,
        email: props.user.email,
        bankAccounts: props.bankAccounts,
        selectBankAccount: props.bankAccounts[0].value,
        bankName: props.bankAccount.name,
        changeFio: props.user.fio,
        changeEmail: props.user.email,
        changeCurrency: props.bankAccount.currency,
        changeBankName: props.bankAccount.name,
        allCurrency: currency(),
        allIncomeCategories: (props.bankAccount?.incomeCategories ?? []).map(e => t(e)),
        allExpensesCategories: (props.bankAccount?.expensesCategories ?? []).map(e => t(e))
    });
    const [checked2FA, setChecked2FA] = useState(props.user.twoStepAuth);
    const [newIncomeCategories, setNewIncomeCategories] = useState(data.allIncomeCategories);
    const [newExpensesCategories, setNewExpensesCategories] = useState(data.allExpensesCategories);

    function handleFieldChange(fieldName: string, value: any) {
        setData(prevData => ({
            ...prevData,
            [fieldName]: value,
        }));
    }


    async function dateValidation(e: any) {
        e.preventDefault();
        if (!data.balance || !(/^[\d]+$/).test(data.balance.toString())) {
            notifications.show({
                title: t('accountPage.notifications.title'),
                message: t('accountPage.notifications.dateValidationSumError'),
            })
            return
        }
        if (!data.name) {
            notifications.show({
                title: t('accountPage.notifications.title'),
                message: t('accountPage.notifications.dateValidationNameError'),
            })
            return
        } else {
            await dataToDB();
        }
    }

    async function checkInviteCode(e: any) {
        e.preventDefault();
        let response = await fetch(`/api/addBankAccount/bankAccounts`);

        if (!response.ok) throw new Error(response.statusText);

        const json = await response.json();
        const inviteToBankAccount = json.users.find((bankAccount: IBankAccount) => bankAccount.invitingCode === data.inviteCode)
        const firstUser = json.users.find((bankAccount: IBankAccount) => bankAccount.invitingCode === data.inviteCode && bankAccount.user_id === props.user._id)
        const secondUser = json.users.find((bankAccount: IBankAccount) => bankAccount.invitingCode === data.inviteCode && bankAccount.secondUser_id === props.user._id)
        const allUser = json.users.find((bankAccount: IBankAccount) => bankAccount.invitingCode === data.inviteCode && bankAccount.secondUser_id)
        if (firstUser || secondUser) {
            notifications.show({
                title: t('accountPage.notifications.title'),
                message: t('accountPage.notifications.checkInviteCodeUderError'),
            })
            return;
        }
        if (allUser) {
            notifications.show({
                title: t('accountPage.notifications.title'),
                message: t('accountPage.notifications.checkInviteCodeAllUserError'),
            })
            return;
        }
        if (!inviteToBankAccount) {
            notifications.show({
                title: t('accountPage.notifications.title'),
                message: t('accountPage.notifications.checkInviteCodeError'),
            })
            return;
        } else {

            const response = await fetch(`/api/updateBankAccountSecondUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: props.user._id,
                    id: inviteToBankAccount._id
                }),
            });

            if (!response.ok) throw new Error(response.statusText);

            const responseUpdate = await fetch(`/api/changeCurrentBankAccount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: props.user._id,
                    bankAccount_id: inviteToBankAccount._id
                }),
            });

            if (!responseUpdate.ok) throw new Error(responseUpdate.statusText);
            const updateBankAccount = (await response.json()).bankAccount as IBankAccount;
            handleFieldChange("bankName", updateBankAccount.name)
            setBillModalState(false);
            setInviteCodeModalState(false);
            notifications.show({
                title: t('accountPage.notifications.title'),
                message: t('accountPage.notifications.inviteToAccountDone'),
            })
        }
    }

    async function dataToDB() {
        const bankAccount = createBankAccountObj(props.user._id, new ObjectId().toString(), data.name, data.currency, data.balance);

        const response = await fetch(`/api/addBankAccount`, {
            method: 'POST',
            body: JSON.stringify(bankAccount)
        });

        if (!response.ok) throw new Error(response.statusText);

        const changeResponse = await fetch(`/api/changeCurrentBankAccount`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: props.user._id,
                bankAccount_id: bankAccount._id
            }),
        });

        if (!changeResponse.ok) throw new Error(response.statusText);

        const responseJson = await changeResponse.json()
        const updateBankAccount = responseJson.bankAccount as IBankAccount
        const updateUser = responseJson.user as IUser
        handleFieldChange("bankName", updateBankAccount.name)
        handleFieldChange("changeBankName", updateBankAccount.name)
        handleFieldChange("fio", updateUser.fio)
        handleFieldChange("email", updateUser.email)
        notifications.show({
            title: t('accountPage.notifications.title'),
            message: t('accountPage.notifications.accountCreated'),
        })
        setBillModalState(false)
    }

    async function changeBankAccount() {
        if (!data.selectBankAccount) {
            notifications.show({
                title: t('accountPage.notifications.title'),
                message: t('accountPage.notifications.selectBankAcc'),
            })
            return
        }
        const response = await fetch(`/api/changeCurrentBankAccount`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: props.user._id,
                bankAccount_id: data.selectBankAccount
            }),
        });

        if (!response.ok) throw new Error(response.statusText);

        const updateBankAccount = (await response.json()).bankAccount as IBankAccount;
        handleFieldChange("bankName", updateBankAccount.name)
        handleFieldChange("changeBankName", updateBankAccount.name)

        notifications.show({
            title: t('accountPage.notifications.title'),
            message: t('accountPage.notifications.accountChanged'),
        })
        setChangeAccountModalState(false)
    }

    async function updateData() {
        if (!data.changeFio || !data.changeEmail || !data.changeBankName) {
            notifications.show({
                title: t('accountPage.notifications.title'),
                message: t('accountPage.notifications.inputDataError'),
            })
            return
        }
        const response = await fetch(`/api/updateData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: props.user._id,
                fio: data.changeFio,
                email: data.changeEmail,
                twoFA: checked2FA,
                name: data.changeBankName,
                currency: data.changeCurrency
            }),
        });

        if (!response.ok) throw new Error(response.statusText);
        notifications.show({
            title: t('accountPage.notifications.title'),
            message: t('accountPage.notifications.dataUpdate'),
        })
        handleFieldChange("fio", data.changeFio)
        handleFieldChange("email", data.changeEmail)
        handleFieldChange("bankName", data.changeBankName)
        setChangeModalState(false);
    }

    async function updateIncomeCategories() {
        const response = await fetch(`/api/updateIncomeCategories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: props.user.currentBankAccount,
                categories: newIncomeCategories,
            }),
        });

        if (!response.ok) throw new Error(response.statusText);
        notifications.show({
            title: t('accountPage.notifications.title'),
            message: t('accountPage.notifications.categoryUpdate'),
        })
    }

    async function updateExpensesCategories() {
        const response = await fetch(`/api/updateExpensesCategories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: props.user.currentBankAccount,
                categories: newExpensesCategories,
            }),
        });

        if (!response.ok) throw new Error(response.statusText);
        notifications.show({
            title: t('accountPage.notifications.title'),
            message: t('accountPage.notifications.categoryUpdate'),
        })

    }

    function incomeCategories() {
        setAddExpensesCategoryModalState(false)
        setAddIncomeCategoryModalState(true)
    }

    function expensesCategories() {
        setAddIncomeCategoryModalState(false)
        setAddExpensesCategoryModalState(true)
    }

    return (
        <div className={styles.page}>
            <Header/>
            <AppShell
                header={{height: 55}}
                navbar={{
                    width: 300,
                    breakpoint: 'sm',
                }}
                padding="md"
            >
                <AppShell.Navbar className={styles.navbar} p="md">
                    <div><h1 style={{marginLeft: 70}} className={styles.blueText}>{t('accountPage.appShell.title')}</h1>
                        <br/>
                        <Button radius="xl" style={{marginTop: 5}}
                                onClick={() => setChangeModalState(!changeModalState)}
                                fullWidth={true} variant="light">{t('accountPage.appShell.editData')}</Button>
                        <Button radius="xl" style={{marginTop: 5}}
                                onClick={() => setAddIncomeCategoryModalState(!addIncomeCategoryModalState)}
                                fullWidth={true} variant="light">{t('accountPage.appShell.editCategory')}</Button>
                        <Button radius="xl" style={{marginTop: 5}} onClick={() => setBillModalState(!billModalState)}
                                fullWidth={true} variant="light">{t('accountPage.appShell.addBankAcc')}</Button>
                        <Button radius="xl" style={{marginTop: 5}}
                                onClick={() => setChangeAccountModalState(!changeAccountModalState)} fullWidth={true}
                                variant="light">{t('accountPage.appShell.changeBankAcc')}</Button>
                        <Button radius="xl" style={{marginTop: 5}} onClick={() => setCodeModalState(!codeModalState)}
                                fullWidth={true} variant="light">{t('accountPage.appShell.inviteCode')}</Button>
                    </div>
                </AppShell.Navbar>
                <AppShell.Main>
                    <Fieldset radius="xl" className={styles.account}>
                        <Avatar variant="light" radius="150" size="150" color="blue" src="" className={styles.icon}/>
                        <Group><h1 className={styles.blueAccountText}>{t('accountPage.fieldset.fio')}</h1><h1
                            className={styles.accountText}>{data.fio}</h1></Group>
                        <Group><h1 className={styles.blueAccountText}>{t('accountPage.fieldset.email')}</h1><h1
                            className={styles.accountText}>{data.email}</h1></Group>
                        <Group><h1 className={styles.blueAccountText}>{t('accountPage.fieldset.bankAccName')}</h1><h1
                            className={styles.accountText}>{data.bankName}</h1></Group>
                        <Group><h1 className={styles.blueAccountText}>{t('accountPage.fieldset.currency')}</h1><h1
                            className={styles.accountText}>{data.currency}</h1></Group>
                    </Fieldset>
                    <Modal closeOnClickOutside={false}
                           closeOnEscape={false} opened={changeModalState} onClose={() => setChangeModalState(false)}
                           overlayProps={{backgroundOpacity: 0.5, blur: 4}} radius="md"
                           title={t('accountPage.editData')}>
                        <TextInput radius="md"
                                   label={t('accountPage.fieldset.fio')}
                                   onChange={(e) => handleFieldChange("changeFio", e.target.value)}
                                   title={t('accountPage.inputFIO')}
                                   value={data.changeFio}
                        />
                        <TextInput radius="md"
                                   label={t('accountPage.fieldset.email')}
                                   onChange={(e) => handleFieldChange("changeEmail", e.target.value)}
                                   title={t('accountPage.inputEmail')}
                                   value={data.changeEmail}
                        />
                        <TextInput radius="md"
                                   label={t('accountPage.fieldset.bankAccName')}
                                   onChange={(e) => handleFieldChange("changeBankName", e.target.value)}
                                   title={t('accountPage.inputBankAccName')}
                                   value={data.changeBankName}
                        /><br/>
                        <Switch label={t('accountPage.2fa')} size="md" onLabel={t('accountPage.on')}
                                offLabel={t('accountPage.off')}
                                checked={checked2FA}
                                onChange={(event) => setChecked2FA(event.currentTarget.checked)}/>
                        <Button radius="md" onClick={updateData}
                                style={{width: 410, marginTop: 20, fontSize: 20}}>{t('accountPage.save')}
                        </Button>
                    </Modal>
                    <Modal closeOnClickOutside={false}
                           closeOnEscape={false} opened={addIncomeCategoryModalState} radius="md" onClose={() => {
                        setAddIncomeCategoryModalState(false)
                        setSegmentState(t('accountPage.income'))
                    }}
                           overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                           title={t('accountPage.addIncomeCategory')}>
                        <SegmentedControl fullWidth value={segmentState}
                                          data={[t('accountPage.income'), t('accountPage.expenses')]} radius='xl'
                                          onChange={(e) => {
                                              setSegmentState(e);
                                              if (e === t('accountPage.income')) {
                                                  incomeCategories()
                                              } else if (e === t('accountPage.expenses')) {
                                                  expensesCategories()
                                              }
                                          }}/>
                        <InputBase radius="md" component="div" multiline label={t('accountPage.basicIncomeCategory')}>
                            <Pill.Group>{defaultIncomeCategories.map(e => (
                                <Pill key={e} withRemoveButton disabled>
                                    {t(e)}
                                </Pill>
                            ))}</Pill.Group>
                        </InputBase>
                        <TagsInput radius="md"
                                   label={t('accountPage.userIncomeCategory')}
                                   placeholder={t('accountPage.inputUserIncomeCategory')}
                                   value={newIncomeCategories}
                                   onChange={(e) => setNewIncomeCategories(e)}
                        />
                        <Button onClick={updateIncomeCategories} radius="md"
                                style={{width: 410, marginTop: 20, fontSize: 20}}>{t('accountPage.save')}</Button>
                    </Modal>
                    <Modal closeOnClickOutside={false}
                           closeOnEscape={false} overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                           title={t('accountPage.addExpensesCategory')}
                           opened={addExpensesCategoryModalState} radius="md"
                           onClose={() => {
                               setAddExpensesCategoryModalState(false)
                               setSegmentState(t('accountPage.income'))
                           }}>
                        <SegmentedControl fullWidth value={segmentState}
                                          data={[t('accountPage.income'), t('accountPage.expenses')]} radius='xl'
                                          onChange={(e) => {
                                              setSegmentState(e);
                                              if (e === t('accountPage.income')) {
                                                  incomeCategories()
                                              } else if (e === t('accountPage.expenses')) {
                                                  expensesCategories()
                                              }
                                          }}/>
                        <InputBase radius="md" component="div" multiline label={t('accountPage.basicExpensesCategory')}>
                            <Pill.Group>{defaultExpensesCategories.map(e => (
                                <Pill key={e} withRemoveButton disabled>
                                    {t(e)}
                                </Pill>
                            ))}</Pill.Group>
                        </InputBase>
                        <TagsInput radius="md"
                                   label={t('accountPage.userExpensesCategory')}
                                   placeholder={t('accountPage.inputUserExpensesCategory')}
                                   value={newExpensesCategories}
                                   onChange={(e) => setNewExpensesCategories(e)}
                        />
                        <Button onClick={updateExpensesCategories} radius="md"
                                style={{width: 410, marginTop: 20, fontSize: 20}}>{t('accountPage.save')}</Button>
                    </Modal>
                    <Modal closeOnClickOutside={false}
                           closeOnEscape={false} radius="md"
                           overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                           opened={billModalState} onClose={() => setBillModalState(false)}
                           title={t('accountPage.addBankAccount')}>
                        <TextInput radius="md"
                                   label={t('accountPage.inputBankAccName')}
                                   placeholder={t('accountPage.bankAcc')}
                                   onChange={(e) => handleFieldChange("name", e.target.value)}
                                   title={t('accountPage.bankAccExample')}
                        />
                        <Group>
                            <TextInput radius="md"
                                       label={t('accountPage.inputStartSum')}
                                       placeholder="1000"
                                       style={{paddingRight: 0, width: 312}}
                                       onChange={(e) => handleFieldChange("balance", e.target.value)}
                                       title={t('accountPage.titleStartSum')}
                            />
                            <NativeSelect radius="md"
                                          onChange={(e) => handleFieldChange("currency", e.target.value)}
                                          title={t('accountPage.titleSelectCurrency')}
                                          style={{paddingTop: 25, marginLeft: 0, width: 80}}
                                          defaultValue={props.bankAccount.currency}
                                          data={data.allCurrency}>
                            </NativeSelect></Group>
                        <Button onClick={dateValidation} radius="md"
                                style={{width: 410, marginTop: 20, fontSize: 20}}>{t('accountPage.add')}
                        </Button>

                        <Button variant="transparent" style={{textAlign: "center"}} fullWidth={true}
                                onClick={() => setInviteCodeModalState(!inviteCodeModalState)}>{t('accountPage.inviteCodeLink')}
                        </Button>
                        <Modal closeOnClickOutside={false}
                               closeOnEscape={false} opened={inviteCodeModalState}
                               onClose={() => setInviteCodeModalState(false)} radius="md"
                               overlayProps={{backgroundOpacity: 0, blur: 4}}
                               title={t('accountPage.connectToBankAcc')}>
                            <TextInput radius="md"
                                       label={t('accountPage.inputInviteCode')}
                                       onChange={(e) => handleFieldChange("inviteCode", e.target.value)}
                                       title={t('accountPage.titleInputInviteCode')}/>
                            <Button onClick={checkInviteCode} radius="md"
                                    style={{width: 410, marginTop: 20, fontSize: 20}}>{t('accountPage.add')}
                            </Button>
                        </Modal>
                    </Modal>
                    <Modal closeOnClickOutside={false}
                           closeOnEscape={false} opened={changeAccountModalState}
                           onClose={() => setChangeAccountModalState(false)} radius="md"
                           overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                           title={t('accountPage.changeBankAccount')}>
                        <h1>{t('accountPage.selectBankAcc')}</h1>
                        <NativeSelect radius="md"
                                      onChange={(e) => handleFieldChange("selectBankAccount", e.target.value)}
                                      data={data.bankAccounts}></NativeSelect>
                        <Button onClick={changeBankAccount} radius="md"
                                style={{width: 410, marginTop: 20, fontSize: 20}}>{t('accountPage.change')}</Button>
                    </Modal>
                    <Modal closeOnClickOutside={false}
                           closeOnEscape={false} radius="md"
                           title={t('accountPage.titleInviteCode') + data.changeBankName}
                           opened={codeModalState} onClose={() => setCodeModalState(false)}
                           overlayProps={{backgroundOpacity: 0, blur: 4}}>
                        <Text style={{textAlign: "center"}}>{data.inviteCode}
                            <CopyButton value={data.inviteCode ?? ""} timeout={2000}>
                                {({copied, copy}) => (
                                    <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                                        <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle"
                                                    onClick={copy}>
                                            {copied ? (
                                                <IconCheck style={{width: 16}}/>
                                            ) : (
                                                <IconCopy style={{width: 16}}/>
                                            )}
                                        </ActionIcon>
                                    </Tooltip>
                                )}
                            </CopyButton></Text>
                    </Modal><br/>
                </AppShell.Main>
            </AppShell>
            <Footer/>
        </div>
    )
}

export const getServerSideProps = async (ctx: any) => {
    const session = await getSession(ctx);
    const {db} = await connectToDatabase();

    const user = (await db.collection('users').findOne({email: session?.user?.email})) as IUser;
    let bankAccounts;
    let bankAcc;

    if (user) {
        const {NEXTAUTH_URL} = process.env;
        const response = await fetch(`${NEXTAUTH_URL}/api/userBankAccounts/${user._id}`);
        if (!response.ok) throw new Error(response.statusText);
        bankAccounts = (await response.json()).result as { label: string, value: string }[];
        bankAcc = (await db.collection('bankAccounts').findOne({_id: user.currentBankAccount})) as IBankAccount;
    }


    return {
        redirect: await authRedirect(ctx, '/'),
        props: {
            user: user, bankAccount: bankAcc,
            bankAccounts: bankAccounts,
            ...(await serverSideTranslations(ctx.locale, ['common']))
        }
    }
};

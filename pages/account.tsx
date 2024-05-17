import '../styles/pages.module.css'
import IUser from "@/src/types/IUser";
import React, {useState} from "react";
import {AppShell, Avatar} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
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
import {useRouter} from "next/router";
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
    const [segmentState, setSegmentState] = useState('+');
    const [codeModalState, setCodeModalState] = useState(false);
    const [data, setData] = useState({
        name: "Счёт",
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

    const [opened, {toggle}] = useDisclosure();

    function handleFieldChange(fieldName: string, value: any) {
        setData(prevData => ({
            ...prevData,
            [fieldName]: value,
        }));
    }

    const router = useRouter();

    async function dateValidation(e: any) {
        e.preventDefault();
        if (!data.balance || !(/^[\d]+$/).test(data.balance.toString())) {
            notifications.show({
                title: 'Уведомление',
                message: 'Сумма введена не верно, попробуйте ещё раз.',
            })
            return
        }
        if (!data.name) {
            notifications.show({
                title: 'Уведомление',
                message: 'Укажите название счёта',
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
                title: 'Уведомление',
                message: 'Вы не можете подключиться к своему счёту',
            })
            return;
        }
        if (allUser) {
            notifications.show({
                title: 'Уведомление',
                message: 'У данного счёта уже есть второй пользователь',
            })
            return;
        }
        if (!inviteToBankAccount) {
            notifications.show({
                title: 'Уведомление',
                message: 'Код введён не верно, попробуйте ещё раз',
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
            title: 'Уведомление',
            message: 'всё оки, работаем дальше',
        })
        setBillModalState(false)
    }

    async function changeBankAccount() {
        if (!data.selectBankAccount) {
            notifications.show({
                title: 'Уведомление',
                message: 'Выберите счёт',
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
            title: 'Уведомление',
            message: 'Аккаунт успешно сменён',
        })
        setChangeAccountModalState(false)
    }

    async function updateData() {
        if (!data.changeFio || !data.changeEmail || !data.changeBankName) {
            notifications.show({
                title: 'Уведомление',
                message: 'Данные указаны не верно',
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
            title: 'Уведомление',
            message: 'Данные успешно обновлены',
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
            title: 'Уведомление',
            message: 'Категории успешно обновлены',
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
            title: 'Уведомление',
            message: 'Категории успешно обновлены',
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
                    collapsed: {mobile: !opened},
                }}
                padding="md"
            >
                <AppShell.Navbar className={styles.navbar} p="md">
                    <div><h1 className={styles.blueText}>Account</h1><br/>
                        <Button style={{marginTop: 5}} onClick={() => setChangeModalState(!changeModalState)}
                                fullWidth={true} variant="light">Изменить данные</Button>
                        <Button style={{marginTop: 5}}
                                onClick={() => setAddIncomeCategoryModalState(!addIncomeCategoryModalState)}
                                fullWidth={true} variant="light">Редактирование категорий</Button>
                        <Button style={{marginTop: 5}} onClick={() => setBillModalState(!billModalState)}
                                fullWidth={true} variant="light">Добавить счёт</Button>
                        <Button style={{marginTop: 5}}
                                onClick={() => setChangeAccountModalState(!changeAccountModalState)} fullWidth={true}
                                variant="light">Сменить счёт</Button>
                        <Button style={{marginTop: 5}} onClick={() => setCodeModalState(!codeModalState)}
                                fullWidth={true} variant="light">Пригласительный код</Button>
                        </div>
                </AppShell.Navbar>
                <AppShell.Main>
                    <Fieldset radius="xl" className={styles.account}>
                        <Avatar variant="light" radius="150" size="150" color="blue" src="" className={styles.icon}/>
                        <Group><h1 className={styles.blueAccountText}>ФИО: </h1><h1 className={styles.accountText}>{data.fio}</h1></Group>
                        <Group><h1 className={styles.blueAccountText}>Электронная почта: </h1><h1 className={styles.accountText}>{data.email}</h1></Group>
                        <Group><h1 className={styles.blueAccountText}>Название счёта: </h1><h1 className={styles.accountText}>{data.bankName}</h1></Group>
                    </Fieldset>
                    <Modal opened={changeModalState} onClose={() => setChangeModalState(false)}
                           overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                           title={'Редактирование данных'}>
                        <TextInput
                            label="ФИО:"
                            onChange={(e) => handleFieldChange("changeFio", e.target.value)}
                            title="Введите ФИО"
                            value={data.changeFio}
                        />
                        <TextInput
                            label="Электронная почта:"
                            onChange={(e) => handleFieldChange("changeEmail", e.target.value)}
                            title="Введите Электронную почту"
                            value={data.changeEmail}
                        />
                        <TextInput
                            label="Название счёта:"
                            onChange={(e) => handleFieldChange("changeBankName", e.target.value)}
                            title="Введите Электронную почту"
                            value={data.changeBankName}
                        />
                        <NativeSelect onChange={(e) => handleFieldChange("changeCurrency", e.target.value)}
                                      title="Укажите валюту. Пример: BYN" label="Валюта:" data={data.allCurrency}
                                      defaultValue={props.bankAccount.currency}></NativeSelect><br/>
                        <Switch label="Двухфакторная аутентификация" size="md" onLabel="ON" offLabel="OFF"
                                checked={checked2FA}
                                onChange={(event) => setChecked2FA(event.currentTarget.checked)}/>
                        <Button onClick={updateData}
                                style={{width: 410, marginTop: 20, fontSize: 20}}>Сохранить
                        </Button>
                    </Modal>
                    <Modal opened={addIncomeCategoryModalState} onClose={() => {
                        setAddIncomeCategoryModalState(false)
                        setSegmentState('+')
                    }}
                           overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                           title={'Добавление категорий доходов'}>
                        <SegmentedControl fullWidth value={segmentState} data={['+', '-']} radius='xl'
                                          onChange={(e) => {
                                              setSegmentState(e);
                                              if (e === '+') {
                                                  incomeCategories()
                                              } else if (e === '-') {
                                                  expensesCategories()
                                              }
                                          }}/>
                        <InputBase component="div" multiline label={'Стандартные категории доходов'}>
                            <Pill.Group>{defaultIncomeCategories.map(e => (
                                <Pill key={e} withRemoveButton disabled>
                                    {t(e)}
                                </Pill>
                            ))}</Pill.Group>
                        </InputBase>
                        <TagsInput
                            label="Личные категории доходов"
                            placeholder="Введите личные категории доходов"
                            value={newIncomeCategories}
                            onChange={(e) => setNewIncomeCategories(e)}
                        />
                        <Button onClick={updateIncomeCategories}
                                style={{width: 410, marginTop: 20, fontSize: 20}}>Save</Button>
                    </Modal>
                    <Modal overlayProps={{backgroundOpacity: 0.5, blur: 4}} title="Добавление категорий расходов"
                           opened={addExpensesCategoryModalState}
                           onClose={() => {
                               setAddExpensesCategoryModalState(false)
                               setSegmentState('+')
                           }}>
                        <SegmentedControl fullWidth value={segmentState} data={['+', '-']} radius='xl'
                                          onChange={(e) => {
                                              setSegmentState(e);
                                              if (e === '+') {
                                                  incomeCategories()
                                              } else if (e === '-') {
                                                  expensesCategories()
                                              }
                                          }}/>
                        <InputBase component="div" multiline label={'Стандартные категории расходов'}>
                            <Pill.Group>{defaultExpensesCategories.map(e => (
                                <Pill key={e} withRemoveButton disabled>
                                    {t(e)}
                                </Pill>
                            ))}</Pill.Group>
                        </InputBase>
                        <TagsInput
                            label="Личные категории расходов"
                            placeholder="Введите личные категории расходов"
                            value={newExpensesCategories}
                            onChange={(e) => setNewExpensesCategories(e)}
                        />
                        <Button onClick={updateExpensesCategories}
                                style={{width: 410, marginTop: 20, fontSize: 20}}>Save</Button>
                    </Modal>
                    <Modal
                        overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                        opened={billModalState} onClose={() => setBillModalState(false)} title={'Добавление счёта'}>
                        <TextInput
                            label="Введите название счёта"
                            placeholder="Счёт"
                            onChange={(e) => handleFieldChange("name", e.target.value)}
                            title="Пример: Счёт №1"
                        />
                        <Group>
                            <TextInput
                                label="Введите начальную сумму и укажите валюту"
                                placeholder="1000"
                                style={{paddingRight: 0, width: 312}}
                                onChange={(e) => handleFieldChange("balance", e.target.value)}
                                title="Пример: 1000 BYN"
                            />
                            <NativeSelect
                                onChange={(e) => handleFieldChange("currency", e.target.value)}
                                title="Укажите валюту. Пример: BYN"
                                style={{paddingTop: 25, marginLeft: 0, width: 80}}
                                defaultValue={props.bankAccount.currency}
                                data={data.allCurrency}>
                            </NativeSelect></Group>
                        <Button onClick={dateValidation}
                                style={{width: 410, marginTop: 20, fontSize: 20}}>Добавить
                        </Button>

                        <Button variant="transparent" style={{textAlign: "center"}} fullWidth={true}
                                onClick={() => setInviteCodeModalState(!inviteCodeModalState)}>У меня есть
                            пригласительный код
                        </Button>
                        <Modal opened={inviteCodeModalState} onClose={() => setInviteCodeModalState(false)}
                               overlayProps={{backgroundOpacity: 0, blur: 4}}
                               title={'Подключение к банковскому счёту'}>
                            <TextInput
                                label="Введите пригласительный код"
                                onChange={(e) => handleFieldChange("inviteCode", e.target.value)}
                                title="Введите 16-значный код"/>
                            <Button onClick={checkInviteCode}
                                    style={{width: 410, marginTop: 20, fontSize: 20}}>Добавить
                            </Button>
                        </Modal>
                    </Modal>
                    <Modal opened={changeAccountModalState} onClose={() => setChangeAccountModalState(false)}
                           overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                           title={'Смена счёта'}>
                        <h1>Выберите счёт:</h1>
                        <NativeSelect onChange={(e) => handleFieldChange("selectBankAccount", e.target.value)}
                                      data={data.bankAccounts}></NativeSelect>
                        <Button onClick={changeBankAccount}
                                style={{width: 410, marginTop: 20, fontSize: 20}}>Перейти</Button>
                    </Modal>
                    <Modal title={"Пригласительный код для счёта: " + data.changeBankName}
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

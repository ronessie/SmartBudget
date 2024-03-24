import styles from '../styles/pages.module.css'
import IUser from "@/src/types/IUser";
import {ObjectId} from "bson";
import {getSession, useSession} from "next-auth/react";
import React, {useState} from 'react';
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import IOperation from "@/src/types/IOperation";
import validator from "validator";
import {connectToDatabase} from "@/src/database";
import IBankAccount from "@/src/types/IBankAccount";
import {Button, Drawer, Modal, NativeSelect, TextInput} from "@mantine/core";
import {DateInput} from '@mantine/dates';
import {DonutChart} from "@mantine/charts";
import {useTranslation} from "next-i18next";
import Header from "../components/header"
import {useDisclosure} from "@mantine/hooks";

export default function Page(props: { user: IUser, bankAccount: IBankAccount }) {
    const [incomeModalState, setIncomeModalState] = useState(false);
    const [expensesModalState, setExpensesModalState] = useState(false);
    const [data, setData] = useState({
        sum: 0.0,
        currency: props.bankAccount.currency,
        category: "",
        date: new Date(),
        status: "",
        balance: props.bankAccount.balance,
        lastUpdateDate: props.bankAccount.lastUpdateDate,
        operationStatus: "",
        newBalance: 0
    });
    const {t} = useTranslation('common');
    const [converterDrawerState, converterAuthMethods] = useDisclosure(false);

    const dataChart = [
        {name: 'USA', value: 400, color: 'blue.6'},
        {name: 'India', value: 300, color: 'yellow.6'},
        {name: 'Japan', value: 100, color: 'pink.6'},
        {name: 'Other', value: 200, color: 'red.6'},
    ];


    function handleFieldChange(fieldName: string, value: any) {
        console.log(`set ${fieldName} with value: ${value}`)
        setData({
            ...data,
            [fieldName]: value,
        });
        console.log(data)
    }

    async function addIncome(e: any) {
        e.preventDefault()
        data.operationStatus = "+";
        if (!data.category) data.category = "salary";
        await dateValidation();
    }

    async function addExpenses(e: any) {
        e.preventDefault()
        data.operationStatus = "-";
        if (!data.category) data.category = "products";
        await dateValidation()
    }

    async function dataToDB() {
        const operation: IOperation = {
            _id: new ObjectId().toString(),
            user_id: props.user._id,
            bankAccount_id: props.bankAccount._id,
            sum: data.sum,
            currency: data.currency,
            date: data.date,
            category: data.category,
            operationsStatus: data.operationStatus
        };

        const response = await fetch(`/api/addOperation/${JSON.stringify(operation)}`);

        if (!response.ok) throw new Error(response.statusText);
        await updateBalance()
    }

    async function updateBalance() {
        const responseUpdate = await fetch('/api/updateBalance', {
            method: 'POST',
            body: JSON.stringify({
                currentBankAccount_id: props.bankAccount._id,
                sum: data.sum,
                operationStatus: data.operationStatus,
                balance: props.bankAccount.balance
            }),
        });
        if (!responseUpdate.ok) throw new Error(responseUpdate.statusText);
        handleFieldChange("updateLastUpdateDate", data?.lastUpdateDate)
        if (data.operationStatus === '+') {
            handleFieldChange("balance", +(data?.balance ?? 0) + +data.sum)
        } else {
            handleFieldChange("balance", +(data?.balance ?? 0) - +data.sum)
        }
        setIncomeModalState(false)
        setExpensesModalState(false);
        alert("Операция проведена успешно")
    }

    async function dateValidation() {
        const response = await fetch(`/api/addOperation/operations`);
        if (!response.ok) throw new Error(response.statusText);
        console.log('data: ', data);
        if (!data.sum || !(/^[\d]+$/).test(data.sum.toString())) {
            alert("Сумма введена не верно, попробуйте ещё раз.")
            return
        }
        if ((!data.date || !validator.isDate(data.date.toString())) && data.date > new Date()) {
            alert("Дата введена не верно")
            return
        } else {
            await dataToDB();
        }
    }

    const {data: session} = useSession();
    console.log(session);

    return (
        <div className={styles.page}>
            <Header/>
            <div style={{paddingTop: 70}}>
                <div className={styles.pages}>
                    <div className={styles.conteiners}>
                        <h1 className={styles.bigBlackText}>{t('mainPage.hello')}, {props.user.fio}</h1>
                        <Button onClick={converterAuthMethods.open}>Open drawer Auth</Button>
                    </div>
                    <Drawer
                        title="Конвертер валют"
                        opened={converterDrawerState}
                        onClose={converterAuthMethods.close}
                        overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                        position="right"
                        offset={8} radius="md">
                        <div className={styles.conteiners}><TextInput style={{width: 270}} label="Укажите сумму"/>
                            <NativeSelect style={{width: 120, paddingTop: 25}}/></div>
                        <div className={styles.conteiners}><TextInput style={{width: 270}} label="Итоговая сумма"/>
                            <NativeSelect style={{width: 120, paddingTop: 25}}/></div><br/>
                        <Button style={{width: 410}}>Рассчитать</Button>
                    </Drawer>
                    <h1 className={styles.text}>{t('mainPage.yourBankAccount')}</h1>
                    <div className={styles.rectangle}><br/>
                        <h1 className={styles.whiteText}>{props.bankAccount.name}</h1><br/>
                        <h1 className={styles.bigWhiteText}>{data.balance} {props.bankAccount.currency}</h1>
                        <br/>
                        <h1 className={styles.whiteText}>{t('mainPage.lastUpdate')} {data.lastUpdateDate}</h1>
                    </div>
                    <div>
                        <Button className={styles.incomeButton}
                                onClick={() => setIncomeModalState(!incomeModalState)}>{t('mainPage.addIncome')}
                        </Button>
                        <Modal opened={incomeModalState} onClose={() => setIncomeModalState(false)}
                               title={t('mainPage.incomeModal.title')}>
                            <TextInput
                                label={t('mainPage.incomeModal.inputSum')}
                                placeholder="100"
                                onChange={(e) => handleFieldChange("sum", e.target.value)}
                                title={t('mainPage.incomeModal.sumTitle')}
                            />
                            <br/>
                            <NativeSelect label={t('mainPage.incomeModal.selector.label')}
                                          onChange={(e) => handleFieldChange("category", e.target.value)}
                                          title={t('mainPage.incomeModal.selector.title')} data={[
                                {value: 'salary', label: t('mainPage.incomeModal.selector.value.salary')},
                                {value: 'gift', label: t('mainPage.incomeModal.selector.value.gift')},
                                {value: 'premium', label: t('mainPage.incomeModal.selector.value.premium')},
                                {value: 'debt refund', label: t('mainPage.incomeModal.selector.value.debtRefund')},
                                {value: 'cachek', label: t('mainPage.incomeModal.selector.value.cachek')},
                                {value: 'other', label: t('mainPage.expensesModal.selector.value.other')},
                            ]}>
                            </NativeSelect><br/>
                            <DateInput onChange={(e) => handleFieldChange("date", e)}
                                       label={t('mainPage.incomeModal.dateLabel')}
                                       placeholder={t('mainPage.incomeModal.datePlaceholder')}></DateInput>
                            <Button className={styles.button} onClick={addIncome}
                                    style={{
                                        width: 408,
                                        marginTop: 20,
                                        fontSize: 20
                                    }}>{t('mainPage.incomeModal.addButton')}</Button>
                        </Modal>
                        <button className={styles.expenseButton}
                                onClick={() => setExpensesModalState(!expensesModalState)}>{t('mainPage.addExpenses')}
                        </button>
                        <Modal opened={expensesModalState} onClose={() => setExpensesModalState(false)}
                               title={t('mainPage.expensesModal.title')}>
                            <TextInput
                                label={t('mainPage.expensesModal.inputSum')}
                                placeholder="100"
                                onChange={(e) => handleFieldChange("sum", e.target.value)}
                                title={t('mainPage.expensesModal.sumTitle')}
                            />
                            <br/>
                            <NativeSelect label={t('mainPage.expensesModal.selector.label')}
                                          onChange={(e) => handleFieldChange("category", e.target.value)}
                                          title={t('mainPage.expensesModal.selector.title')}
                                          data={[
                                              {
                                                  value: 'products',
                                                  label: t('mainPage.expensesModal.selector.value.products')
                                              },
                                              {
                                                  value: 'clothes',
                                                  label: t('mainPage.expensesModal.selector.value.clothes')
                                              },
                                              {value: 'house', label: t('mainPage.expensesModal.selector.value.house')},
                                              {value: 'car', label: t('mainPage.expensesModal.selector.value.car')},
                                              {
                                                  value: 'entertainment',
                                                  label: t('mainPage.expensesModal.selector.value.entertainment')
                                              },
                                              {value: 'duty', label: t('mainPage.expensesModal.selector.value.duty')},
                                              {value: 'other', label: t('mainPage.expensesModal.selector.value.other')},
                                          ]}>
                            </NativeSelect><br/>
                            <DateInput
                                onChange={(e) => handleFieldChange("date", e)}
                                label={t('mainPage.expensesModal.dateLabel')}
                                placeholder={t('mainPage.expensesModal.datePlaceholder')}></DateInput>
                            <Button className={styles.button} onClick={addExpenses}
                                    style={{
                                        width: 408,
                                        marginTop: 20,
                                        fontSize: 20
                                    }}>{t('mainPage.expensesModal.addButton')}
                            </Button>
                        </Modal>
                    </div>
                    <br/>
                    <div>
                        <DonutChart data={dataChart} title="Расходы"/>
                        <DonutChart data={dataChart} title="Доходы"/>
                    </div>

                </div>
            </div>
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

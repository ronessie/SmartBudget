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
import {currency} from "@/src/utils";

export default function Page(props: { user: IUser, bankAccount: IBankAccount }) {
    const [incomeModalState, setIncomeModalState] = useState(false);
    const [expensesModalState, setExpensesModalState] = useState(false);
    const [categoryModalState, setCategoryModalState] = useState(false);
    const [data, setData] = useState({
        sum: 0.0,
        currency: props.bankAccount.currency,
        category: "",
        date: new Date(),
        status: "",
        balance: props.bankAccount.balance,
        lastUpdateDate: formatTime(props.bankAccount.lastUpdateDate?.toString()),
        operationStatus: "",
        newBalance: 0,
        newCategory: ""
    });
    const [convertData, setConvertData] = useState({
        sum: 1,
        beforeCurrency: currency(),
        afterCurrency: currency(),
        newSum: 0
    });
    const {t} = useTranslation('common');
    const [converterDrawerState, converterAuthMethods] = useDisclosure(false);

    const dataChart1 = [
        {name: 'USA', value: 400, color: 'blue.6'},
        {name: 'India', value: 300, color: 'yellow.6'},
        {name: 'Japan', value: 100, color: 'pink.6'},
        {name: 'Other', value: 200, color: 'red.6'},
    ];
    const dataChart2 = [
        {name: 'USA', value: 250, color: 'green.6'},
        {name: 'India', value: 190, color: 'blue.6'},
        {name: 'Japan', value: 160, color: 'red.6'},
        {name: 'Other', value: 400, color: 'orange.6'},
    ];

    function formatTime(input: string | Date | undefined): string {
        if (!input) {
            return '';
        }

        let date: Date;
        if (input instanceof Date) {
            date = input;
        } else {
            date = new Date(input);
        }

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${hours}:${minutes} ${day}/${month}/${year}`;
    }


    function handleFieldChange(fieldName: string, value: any) {
        console.log(`set ${fieldName} with value: ${value}`)
        setData({
            ...data,
            [fieldName]: value,
        });
        console.log(data)
    }

    function handleConvertChange(fieldName: string, value: any) {
        console.log(`set ${fieldName} with value: ${value}`)
        setConvertData({
            ...convertData,
            [fieldName]: value,
        });
        console.log(convertData)
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
        }
        if (data.category === "other") {
            setCategoryModalState(true);
        } else {
            await dataToDB();
        }
    }

    async function convert() {
        // api/converter/index.ts
        const myHeaders = new Headers();
        myHeaders.append("apikey", "hE44IsmHdazgHUSbLcj34Sl2cGPVsduz");

        const response = await fetch('/api/converter', {
            method: 'GET',
            redirect: 'follow',
            headers: myHeaders,
            body: JSON.stringify({
                sum: convertData.sum,
                afterCurrency: convertData.afterCurrency,
                beforeCurrency: convertData.beforeCurrency
            }),
        });

        if (response.ok) {
            console.log('converter api worked successfully!');
        } else {
            console.error('Failed work converter.');
        }
    }

    const {data: session} = useSession();
    console.log(session);

    return (
        <div className={styles.page}>
            <Header/>
            <div className={styles.pageContent}>
                <div>
                    <div>
                        <h1>{t('mainPage.hello')}, {props.user.fio}</h1>
                        <Button onClick={converterAuthMethods.open}>Конвертер</Button>
                    </div>
                    <Drawer
                        title="Конвертер валют"
                        opened={converterDrawerState}
                        onClose={converterAuthMethods.close}
                        overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                        position="right"
                        offset={8} radius="md">
                        <div>
                            <TextInput style={{width: 270}} label="Укажите сумму"
                                       onChange={(e) => handleConvertChange("sum", e.target.value)}/>
                            <NativeSelect style={{width: 120, paddingTop: 25}} data={convertData.beforeCurrency}
                                          onChange={(e) => handleConvertChange("beforeCurrency", e.target.value)}/>
                        </div>
                        <div>
                            <TextInput style={{width: 270}} label="Итоговая сумма"
                                       onChange={(e) => handleConvertChange("newSum", e.target.value)}/>
                            <NativeSelect style={{width: 120, paddingTop: 25}} data={convertData.afterCurrency}
                                          onChange={(e) => handleConvertChange("afterCurrency", e.target.value)}/></div>
                        <br/>
                        <Button style={{width: 410}} onClick={convert}>Рассчитать</Button>
                    </Drawer>
                    <h1>{t('mainPage.yourBankAccount')}</h1>
                    <div><br/>
                        <h1>{props.bankAccount.name}</h1><br/>
                        <h1>{data.balance} {props.bankAccount.currency}</h1>
                        <br/>
                        <h1>{t('mainPage.lastUpdate')} {data.lastUpdateDate}</h1>
                    </div>
                    <div>
                        <Button variant="light" color="green"
                                onClick={() => setIncomeModalState(!incomeModalState)}>{t('mainPage.addIncome')}
                        </Button>
                        <Modal opened={incomeModalState} onClose={() => setIncomeModalState(false)}
                               overlayProps={{backgroundOpacity: 0.5, blur: 4}}
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
                            <Button onClick={addIncome}
                                    style={{
                                        width: 408,
                                        marginTop: 20,
                                        fontSize: 20
                                    }}>{t('mainPage.incomeModal.addButton')}</Button>
                        </Modal>
                        <Button variant="light" color="red"
                                onClick={() => setExpensesModalState(!expensesModalState)}>{t('mainPage.addExpenses')}
                        </Button>
                        <Modal opened={expensesModalState} onClose={() => setExpensesModalState(false)}
                               overlayProps={{backgroundOpacity: 0.5, blur: 4}}
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
                            <Button onClick={addExpenses}
                                    style={{
                                        width: 408,
                                        marginTop: 20,
                                        fontSize: 20
                                    }}>{t('mainPage.expensesModal.addButton')}
                            </Button>
                        </Modal>
                        <Modal opened={categoryModalState} onClose={() => setCategoryModalState(false)}
                               title="Добавление новой категории" overlayProps={{backgroundOpacity: 0, blur: 4}}>
                            <TextInput label="Введите название категории"
                                       onChange={(e) => handleFieldChange("newCategory", e.target.value)}/>
                            <Button style={{
                                width: 408,
                                marginTop: 20,
                                fontSize: 20
                            }}>Добавить</Button>
                        </Modal>
                    </div>
                    <br/>
                    <div>
                        <DonutChart data={dataChart1} title="Расходы"/>
                        <DonutChart data={dataChart2} title="Доходы"/>
                        <DonutChart data={dataChart1} title="Расходы"/>
                        <DonutChart data={dataChart2} title="Доходы"/>
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

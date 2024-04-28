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
import {Button, Drawer, Group, Modal, NativeSelect, Paper, TextInput} from "@mantine/core";
import {DateInput} from '@mantine/dates';
import {DonutChart} from "@mantine/charts";
import {useTranslation} from "next-i18next";
import Header from "../components/header"
import Footer from "../components/footer"
import {useDisclosure} from "@mantine/hooks";
import {currency, ucFirst} from "@/src/utils";
import {notifications} from "@mantine/notifications";

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
        newCategory: "",
        incomeCategory: Object.entries(props.bankAccount?.incomeCategories ?? [])
            .map(([value, label]) => ({ value, label: ucFirst(label) })),
        expensesCategory: Object.entries(props.bankAccount?.expensesCategories ?? [])
            .map(([value, label]) => ({ value, label: ucFirst(label) }))
    });
    const [convertData, setConvertData] = useState({
        sum: 1,
        currency: currency(),
        beforeCurrency: "AED",
        afterCurrency: "AED",
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
        setData(prevData => ({
            ...prevData,
            [fieldName]: value,
        }));
    }

    function handleConvertChange(fieldName: string, value: any) {
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
                balance: data.balance
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
        handleFieldChange("category", "")
        notifications.show({
            title: 'Уведомление',
            message: 'Операция проведена успешно',
        })
    }

    async function dateValidation() {
        const response = await fetch(`/api/addOperation/operations`);
        if (!response.ok) throw new Error(response.statusText);
        console.log('data: ', data);
        if (!data.sum || !(/^[\d]+$/).test(data.sum.toString())) {
            notifications.show({
                title: 'Уведомление',
                message: 'Сумма введена не верно, попробуйте ещё раз.',
            })
            return
        }
        if ((!data.date || !validator.isDate(data.date.toString())) && data.date > new Date()) {
            notifications.show({
                title: 'Уведомление',
                message: 'Дата введена не верно',
            })
            return
        }
        if (data.category === "other") {
            setCategoryModalState(true);
        } else {
            await dataToDB();
        }
    }

    async function convert() {

        if (!convertData.sum || !(/^[\d]+$/).test(convertData.sum.toString()))
        {
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
                        {/*<Group>*/}
                        {/*<Button>Мои доходы</Button>*/}
                        {/*<Button>Мои расходы</Button>*/}
                        {/*</Group>*/}
                    </div>
                    <Drawer
                        title="Конвертер валют"
                        opened={converterDrawerState}
                        onClose={converterAuthMethods.close}
                        overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                        position="right"
                        offset={8} radius="md">
                        <Group>
                            <TextInput style={{width: 307}} label="Укажите сумму"
                                       onChange={(e) => handleConvertChange("sum", e.target.value)}/>
                            <NativeSelect style={{width: 85, paddingTop: 25}} data={convertData.currency}
                                          onChange={(e) => handleConvertChange("beforeCurrency", e.target.value)}
                                          defaultValue={props.bankAccount.currency}/>
                        </Group>
                        <Group>
                            <TextInput readOnly={true} style={{width: 307}} label="Итоговая сумма"
                                       value={convertData.newSum}/>
                            <NativeSelect style={{width: 85, paddingTop: 25}} data={convertData.currency}
                                          onChange={(e) => handleConvertChange("afterCurrency", e.target.value)}/></Group>
                        <br/>
                        <Button style={{width: 410}} onClick={convert}>Рассчитать</Button>
                    </Drawer>
                    <h1>{t('mainPage.yourBankAccount')}</h1>
                    <Paper shadow="md" radius="md" p="xl"
                           style={{backgroundColor: "lightgrey", width: 400, height: 190}}>
                        <div>
                            <h1>{props.bankAccount.name}</h1><br/>
                            <h1>{data.balance} {props.bankAccount.currency}</h1>
                            <br/>
                            <h1>{t('mainPage.lastUpdate')} {data.lastUpdateDate}</h1>
                        </div>
                    </Paper><br/>
                    <div>
                        <Button variant="light" color="green"
                                onClick={() => setIncomeModalState(!incomeModalState)}>{t('mainPage.addIncome')}
                        </Button>
                        <Modal opened={incomeModalState} onClose={() => setIncomeModalState(false)}
                               overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                               title={t('mainPage.incomeModal.title')}>
                            <TextInput
                                label={t('mainPage.incomeModal.inputSum')+`, ${props.bankAccount.currency}`}
                                placeholder="100"
                                onChange={(e) => handleFieldChange("sum", e.target.value)}
                                title={t('mainPage.incomeModal.sumTitle')}
                            />
                            <br/>
                            <NativeSelect label={t('mainPage.incomeModal.selector.label')}
                                          onChange={(e) => handleFieldChange("category", e.target.value)}
                                          title={t('mainPage.incomeModal.selector.title')} data={data.incomeCategory}>
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
                                label={t('mainPage.expensesModal.inputSum')+`, ${props.bankAccount.currency}`}
                                placeholder="100"
                                onChange={(e) => handleFieldChange("sum", e.target.value)}
                                title={t('mainPage.expensesModal.sumTitle')}
                            />
                            <br/>
                            <NativeSelect label={t('mainPage.expensesModal.selector.label')}
                                          onChange={(e) => handleFieldChange("category", e.target.value)}
                                          title={t('mainPage.expensesModal.selector.title')}
                                          data={data.expensesCategory}>
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
            <Footer/>
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

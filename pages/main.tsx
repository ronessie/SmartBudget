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
import {Button, Drawer, Group, Modal, NativeSelect, Paper, SegmentedControl, Table, TextInput} from "@mantine/core";
import {DateInput, DatePickerInput} from '@mantine/dates';
import {DonutChart} from "@mantine/charts";
import {useTranslation} from "next-i18next";
import Header from "../components/header"
import {useDisclosure} from "@mantine/hooks";
import {currency, defaultExpensesCategories, defaultIncomeCategories, ucFirst} from "@/src/utils";
import {notifications} from "@mantine/notifications";
import Footer from "@/components/footer";
import {authRedirect} from "@/src/server/authRedirect";

export default function Page(props: {
    user: IUser,
    bankAccount: IBankAccount,
    income: { category: string, sum: number, currency: string, date: string }[],
    expenses: { category: string, sum: number, currency: string, date: string }[]
}) {
    const {t} = useTranslation('common');
    const [incomeModalState, setIncomeModalState] = useState(false);
    const [expensesModalState, setExpensesModalState] = useState(false);
    const [categoriesIncomeModalState, setCategoriesIncomeModalState] = useState(false);
    const [categoriesExpensesModalState, setCategoriesExpensesModalState] = useState(false);
    const [dateIncomeModalState, setDateIncomeModalState] = useState(false);
    const [dateExpensesModalState, setDateExpensesModalState] = useState(false);
    const [segmentCategoriesState, setSegmentCategoriesState] = useState('Доходы');
    const [segmentDateState, setSegmentDateState] = useState('Доходы');
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
        incomeCategory: (defaultIncomeCategories.concat(props.bankAccount?.incomeCategories ?? [])).map((e) => ({
            value: e,
            label: t(e)
        })),
        expensesCategory: (defaultExpensesCategories.concat(props.bankAccount?.expensesCategories ?? []).map((e) => ({
            value: e,
            label: t(e)
        }))),
        allIncome: (props.income ?? [])
            .map(({category, sum, currency, date}) => ({category: ucFirst(t(category)), sum, currency, date})),
        allExpenses: (props.expenses ?? [])
            .map(({category, sum, currency, date}) => ({category: ucFirst(t(category)), sum, currency, date})),
    });
    const [value, setValue] = useState<[Date | null, Date | null]>([null, null]);

    const [convertData, setConvertData] = useState({
        sum: 1,
        currency: currency(),
        beforeCurrency: "AED",
        afterCurrency: "AED",
        newSum: 0
    });

    const [categoryData, setCategoryData] = useState({
        selectedCategory: ""
    });
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

    function handleCategoriesChange(fieldName: string, value: any) {
        setCategoryData({
            ...categoryData,
            [fieldName]: value,
        });
        console.log(categoryData)
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

        if (operation.operationsStatus === '+') {
            const newIncomes = [...data.allIncome];
            newIncomes.push({ category: ucFirst(t(operation.category ?? '')), sum: operation.sum ?? 0, currency: operation.currency ?? '', date: operation.date?.toString() ?? '' });

            handleFieldChange('allIncome', newIncomes)
        }
        else if (operation.operationsStatus === '-') {
            const newExpenses = [...data.allExpenses];
            newExpenses.push({ category: ucFirst(t(operation.category ?? '')), sum: operation.sum ?? 0, currency: operation.currency ?? '', date: operation.date?.toString() ?? '' });
            handleFieldChange('allExpenses', newExpenses)
        }

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
        } else {
            await dataToDB()
        }
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

    function getIncomeTableRows() {
        const rows = data.allIncome.map(({category, sum, date, currency}) => {

            const dateTime = new Date(date);
            const day = String(dateTime.getDate()).padStart(2, '0');
            const month = String(dateTime.getMonth() + 1).padStart(2, '0');
            const year = dateTime.getFullYear();

            return (<Table.Tr key={`${category}-${sum}-${date}-${currency}`}>
                <Table.Td>{category}</Table.Td>
                <Table.Td>{sum}</Table.Td>
                <Table.Td>{currency}</Table.Td>
                <Table.Td>{`${day}/${month}/${year}`}</Table.Td>
            </Table.Tr>)
        });

        return rows
    }

    function getExpensesTableRows() {
        const rows = data.allExpenses.map(({category, sum, date, currency}) => {

            const dateTime = new Date(date);
            const day = String(dateTime.getDate()).padStart(2, '0');
            const month = String(dateTime.getMonth() + 1).padStart(2, '0');
            const year = dateTime.getFullYear();

            return (<Table.Tr key={`${category}-${sum}-${date}-${currency}`}>
                <Table.Td>{category}</Table.Td>
                <Table.Td>{sum}</Table.Td>
                <Table.Td>{currency}</Table.Td>
                <Table.Td>{`${day}/${month}/${year}`}</Table.Td>
            </Table.Tr>)
        });

        return rows
    }

    function incomeCategories() {
        setCategoriesExpensesModalState(false)
        setCategoriesIncomeModalState(true)
    }

    function incomeDate() {
        setDateExpensesModalState(false)
        setDateIncomeModalState(true)
    }

    function expensesCategories() {
        setCategoriesIncomeModalState(false)
        setCategoriesExpensesModalState(true)
    }

    function expensesDate() {
        setDateIncomeModalState(false)
        setDateExpensesModalState(true)
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
                        <Group>
                            <Button variant={"outline"} radius='xl' onClick={converterAuthMethods.open}>Конвертер</Button>
                            <Button variant={"outline"} radius='xl' onClick={() => setCategoriesIncomeModalState(true)}>Статистика
                                по категориям</Button>
                            <Button variant={"outline"} radius='xl' onClick={() => setDateIncomeModalState(true)}>Статистика
                                по датам</Button>
                        </Group>
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
                        <Button variant="light" color="green" radius='xl'
                                onClick={() => setIncomeModalState(!incomeModalState)}>{t('mainPage.addIncome')}
                        </Button>
                        <Modal opened={incomeModalState} onClose={() => setIncomeModalState(false)}
                               overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                               title={t('mainPage.incomeModal.title')}>
                            <TextInput
                                label={t('mainPage.incomeModal.inputSum') + `, ${props.bankAccount.currency}`}
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
                        <Button variant="light" color="red" radius='xl'
                                onClick={() => setExpensesModalState(!expensesModalState)}>{t('mainPage.addExpenses')}
                        </Button>
                        <Modal opened={expensesModalState} onClose={() => setExpensesModalState(false)}
                               overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                               title={t('mainPage.expensesModal.title')}>
                            <TextInput
                                label={t('mainPage.expensesModal.inputSum') + `, ${props.bankAccount.currency}`}
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
                    </div>
                    <br/>
                    <Modal opened={categoriesIncomeModalState} onClose={() => {
                        setCategoriesIncomeModalState(false)
                        setSegmentCategoriesState('Доходы');
                    }}
                           title="Статистика доходов по категориям" overlayProps={{backgroundOpacity: 0, blur: 4}}>
                        <SegmentedControl fullWidth value={segmentCategoriesState} radius='xl' data={['Доходы', 'Расходы']} onChange={(e) => {
                            setSegmentCategoriesState(e);
                            if (e === 'Доходы') {
                                incomeCategories()
                            } else if (e === 'Расходы') {
                                expensesCategories()
                            }
                        }}/>
                        <NativeSelect label={t('mainPage.incomeModal.selector.label')}
                                      onChange={(e) => handleCategoriesChange("statisticCategory", e.target.value)}
                                      title={t('mainPage.incomeModal.selector.title')} data={data.incomeCategory}>
                        </NativeSelect><br/>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Категории</Table.Th>
                                    <Table.Th>Сумма</Table.Th>
                                    <Table.Th>Валюта</Table.Th>
                                    <Table.Th>Дата</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            {<Table.Tbody>{getIncomeTableRows()}</Table.Tbody>}
                        </Table>
                    </Modal>
                    <Modal opened={categoriesExpensesModalState} onClose={() => {
                        setCategoriesExpensesModalState(false);
                        setSegmentCategoriesState('Доходы');
                    }}
                           title="Статистика расходов по категориям" overlayProps={{backgroundOpacity: 0, blur: 4}}>
                        <SegmentedControl fullWidth value={segmentCategoriesState} radius='xl' data={['Доходы', 'Расходы']} onChange={(e) => {
                            setSegmentCategoriesState(e);
                            if (e === 'Доходы') {
                                incomeCategories()
                            } else if (e === 'Расходы') {
                                expensesCategories()
                            }
                        }}/>
                        <NativeSelect label={t('mainPage.incomeModal.selector.label')}
                                      onChange={(e) => handleCategoriesChange("statisticCategory", e.target.value)}
                                      title={t('mainPage.incomeModal.selector.title')} data={data.incomeCategory}>
                        </NativeSelect><br/>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Категории</Table.Th>
                                    <Table.Th>Сумма</Table.Th>
                                    <Table.Th>Валюта</Table.Th>
                                    <Table.Th>Дата</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            {<Table.Tbody>{getExpensesTableRows()}</Table.Tbody>}
                        </Table>
                    </Modal>
                    <Modal opened={dateIncomeModalState} onClose={() => {
                        setDateIncomeModalState(false);
                        setSegmentDateState('Доходы');
                    }}
                           title="Статистика доходов по дате" overlayProps={{backgroundOpacity: 0, blur: 4}}>
                        <SegmentedControl fullWidth value={segmentDateState} data={['Доходы', 'Расходы']} radius='xl' onChange={(e) => {
                            setSegmentDateState(e);
                            if (e === 'Доходы') {
                                incomeDate()
                            } else if (e === 'Расходы') {
                                expensesDate()
                            }
                        }}/>
                        <DatePickerInput
                            type="range"
                            label="Укажите даты"
                            placeholder="Выберите промежуток времени"
                            value={value}
                            onChange={setValue}
                        />
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Категории</Table.Th>
                                    <Table.Th>Сумма</Table.Th>
                                    <Table.Th>Валюта</Table.Th>
                                    <Table.Th>Дата</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            {<Table.Tbody>{getIncomeTableRows()}</Table.Tbody>}
                        </Table>
                    </Modal>
                    <Modal opened={dateExpensesModalState} onClose={() => {
                        setDateExpensesModalState(false);
                        setSegmentDateState('Доходы');
                    }}
                           title="Статистика расходов по дате" overlayProps={{backgroundOpacity: 0, blur: 4}}>
                        <SegmentedControl fullWidth value={segmentDateState} data={['Доходы', 'Расходы']} radius='xl' onChange={(e) => {
                            setSegmentDateState(e);
                            if (e === 'Доходы') {
                                incomeDate()
                            } else if (e === 'Расходы') {
                                expensesDate()
                            }
                        }}/>
                        <DatePickerInput
                            type="range"
                            label="Укажите даты"
                            placeholder="Выберите промежуток времени"
                            value={value}
                            onChange={setValue}
                        />
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Категории</Table.Th>
                                    <Table.Th>Сумма</Table.Th>
                                    <Table.Th>Валюта</Table.Th>
                                    <Table.Th>Дата</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            {<Table.Tbody>{getExpensesTableRows()}</Table.Tbody>}
                        </Table>
                    </Modal>
                    <div>
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
    let income, expenses, bankAcc;

    if (user) {
        bankAcc = (await db.collection('bankAccounts').findOne({_id: user.currentBankAccount})) as IBankAccount;
        const {NEXTAUTH_URL} = process.env;
        const responseIncome = await fetch(`${NEXTAUTH_URL}/api/allIncome/${bankAcc._id}`);
        income = (await responseIncome.json()).result as {
            category: string,
            sum: number,
            currency: string,
            date: string
        }[];
        const responseExpenses = await fetch(`${NEXTAUTH_URL}/api/allExpenses/${bankAcc._id}`);
        if (!responseExpenses.ok) throw new Error(responseExpenses.statusText);
        if (!responseIncome.ok) throw new Error(responseIncome.statusText);

        expenses = (await responseExpenses.json()).result as {
            category: string,
            sum: number,
            currency: string,
            date: string
        }[];
    }

    return {
        redirect: await authRedirect(ctx, '/'),
        props: {
            user: user, bankAccount: bankAcc, income: income, expenses: expenses,
            ...(await serverSideTranslations(ctx.locale, ['common']))
        }
    }
};

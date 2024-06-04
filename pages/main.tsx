import styles from '../styles/pages.module.css'
import IUser from "@/src/types/IUser";
import {ObjectId} from "bson";
import {getSession, useSession} from "next-auth/react";
import React, {useEffect, useState} from 'react';
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import IOperation from "@/src/types/IOperation";
import validator from "validator";
import {connectToDatabase} from "@/src/database";
import IBankAccount from "@/src/types/IBankAccount";
import {
    AppShell,
    Button,
    Drawer,
    Group,
    Modal,
    NativeSelect,
    Paper,
    SegmentedControl,
    Table,
    Text,
    TextInput
} from "@mantine/core";
import {Calendar, DateInput, DatePickerInput} from '@mantine/dates';
import {DonutChart, DonutChartCell} from "@mantine/charts";
import {useTranslation} from "next-i18next";
import Header from "../components/header"
import {useDisclosure} from "@mantine/hooks";
import {currency, defaultExpensesCategories, defaultIncomeCategories, getRandomChartColor, ucFirst} from "@/src/utils";
import {notifications} from "@mantine/notifications";
import Footer from "@/components/footer";
import {authRedirect} from "@/src/server/authRedirect";

export default function Page(props: {
    user: IUser,
    bankAccount: IBankAccount,
    income: { category: string, sum: number, currency: string, date: string, finalSum: number }[],
    expenses: { category: string, sum: number, currency: string, date: string, finalSum: number }[]
}) {
    const {t} = useTranslation('common');
    const [incomeModalState, setIncomeModalState] = useState(false);
    const [expensesModalState, setExpensesModalState] = useState(false);
    const [categoriesIncomeModalState, setCategoriesIncomeModalState] = useState(false);
    const [categoriesExpensesModalState, setCategoriesExpensesModalState] = useState(false);
    const [dateIncomeModalState, setDateIncomeModalState] = useState(false);
    const [dateExpensesModalState, setDateExpensesModalState] = useState(false);
    const [segmentCategoriesState, setSegmentCategoriesState] = useState(t('mainPage.income'));
    const [segmentDateState, setSegmentDateState] = useState(t('mainPage.income'));
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
            .map(({category, sum, currency, date, finalSum}) => ({
                category: ucFirst(t(category)),
                sum,
                currency,
                date,
                finalSum
            })),
        allExpenses: (props.expenses ?? [])
            .map(({category, sum, currency, date, finalSum}) => ({
                category: ucFirst(t(category)),
                sum,
                currency,
                date,
                finalSum
            })),
        allCurrency: currency(),
        operationCurrency: props.bankAccount.currency,
        finalSum: 0
    });

    const [convertData, setConvertData] = useState({
        sum: 1,
        beforeCurrency: "AED",
        afterCurrency: "AED",
        newSum: 0
    });

    const [categoryData, setCategoryData] = useState({
        selectedStatisticIncomeCategory: '-',
        selectedStatisticExpensesCategory: '-',
    });

    const [selectedStatisticIncomeTimeInterval, setSelectedStatisticIncomeTimeInterval] = useState<[Date | null, Date | null]>([null, null]);
    const [selectedStatisticExpensesTimeInterval, setSelectedStatisticExpensesTimeInterval] = useState<[Date | null, Date | null]>([null, null]);

    const [converterDrawerState, converterAuthMethods] = useDisclosure(false);

    const [incomeChartInfo, setIncomeChartInfo] = useState<DonutChartCell[]>([]);
    const [incomeChartLabel, setIncomeChartLabel] = useState(0);
    const [expensesChartInfo, setExpensesChartInfo] = useState<DonutChartCell[]>([]);
    const [expensesChartLabel, setExpensesChartLabel] = useState(0);

    useEffect(() => {
        const aggregatedIncomeChartData: Record<string, number> = data.allIncome.reduce((acc, item) => {
            const category = ucFirst(item.category);
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += +item.finalSum;
            return acc;
        }, {} as Record<string, number>);

        let sum = 0;
        setIncomeChartInfo(Object.keys(aggregatedIncomeChartData).map((category, index) => {
            const value = aggregatedIncomeChartData[category];
            sum += value;
            return {
                name: category,
                value: +value.toFixed(2),
                color: getRandomChartColor(),
            }
        }));

        setIncomeChartLabel(+sum.toFixed(2));
    }, [data.allIncome]);

    useEffect(() => {
        const aggregatedExpensesChartData: Record<string, number> = data.allExpenses.reduce((acc, item) => {
            const category = ucFirst(item.category);
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += +item.finalSum;
            return acc;
        }, {} as Record<string, number>);

        let sum = 0;
        setExpensesChartInfo(Object.keys(aggregatedExpensesChartData).map((category, index) => {
            const value = aggregatedExpensesChartData[category]
            sum += value;
            return {
                name: category,
                value: +value.toFixed(2),
                color: getRandomChartColor(),
            }
        }));

        setExpensesChartLabel(+sum.toFixed(2));
    }, [data.allExpenses]);

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
        setConvertData(prevData => ({
            ...prevData,
            [fieldName]: value,
        }));
        console.log(convertData)
    }

    function handleCategoriesChange(fieldName: string, value: any) {
        setCategoryData(prevData => ({
            ...prevData,
            [fieldName]: value,
        }));
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
        const convertResponse = await fetch('/api/converter', {
            method: 'POST',
            body: JSON.stringify({
                sum: data.sum,
                afterCurrency: data.currency,
                beforeCurrency: data.operationCurrency
            }),
        });

        let finalSum = 0;
        if (convertResponse.ok) {
            console.log('converter api worked successfully!');
            finalSum = +((await convertResponse.json()).result?.toFixed(2));
            handleFieldChange("finalSum", finalSum);
        } else {
            console.error('Failed work converter.');
        }
        const operation: IOperation = {
            _id: new ObjectId().toString(),
            user_id: props.user._id,
            bankAccount_id: props.bankAccount._id,
            sum: data.sum,
            currency: data.operationCurrency,
            date: data.date,
            category: data.category,
            operationsStatus: data.operationStatus,
            finalSum: finalSum,
        };

        const response = await fetch(`/api/addOperation/${JSON.stringify(operation)}`);
        if (!response.ok) throw new Error(response.statusText);

        if (operation.operationsStatus === '+') {
            const newIncomes = [...data.allIncome];
            newIncomes.push({
                category: ucFirst(t(operation.category ?? '')),
                sum: operation.sum ?? 0,
                currency: operation.currency ?? '',
                date: operation.date?.toString() ?? '',
                finalSum: finalSum
            });

            handleFieldChange('allIncome', newIncomes)
        } else if (operation.operationsStatus === '-') {
            const newExpenses = [...data.allExpenses];
            newExpenses.push({
                category: ucFirst(t(operation.category ?? '')),
                sum: operation.sum ?? 0,
                currency: operation.currency ?? '',
                date: operation.date?.toString() ?? '',
                finalSum: finalSum
            });
            handleFieldChange('allExpenses', newExpenses)
        }

        await updateBalance(finalSum)
    }

    async function updateBalance(finalSum: number) {
        const responseUpdate = await fetch('/api/updateBalance', {
            method: 'POST',
            body: JSON.stringify({
                currentBankAccount_id: props.bankAccount._id,
                sum: finalSum,
                operationStatus: data.operationStatus,
                balance: data.balance
            }),
        });
        if (!responseUpdate.ok) throw new Error(responseUpdate.statusText);
        handleFieldChange("updateLastUpdateDate", data?.lastUpdateDate)
        if (data.operationStatus === '+') {
            handleFieldChange("balance", +((+(data?.balance ?? 0) + finalSum).toFixed(2)))
        } else {
            handleFieldChange("balance", +((+(data?.balance ?? 0) - finalSum).toFixed(2)))
        }
        setIncomeModalState(false)
        setExpensesModalState(false);
        handleFieldChange("category", "")
        notifications.show({
            title: t('mainPage.notification.title'),
            message: t('mainPage.notification.operationDone'),
        })
    }

    async function dateValidation() {
        const response = await fetch(`/api/addOperation/operations`);
        if (!response.ok) throw new Error(response.statusText);
        console.log('data: ', data);
        if (!data.sum || !(/^[\d]+$/).test(data.sum.toString())) {
            notifications.show({
                title: t('mainPage.notification.title'),
                message: t('mainPage.notification.sumError'),
            })
            return
        }
        if ((!data.date || !validator.isDate(data.date.toString())) && data.date > new Date()) {
            notifications.show({
                title: t('mainPage.notification.title'),
                message: t('mainPage.notification.dateError'),
            })
            return
        } else {
            await dataToDB()
        }
    }

    async function convert() {
        if (!convertData.sum || !(/^[\d]+$/).test(convertData.sum.toString())) {
            notifications.show({
                title: t('mainPage.notification.title'),
                message: t('mainPage.notification.sumError'),
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
            handleConvertChange("newSum", +convert?.toFixed(2));
        } else {
            console.error('Failed work converter.');
        }
    }

    function getIncomeTableRows() {
        let filteredIncome;

        if (categoryData.selectedStatisticIncomeCategory === '-') {
            filteredIncome = data.allIncome;
        } else {
            filteredIncome = data.allIncome.filter(e => e.category === t(categoryData.selectedStatisticIncomeCategory))
        }

        if (selectedStatisticIncomeTimeInterval[0] && selectedStatisticIncomeTimeInterval[1]) {
            filteredIncome = data.allIncome.filter(e => new Date(e.date) >= selectedStatisticIncomeTimeInterval[0]! && new Date(e.date) <= selectedStatisticIncomeTimeInterval[1]!)
        }

        const rows = filteredIncome.map(({category, sum, date, currency, finalSum}) => {

            const dateTime = new Date(date);
            const day = String(dateTime.getDate()).padStart(2, '0');
            const month = String(dateTime.getMonth() + 1).padStart(2, '0');
            const year = dateTime.getFullYear();

            return (<Table.Tr key={`${category}-${sum}-${date}-${currency}`}>
                <Table.Td>{category}</Table.Td>
                <Table.Td>{sum}</Table.Td>
                <Table.Td>{currency}</Table.Td>
                <Table.Td>{finalSum}</Table.Td>
                <Table.Td>{`${day}/${month}/${year}`}</Table.Td>
            </Table.Tr>)
        });

        return rows
    }

    function getExpensesTableRows() {
        let filteredExpenses;

        if (categoryData.selectedStatisticExpensesCategory === '-') {
            filteredExpenses = data.allExpenses;
        } else {
            filteredExpenses = data.allExpenses.filter(e => e.category === t(categoryData.selectedStatisticExpensesCategory))
        }

        if (selectedStatisticExpensesTimeInterval[0] && selectedStatisticExpensesTimeInterval[1]) {
            filteredExpenses = data.allExpenses.filter(e => new Date(e.date) >= selectedStatisticExpensesTimeInterval[0]! && new Date(e.date) <= selectedStatisticExpensesTimeInterval[1]!)
        }

        const rows = filteredExpenses.map(({category, sum, date, currency, finalSum}) => {

            const dateTime = new Date(date);
            const day = String(dateTime.getDate()).padStart(2, '0');
            const month = String(dateTime.getMonth() + 1).padStart(2, '0');
            const year = dateTime.getFullYear();

            return (<Table.Tr key={`${category}-${sum}-${date}-${currency}`}>
                <Table.Td>{category}</Table.Td>
                <Table.Td>{sum}</Table.Td>
                <Table.Td>{currency}</Table.Td>
                <Table.Td>{finalSum}</Table.Td>
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
            <AppShell
                header={{height: 55}}
                navbar={{
                    width: 300,
                    breakpoint: 'sm',
                }}
                padding="md"
            >
                <AppShell.Navbar className={styles.navbar} p="md">
                    <div style={{marginTop: 20}}>
                        <Button radius="xl" style={{marginTop: 5}}
                                onClick={converterAuthMethods.open}
                                fullWidth={true} variant="light">{t('mainPage.converterButton')}</Button>
                        <Button radius="xl" style={{marginTop: 5}}
                                onClick={() => setIncomeModalState(!incomeModalState)}
                                fullWidth={true} variant="light">{t('mainPage.addIncome')}</Button>
                        <Button radius="xl" style={{marginTop: 5}}
                                onClick={() => setExpensesModalState(!expensesModalState)}
                                fullWidth={true} variant="light">{t('mainPage.addExpenses')}</Button>
                        <Button radius="xl" style={{marginTop: 5}} onClick={() => setCategoriesIncomeModalState(true)}
                                fullWidth={true} variant="light">{t('mainPage.categoryStat')}</Button>
                        <Button radius="xl" style={{marginTop: 5}}
                                onClick={() => setDateIncomeModalState(true)} fullWidth={true}
                                variant="light">{t('mainPage.dateStat')}</Button>
                    </div>
                </AppShell.Navbar>
                <AppShell.Main style={{marginLeft: 50}}>
                    <Group><div>
                    <h1 style={{fontSize: 25}}>{t('mainPage.hello')}, {props.user.fio}</h1><br/>
                    <h1 style={{fontSize: 20}}>{t('mainPage.yourBankAccount')}</h1>
                    <Paper shadow="md" radius="md" p="xl" withBorder={true} className={styles.paper}
                           style={{width: 400, height: 200}}>
                        <div style={{marginTop: -10, marginLeft: -15}}>
                            <h1 style={{fontSize: 18}}>{props.bankAccount.name}</h1><br/>
                            <h1 style={{fontSize: 25}}>{data.balance} {props.bankAccount.currency}</h1>
                            <br/>
                            <h1 style={{fontSize: 18}}>{t('mainPage.lastUpdate')} {data.lastUpdateDate}</h1>
                        </div>
                    </Paper><br/></div>
                    <div>
                        <Calendar/>
                    </div></Group>
                    <div>
                        <Drawer
                            title={t('mainPage.converter.title')}
                            opened={converterDrawerState}
                            onClose={converterAuthMethods.close}
                            overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                            position="right"
                            offset={8} radius="md">
                            <Group>
                                <TextInput style={{width: 307}} label={t('mainPage.converter.inputSum')} radius="md"
                                           onChange={(e) => handleConvertChange("sum", e.target.value)}/>
                                <NativeSelect style={{width: 85, paddingTop: 25}} data={data.allCurrency}
                                              radius="md"
                                              onChange={(e) => handleConvertChange("beforeCurrency", e.target.value)}
                                              defaultValue={props.bankAccount.currency}/>
                            </Group>
                            <Group>
                                <TextInput radius="md" readOnly={true} style={{width: 307}}
                                           label={t('mainPage.converter.resultSum')}
                                           value={convertData.newSum}/>
                                <NativeSelect style={{width: 85, paddingTop: 25}} data={data.allCurrency}
                                              radius="md"
                                              onChange={(e) => handleConvertChange("afterCurrency", e.target.value)}/></Group>
                            <br/>
                            <Button style={{width: 410, fontSize: 18}} radius="md"
                                    onClick={convert}>{t('mainPage.converter.button')}</Button>
                        </Drawer>
                        <Modal closeOnClickOutside={false}
                               closeOnEscape={false} opened={incomeModalState} onClose={() => setIncomeModalState(false)}
                               overlayProps={{backgroundOpacity: 0.5, blur: 4}} radius="md"
                               title={t('mainPage.incomeModal.title')}>
                            <Group>
                                <TextInput radius="md"
                                           label={t('mainPage.incomeModal.inputSum')}
                                           placeholder="100"
                                           onChange={(e) => handleFieldChange("sum", e.target.value)}
                                           title={t('mainPage.incomeModal.sumTitle')} style={{width: 307}}
                                />
                                <NativeSelect style={{width: 85, paddingTop: 25}} data={data.allCurrency}
                                              radius="md"
                                              onChange={(e) => handleFieldChange("operationCurrency", e.target.value)}
                                              defaultValue={props.bankAccount.currency}/>
                            </Group>
                            <br/>
                            <NativeSelect label={t('mainPage.incomeModal.selector.label')} radius="md"
                                          onChange={(e) => handleFieldChange("category", e.target.value)}
                                          title={t('mainPage.incomeModal.selector.title')}
                                          data={data.incomeCategory}>
                            </NativeSelect><br/>
                            <DateInput onChange={(e) => handleFieldChange("date", e)} radius="md"
                                       label={t('mainPage.incomeModal.dateLabel')}
                                       placeholder={t('mainPage.incomeModal.datePlaceholder')}></DateInput>
                            <Button onClick={addIncome} radius="md"
                                    style={{
                                        width: 408,
                                        marginTop: 20,
                                        fontSize: 20
                                    }}>{t('mainPage.incomeModal.addButton')}</Button>
                        </Modal>
                        <Modal closeOnClickOutside={false}
                               closeOnEscape={false} opened={expensesModalState} onClose={() => setExpensesModalState(false)}
                               overlayProps={{backgroundOpacity: 0.5, blur: 4}} radius="md"
                               title={t('mainPage.expensesModal.title')}>
                            <Group>
                                <TextInput radius="md"
                                           label={t('mainPage.expensesModal.inputSum')}
                                           placeholder="100"
                                           onChange={(e) => handleFieldChange("sum", e.target.value)}
                                           title={t('mainPage.expensesModal.sumTitle')} style={{width: 307}}/>
                                <NativeSelect style={{width: 85, paddingTop: 25}} data={data.allCurrency}
                                              radius="md"
                                              onChange={(e) => handleFieldChange("operationCurrency", e.target.value)}
                                              defaultValue={props.bankAccount.currency}/>
                            </Group><br/>
                            <NativeSelect label={t('mainPage.expensesModal.selector.label')} radius="md"
                                          onChange={(e) => handleFieldChange("category", e.target.value)}
                                          title={t('mainPage.expensesModal.selector.title')}
                                          data={data.expensesCategory}>
                            </NativeSelect><br/>
                            <DateInput
                                onChange={(e) => handleFieldChange("date", e)} radius="md"
                                label={t('mainPage.expensesModal.dateLabel')}
                                placeholder={t('mainPage.expensesModal.datePlaceholder')}></DateInput>
                            <Button onClick={addExpenses} radius="md"
                                    style={{
                                        width: 408,
                                        marginTop: 20,
                                        fontSize: 20
                                    }}>{t('mainPage.expensesModal.addButton')}
                            </Button>
                        </Modal>
                    </div>
                    <br/>
                    <Modal closeOnClickOutside={false}
                           closeOnEscape={false} opened={categoriesIncomeModalState} radius="md" onClose={() => {
                        setCategoriesIncomeModalState(false)
                        setSegmentCategoriesState(t('mainPage.income'));
                        handleCategoriesChange("selectedStatisticIncomeCategory", '-')
                    }}
                           title={t('mainPage.statCategoryIncome')}
                           overlayProps={{backgroundOpacity: 0, blur: 4}}>
                        <SegmentedControl fullWidth value={segmentCategoriesState} radius='xl'
                                          data={[t('mainPage.income'), t('mainPage.expense')]}
                                          onChange={(e) => {
                                              setSegmentCategoriesState(e);
                                              if (e === t('mainPage.income')) {
                                                  incomeCategories()
                                              } else if (e === t('mainPage.expense')) {
                                                  expensesCategories()
                                              }
                                              handleCategoriesChange("selectedStatisticIncomeCategory", '-')
                                          }}/>
                        <NativeSelect label={t('mainPage.incomeModal.selector.label')} radius="md"
                                      value={categoryData.selectedStatisticIncomeCategory}
                                      onChange={(e) => handleCategoriesChange("selectedStatisticIncomeCategory", e.target.value)}
                                      title={t('mainPage.incomeModal.selector.title')}
                                      data={['-', ...data.incomeCategory]}>
                        </NativeSelect><br/>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t('mainPage.table.category')}</Table.Th>
                                    <Table.Th>{t('mainPage.table.sum')}</Table.Th>
                                    <Table.Th>{t('mainPage.table.currency')}</Table.Th>
                                    <Table.Th>{t('mainPage.table.sum')}, {data.currency}</Table.Th>
                                    <Table.Th>{t('mainPage.table.date')}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            {<Table.Tbody>{getIncomeTableRows()}</Table.Tbody>}
                        </Table>
                    </Modal>
                    <Modal closeOnClickOutside={false}
                           closeOnEscape={false} radius="md" opened={categoriesExpensesModalState} onClose={() => {
                        setCategoriesExpensesModalState(false);
                        setSegmentCategoriesState(t('mainPage.income'));
                        handleCategoriesChange("selectedStatisticExpensesCategory", '-')
                    }}
                           title={t('mainPage.titleCategoryStat')}
                           overlayProps={{backgroundOpacity: 0, blur: 4}}>
                        <SegmentedControl fullWidth value={segmentCategoriesState} radius='xl'
                                          data={[t('mainPage.income'), t('mainPage.expense')]}
                                          onChange={(e) => {
                                              setSegmentCategoriesState(e);
                                              if (e === t('mainPage.income')) {
                                                  incomeCategories()
                                              } else if (e === t('mainPage.expense')) {
                                                  expensesCategories()
                                              }
                                              handleCategoriesChange("selectedStatisticExpensesCategory", '-')
                                          }}/>
                        <NativeSelect radius="md" label={t('mainPage.incomeModal.selector.label')}
                                      value={categoryData.selectedStatisticExpensesCategory}
                                      onChange={(e) => handleCategoriesChange("selectedStatisticExpensesCategory", e.target.value)}
                                      title={t('mainPage.incomeModal.selector.title')}
                                      data={['-', ...data.expensesCategory]}>
                        </NativeSelect><br/>
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t('mainPage.table.category')}</Table.Th>
                                    <Table.Th>{t('mainPage.table.sum')}</Table.Th>
                                    <Table.Th>{t('mainPage.table.currency')}</Table.Th>
                                    <Table.Th>{t('mainPage.table.sum')}, {data.currency}</Table.Th>
                                    <Table.Th>{t('mainPage.table.date')}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            {<Table.Tbody>{getExpensesTableRows()}</Table.Tbody>}
                        </Table>
                    </Modal>
                    <Modal closeOnClickOutside={false}
                           closeOnEscape={false} opened={dateIncomeModalState} radius="md" onClose={() => {
                        setDateIncomeModalState(false);
                        setSegmentDateState(t('mainPage.income'));
                        setSelectedStatisticIncomeTimeInterval([null, null])
                    }}
                           title={t('mainPage.titleDateStat')} overlayProps={{backgroundOpacity: 0, blur: 4}}>
                        <SegmentedControl fullWidth value={segmentDateState}
                                          data={[t('mainPage.income'), t('mainPage.expense')]} radius='xl'
                                          onChange={(e) => {
                                              setSegmentDateState(e);
                                              if (e === t('mainPage.income')) {
                                                  incomeDate()
                                              } else if (e === t('mainPage.expense')) {
                                                  expensesDate()
                                              }
                                              setSelectedStatisticIncomeTimeInterval([null, null])
                                          }}/>
                        <DatePickerInput radius="md"
                                         type="range"
                                         label={t('mainPage.selectDatesLabel')}
                                         placeholder={t('mainPage.selectDates')}
                                         value={selectedStatisticIncomeTimeInterval}
                                         onChange={(value) => setSelectedStatisticIncomeTimeInterval(value)}
                        />
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t('mainPage.table.category')}</Table.Th>
                                    <Table.Th>{t('mainPage.table.sum')}</Table.Th>
                                    <Table.Th>{t('mainPage.table.currency')}</Table.Th>
                                    <Table.Th>{t('mainPage.table.sum')}, {data.currency}</Table.Th>
                                    <Table.Th>{t('mainPage.table.date')}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            {<Table.Tbody>{getIncomeTableRows()}</Table.Tbody>}
                        </Table>
                    </Modal>
                    <Modal closeOnClickOutside={false}
                           closeOnEscape={false} radius="md" opened={dateExpensesModalState} onClose={() => {
                        setDateExpensesModalState(false);
                        setSegmentDateState(t('mainPage.income'));
                        setSelectedStatisticExpensesTimeInterval([null, null])
                    }}
                           title={t('mainPage.statDateExpense')} overlayProps={{backgroundOpacity: 0, blur: 4}}>
                        <SegmentedControl fullWidth value={segmentDateState}
                                          data={[t('mainPage.income'), t('mainPage.expense')]} radius='xl'
                                          onChange={(e) => {
                                              setSegmentDateState(e);
                                              if (e === t('mainPage.income')) {
                                                  incomeDate()
                                              } else if (e === t('mainPage.expense')) {
                                                  expensesDate()
                                              }
                                              setSelectedStatisticExpensesTimeInterval([null, null])
                                          }}/>
                        <DatePickerInput radius="md"
                                         type="range"
                                         label={t('mainPage.selectDatesLabel')}
                                         placeholder={t('mainPage.selectDates')}
                                         value={selectedStatisticExpensesTimeInterval}
                                         onChange={(value) => setSelectedStatisticExpensesTimeInterval(value)}
                        />
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t('mainPage.table.category')}</Table.Th>
                                    <Table.Th>{t('mainPage.table.sum')}</Table.Th>
                                    <Table.Th>{t('mainPage.table.currency')}</Table.Th>
                                    <Table.Th>{t('mainPage.table.sum')}, {data.currency}</Table.Th>
                                    <Table.Th>{t('mainPage.table.date')}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            {<Table.Tbody>{getExpensesTableRows()}</Table.Tbody>}
                        </Table>
                    </Modal>
                    <Group>
                        <div>
                            <Text style={{textAlign: "center", fontSize: 20}}>Доходы</Text>
                            <DonutChart size={250} thickness={35} data={incomeChartInfo}
                                        chartLabel={incomeChartLabel}
                                        withLabelsLine withLabels withTooltip title={t('mainPage.income')}
                                        tooltipDataSource="segment"/>
                        </div>
                        <div><Text style={{textAlign: "center", fontSize: 20}}>Расходы</Text>
                            <DonutChart size={250} thickness={35} data={expensesChartInfo}
                                        chartLabel={expensesChartLabel}
                                        title={t('mainPage.expense')} withTooltip withLabels withLabelsLine
                                        tooltipDataSource="segment"/></div>
                    </Group>
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
    let income, expenses, bankAcc;

    if (user) {
        bankAcc = (await db.collection('bankAccounts').findOne({_id: user.currentBankAccount})) as IBankAccount;
        const {NEXTAUTH_URL} = process.env;
        const responseIncome = await fetch(`${NEXTAUTH_URL}/api/allIncome/${bankAcc._id}`);
        income = (await responseIncome.json()).result as {
            category: string,
            sum: number,
            currency: string,
            date: string,
            finalSum: number
        }[];
        const responseExpenses = await fetch(`${NEXTAUTH_URL}/api/allExpenses/${bankAcc._id}`);
        if (!responseExpenses.ok) throw new Error(responseExpenses.statusText);
        if (!responseIncome.ok) throw new Error(responseIncome.statusText);

        expenses = (await responseExpenses.json()).result as {
            category: string,
            sum: number,
            currency: string,
            date: string
            finalSum: number
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
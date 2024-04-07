import '../styles/pages.module.css'
import IUser from "@/src/types/IUser";
import React, {useState} from "react";
import styles from '../styles/pages.module.css'
import {getSession} from "next-auth/react";
import {connectToDatabase} from "@/src/database";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {ObjectId} from "bson";
import Link from "next/link";
import IBankAccount from "@/src/types/IBankAccount";
import {Button, Group, Modal, NativeSelect, PinInput, Switch, Text, TextInput} from "@mantine/core";
import {createBankAccountObj} from "@/src/utils";
import Header from "../components/header"
import {useRouter} from "next/navigation";
import {currency} from "@/src/utils";

export default function Page(props: {
    user: IUser,
    bankAccount: IBankAccount,
    bankAccounts: { label: string, value: string }[]
}) {
    const [changeModalState, setChangeModalState] = useState(false);
    const [changeAccountModalState, setChangeAccountModalState] = useState(false);
    const [deleteModalState, setDeleteModalState] = useState(false);
    const [confirmDeleteModalState, setConfirmDeleteModalState] = useState(false);
    const [addCategoryModalState, setAddCategoryModalState] = useState(false);
    const [billModalState, setBillModalState] = useState(false);
    const [inviteCodeModalState, setInviteCodeModalState] = useState(false);
    const [codeModalState, setCodeModalState] = useState(false);
    const [data, setData] = useState({
        name: "Счёт",
        currency: "BYN",
        balance: 0,
        inviteCode: "",
        fio: props.user.fio,
        email: props.user.email,
        //twoFA: props.user.twoStepAuth,
        bankAccounts: props.bankAccounts,
        selectBankAccount: props.bankAccounts[0].value,
        bankName: props.bankAccount.name,
        changeFio: props.user.fio,
        changeEmail: props.user.email,
        changeBankName: props.bankAccount.name,
        allCurrency: currency()
    });
    const [checked2FA, setChecked2FA] = useState(props.user.twoStepAuth);

    function handleFieldChange(fieldName: string, value: any) {
        setData({
            ...data,
            [fieldName]: value,
        });
    }

    const router = useRouter();

    async function dateValidation(e: any) {
        e.preventDefault();
        if (!data.balance || !(/^[\d]+$/).test(data.balance.toString())) {
            alert("Сумма введена не верно, попробуйте ещё раз.")
            return
        }
        if (!data.name) {
            alert("Укажите название счёта")
            return
        } else {
            /*const response = await fetch(`/api/addBankAccount/bankAccounts`);
            if (!response.ok) throw new Error(response.statusText);*/
            await dataToDB();
            alert("всё оки, работаем дальше")
        }
    }

    async function checkInviteCode(e: any) {
        e.preventDefault();
        let response = await fetch(`/api/addBankAccount/bankAccounts`);

        if (!response.ok) throw new Error(response.statusText);

        const json = await response.json();
        const inviteToBankAccount = json.users.find((bankAccount: IBankAccount) => bankAccount.invitingCode === data.inviteCode)
        if (!inviteToBankAccount) {
            alert("Код введён не верно, попробуйте ещё раз")
            return;
        } else {
            alert("Всё круто")
            response = await fetch(`/api/changeCurrentBankAccount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: props.user._id,
                    bankAccount_id: inviteToBankAccount._id
                }),
            });

            if (!response.ok) throw new Error(response.statusText);
            setBillModalState(false);
            setInviteCodeModalState(false);

            //тут надо прописать смену текущего аккаунта для данного пользователя
        }
    }

    async function dataToDB() {
        const bankAccount = createBankAccountObj(props.user._id, new ObjectId().toString());

        const response = await fetch(`/api/addBankAccount/${JSON.stringify(bankAccount)}`);

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
        await router.push('/main')
    }

    async function changeBankAccount() {
        if (!data.selectBankAccount) {
            alert("Выберите счёт")
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
        alert("Аккаунт успешно сменён")
    }

    async function updateData() {
        if (!data.changeFio || !data.changeEmail || !data.changeBankName)
        {
            alert("Данные указаны не верно")
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
            }),
        });

        if (!response.ok) throw new Error(response.statusText);
        alert("Данные успешно обновлены")
        setChangeModalState(false);// доделать обновление полей на странице без релода страницы
        /*handleFieldChange("fio", data.changeFio)
        handleFieldChange("email", data.changeEmail)
        handleFieldChange("bankName", data.changeBankName)*/

    }

    return (
        <div className={styles.page}>
            <Header/>
            <div className={styles.pageContent}>
                <h2>ФИО: {data.fio}</h2>
                <h2>Электронная почта: {data.email}</h2>
                <h2>Название счёта: {data.bankName}</h2>
                <Button style={{width: 200}}
                        onClick={() => setChangeModalState(!changeModalState)}>Изменить
                </Button><br/>
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
                    /><br/>
                    <h1>Тут ещё должна быть валюта</h1>
                    <Switch label="Двухфакторная аутентификация" size="md" onLabel="ON" offLabel="OFF"
                            checked={checked2FA}
                            onChange={(event) => setChecked2FA(event.currentTarget.checked)}/><br/>
                    <Button onClick={updateData}
                            style={{width: 410, marginTop: 20, fontSize: 20}}>Сохранить
                    </Button>
                </Modal>
                <Button style={{width: 200}} onClick={() => setAddCategoryModalState(!addCategoryModalState)}>Добавить
                    категорию</Button><br/>
                <Modal opened={addCategoryModalState} onClose={() => setAddCategoryModalState(false)}
                       overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                       title={'Добавление категорий'}>
                    <h1>Test category</h1>
                </Modal>
                <Button style={{width: 200}} onClick={() => setBillModalState(!billModalState)}>Добавить
                    счёт</Button><br/>
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
                            style={{paddingRight: 0, width: 316}}
                            onChange={(e) => handleFieldChange("balance", e.target.value)}
                            title="Пример: 1000 BYN"
                        />
                        <NativeSelect
                            onChange={(e) => handleFieldChange("currency", e.target.value)}
                            title="Укажите валюту. Пример: BYN"
                            style={{paddingTop: 25, marginLeft: 0}}
                            /*data={data.allCurrency}*/>
                        </NativeSelect></Group>
                    <Button onClick={dateValidation}
                            style={{width: 410, marginTop: 20, fontSize: 20}}>Добавить
                    </Button>

                    <Link style={{paddingLeft: 100}} href={""}
                          onClick={() => setInviteCodeModalState(!inviteCodeModalState)}>У меня есть пригласительный
                        код</Link>

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
                <Button style={{width: 200}} onClick={() => setChangeAccountModalState(!changeAccountModalState)}>Сменить
                    счёт</Button><br/>
                <Modal opened={changeAccountModalState} onClose={() => setChangeAccountModalState(false)}
                       overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                       title={'Смена счёта'}>
                    <h1>Выберите счёт:</h1>
                    <NativeSelect onChange={(e) => handleFieldChange("selectBankAccount", e.target.value)}
                                  data={data.bankAccounts}></NativeSelect>
                    <Button onClick={changeBankAccount}>Перейти</Button>
                </Modal>
                <Button style={{width: 200}} onClick={() => setDeleteModalState(!deleteModalState)}>Удалить
                    счёт</Button>
                <Modal opened={deleteModalState} onClose={() => setDeleteModalState(false)}
                       overlayProps={{backgroundOpacity: 0.5, blur: 4}}
                       title={'Удаление счёта'}>
                    <h1>Test delete account</h1>
                    <Button onClick={() => setConfirmDeleteModalState(!confirmDeleteModalState)}>Удалить</Button>
                    <Modal opened={confirmDeleteModalState} onClose={() => setConfirmDeleteModalState(false)}
                           overlayProps={{backgroundOpacity: 0, blur: 4}}
                           title={'Вы уверены что хотите удалить аккаунт?'}>
                        <Button>Да</Button>
                        <Button variant="outline">Нет</Button>
                    </Modal>
                </Modal>
                <Button onClick={() => setCodeModalState(!codeModalState)}>Пригласительный код</Button>
                <Modal title={"Пригласительный код для счёта " + props.bankAccount.name}
                       opened={codeModalState} onClose={() => setCodeModalState(false)}
                       overlayProps={{backgroundOpacity: 0, blur: 4}}>
                    <Text>{props.bankAccount.invitingCode}</Text>
                </Modal>
            </div>
        </div>
    )
}
//доделать функционал кнопок

export const getServerSideProps = async (ctx: any) => {
    const session = await getSession(ctx);

    const {db} = await connectToDatabase();

    const user = (await db.collection('users').findOne({email: session?.user?.email})) as IUser;

    const {NEXTAUTH_URL} = process.env;
    const response = await fetch(`${NEXTAUTH_URL}/api/userBankAccounts/${user._id}`);
    if (!response.ok) throw new Error(response.statusText);
    const bankAccounts = (await response.json()).result as { label: string, value: string }[];
    const bankAcc = (await db.collection('bankAccounts').findOne({_id: user.currentBankAccount})) as IBankAccount;

    return {
        props: {
            user: user, bankAccount: bankAcc,
            bankAccounts: bankAccounts,
            ...(await serverSideTranslations(ctx.locale, ['common']))
        }
    }
};

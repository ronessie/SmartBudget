import '../styles/pages.module.css'
import IUser from "@/src/types/IUser";
import React, {useState} from "react";
import styles from '../styles/pages.module.css'
import {useRouter} from "next/router";
import {getSession} from "next-auth/react";
import {connectToDatabase} from "@/src/database";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {ObjectId} from "bson";
import Link from "next/link";
import IBankAccount from "@/src/types/IBankAccount";
import {Button, Group, Modal, NativeSelect, Switch, TextInput} from "@mantine/core";
import {createBankAccountObj} from "@/src/utils";
import Header from "../components/header"

export default function Page(props: { user: IUser, currentBankAccount: ObjectId }) {
    const [changeModalState, setChangeModalState] = useState(false);
    const [billModalState, setBillModalState] = useState(false);
    const [inviteCodeModalState, setInviteCodeModalState] = useState(false);
    const [data, setData] = useState({
        name: "Счёт",
        currency: "BYN",
        balance: 0,
        lastBalanceUpdateDate: new Date(),
        inviteCode: "",
        date: new Date(),
        fio: props.user.fio,
        email: props.user.email,
        twoFA: props.user.twoStepAuth,
    });
    const [checked2FA, setChecked2FA] = useState(props.user.twoStepAuth);

    function handleFieldChange(fieldName: string, value: any) {
        setData({
            ...data,
            [fieldName]: value,
        });
    }

    async function dateValidation(e: any) {
        e.preventDefault();
        const response = await fetch(`/api/addBankAccount/bankAccounts`);
        if (!response.ok) throw new Error(response.statusText);

        if (!data.balance || !(/^[\d]+$/).test(data.balance.toString())) {
            alert("Сумма введена не верно, попробуйте ещё раз.")
            return
        }
        if (!data.name) {
            alert("Укажите название счёта")
            return
        } else {
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
            response = await fetch(`/api/updateCurrentBankAccount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: props.user._id,
                    inviteCode: data.inviteCode
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
    }
    function updateData()
    {

    }

    return (
        <div className={styles.page}>
            <Header/>
            <div style={{paddingTop: 70}}>
                <h2>ФИО:</h2><h3>{data.fio}</h3>
                <h2>Электронная почта:</h2><h3>{data.email}</h3>
                <Button style={{width: 200}} className={styles.button}
                        onClick={() => setChangeModalState(!changeModalState)}>Изменить
                </Button><br/>
                <Modal opened={changeModalState} onClose={() => setChangeModalState(false)}
                       title={'Редактирование данных'}>
                    <TextInput
                        label="ФИО:"
                        onChange={(e) => handleFieldChange("fio", e.target.value)}
                        title="Введите ФИО"
                        value={data.fio}
                    />
                    <TextInput
                        label="Электронная почта:"
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        title="Введите Электронную почту"
                        value={data.email}
                    /><br/>

                    <Switch label="Двухфакторная аутентификация" size="md" onLabel="ON" offLabel="OFF"
                            checked={checked2FA}
                            onChange={(event) => setChecked2FA(event.currentTarget.checked)}/><br/>
                    <Button className={styles.button} onClick={updateData}
                            style={{width: 410, marginTop: 20, fontSize: 20}}>Сохранить
                    </Button>
                </Modal>
                <Button style={{width: 200}} className={styles.button}
                        onClick={() => setBillModalState(!billModalState)}>Добавить
                    счёт</Button>
                <Modal opened={billModalState} onClose={() => setBillModalState(false)} title={'Добавление счёта'}>
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
                            data={['BYN', 'RUB', 'USD', 'PLN', 'EUR']}>
                        </NativeSelect></Group>
                    <Button className={styles.button} onClick={dateValidation}
                            style={{width: 410, marginTop: 20, fontSize: 20}}>Добавить
                    </Button>

                    <Link className={styles.link} style={{paddingLeft: 100}} href={""}
                          onClick={() => setInviteCodeModalState(!inviteCodeModalState)}>У меня есть пригласительный
                        код</Link>

                    <Modal opened={inviteCodeModalState} onClose={() => setInviteCodeModalState(false)}
                           title={'Подключение к банковскому счёту'}>
                        <TextInput
                            label="Введите пригласительный код"
                            onChange={(e) => handleFieldChange("inviteCode", e.target.value)}
                            title="Введите 16-значный код"
                        />
                        <Button className={styles.button} onClick={checkInviteCode}
                                style={{width: 410, marginTop: 20, fontSize: 20}}>Добавить
                        </Button>
                    </Modal>
                </Modal>
                <br/>
                <Button style={{width: 200}} className={styles.button}>Сменить счёт</Button>
                <Button style={{width: 200}} className={styles.button}>Удалить счёт</Button>
            </div>
        </div>
    )
}
//сделать value для checkbox изменить его на true/false тумблер
//доделать функционал кнопок
export const getServerSideProps = async (ctx: any) => {
    const session = await getSession(ctx);

    const {db} = await connectToDatabase();

    const user = (await db.collection('users').findOne({email: session?.user?.email})) as IUser;

    return {
        props: {
            user: user, currentBankAccount: session?.user,
            ...(await serverSideTranslations(ctx.locale, ['common']))
        }
    }
};

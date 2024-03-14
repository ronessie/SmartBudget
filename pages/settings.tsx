import '../styles/pages.module.css'
import IUser from "@/src/types/IUser";
import React, {useState} from "react";
import styles from "@/styles/pages.module.css";
import Link from "next/link";
import {getSession} from "next-auth/react";
import {connectToDatabase} from "@/src/database";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import IBankAccount from "@/src/types/IBankAccount";
import {ObjectId} from "bson";
import {Button, Group, Modal, NativeSelect, Switch, TextInput} from "@mantine/core";
import {createBankAccountObj} from "@/src/utils";

export default function Page(props: { user: IUser, currentBankAccount: ObjectId }) {
    const [billModalState, setBillModalState] = useState(false);
    const [bankAccountConnectionModalState, setBankAccountConnectionModalState] = useState(false);
    const [data, setData] = useState({
        name: "Счёт",
        currency: "BYN",
        balance: 0,
        lastBalanceUpdateDate: new Date(),
        inviteCode: "",
        date: new Date(),
    });
    const [checked2FA, setChecked2FA] = useState(props.user.twoStepAuth);

    function handleFieldChange(fieldName: string, value: any) {
        setData({
            ...data,
            [fieldName]: value,
        });
    }

    async function dateToDB() {
        const bankAccount = createBankAccountObj(props.user._id, new ObjectId().toString());

        const response = await fetch(`/api/addBankAccount/${JSON.stringify(bankAccount)}`);

        if (!response.ok) throw new Error(response.statusText);
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
            setBankAccountConnectionModalState(false);

            //тут надо прописать смену текущего аккаунта для данного пользователя
        }
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
            await dateToDB();
            alert("всё оки, работаем дальше")
            setBillModalState(false);
        }
    }

    return (
        <div>
            <Button className={styles.button} onClick={() => setBillModalState(!billModalState)}>Добавить счёт</Button>
            <Modal opened={billModalState} onClose={() => setBillModalState(false)} title={'Добавление счёта'}>
                <TextInput
                    label="Введите название счёта"
                    placeholder="Счёт"
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    title="Счёт №1"
                />
                <Group><TextInput
                    label="Введите начальную сумму и укажите валюту"
                    placeholder="1000"
                    style = {{paddingRight: 0, width: 316}}
                    onChange={(e) => handleFieldChange("balance", e.target.value)}
                    title="Пример: 1000"
                />
                    <NativeSelect
                                  onChange={(e) => handleFieldChange("currency", e.target.value)}
                                  data={['BYN', 'RUB', 'USD', 'PLN', 'EUR']}
                                  style = {{paddingTop: 25, marginLeft: 0}}
                                  title="Выберите валюту. Пример: BYN"/></Group>
                <Button className={styles.button} onClick={dateValidation}
                        style={{width: 408, marginTop: 20, fontSize: 20}}>Добавить
                </Button>
            </Modal>

            <Link className={styles.link} style={{paddingLeft: 65}} href={""}
                  onClick={() => setBankAccountConnectionModalState(!bankAccountConnectionModalState)}>У меня есть
                пригласительный код</Link>

            <Modal opened={bankAccountConnectionModalState} onClose={() => setBankAccountConnectionModalState(false)}
                   title={'Подключение к банковскому счёту'}>
                <TextInput
                    label="Введите пригласительный
                                код"
                    onChange={(e) => handleFieldChange("inviteCode", e.target.value)}
                    title="Введите 16 символов"
                />
                <Button className={styles.button} onClick={checkInviteCode}
                        style={{width: 408, marginTop: 20, fontSize: 20}}>Добавить
                </Button>
            </Modal>
            <br/>
            <Switch label="Двухфакторная аутентификация" size="md" onLabel="ON" offLabel="OFF" checked={checked2FA}
                    onChange={(event) => setChecked2FA(event.currentTarget.checked)}/><br/>
            <Button>Сохранить</Button>
        </div>
    )
}// onClick - обновление 2FA статуса у пользователя
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

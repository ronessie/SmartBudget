import '../styles/pages.module.css'
import {user} from "@nextui-org/react";
export default function Page() {
    async function DateFromDB() {
        const response = await fetch(`/api/auth/${JSON.stringify(user)}`);
        if (!response.ok) throw new Error(response.statusText);
        const json = await response.json();
        return(
            <div>
                <h2>ФИО:</h2><h3>{json.users[0].fio}</h3>
                <h2>Электронная почта:</h2><h3>{json.users[0].email}</h3>
                <h2>Номер телефона:</h2><h3>{json.users[0].phone}</h3>
            </div>
        )
    }
    return (
        <div>
            <DateFromDB></DateFromDB>
        </div>
    )
}
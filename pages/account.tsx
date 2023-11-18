import '../styles/pages.module.css'
import {user} from "@nextui-org/react";
import IUser from "@/src/types/IUser";
export default function Page() {
    async function DateFromDB() {
        const response = await fetch(`/api/auth/${JSON.stringify(user)}`);
        if (!response.ok) throw new Error(response.statusText);
        const json = await response.json();
        const userData = json.users.map((user: IUser) => user.fio=="Veronika");
        return(
            <div>
                <h2>ФИО:</h2><h3>{userData.fio}</h3>
                <h2>Электронная почта:</h2><h3>{userData.email}</h3>
                <h2>Номер телефона:</h2><h3>{userData.phone}</h3>
            </div>
        )
    }
    return (
        <div>
            <DateFromDB></DateFromDB>
        </div>
    )
}
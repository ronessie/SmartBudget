import styles from '../styles/pages.module.css'
import {useRouter} from "next/navigation";


export default function Page() {
    const router = useRouter();

    return(
        <div className={styles.page}>
            <div className={styles.pages}>
                <div className={styles.conteiners}>
                    <h1 className={styles.bigBlackText}>Hi, UserName</h1>
                    <button className={styles.logOutButton}>Выйти</button>
                </div>
                <h1 className={styles.text}>Ваш счёт</h1>
                <div className={styles.rectangle}><br/>
                    <h1 className={styles.whiteText}>Счёт 1</h1><br/>
                    <h1 className={styles.bigWhiteText}>10.987 BYN</h1><br/>
                    <h1 className={styles.whiteText}>Последнее обновление 29/01/22</h1>
                </div>
                <div>
                    <button className={styles.incomeButton} onClick={() => router.push('/operations')}>+ Доход</button>
                    <button className={styles.expenseButton} onClick={() => router.push('/operations')}>+ Расход</button>
                </div>
            </div>
        </div>
    )
}
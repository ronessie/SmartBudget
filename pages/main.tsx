import styles from '../styles/pages.module.css'

export default function Page() {
    return(
        <div className={styles.page}>
            <div className={styles.pages}>
                <h1 className={styles.text}>Ваш счёт</h1>
                <div className={styles.rectangle}><br/>
                    <h1 className={styles.whiteText}>Счёт 1</h1><br/>
                    <h1 className={styles.bigWhiteText}>10.987 BYN</h1><br/>
                    <h1 className={styles.whiteText}>Последнее обновление 29/01/22</h1>
                </div>
            </div>
        </div>
    )
}
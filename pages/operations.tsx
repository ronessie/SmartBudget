import styles from '../styles/pages.module.css'
import React from "react";

export default function Page() {
    return(
        <div className={styles.page}>
            <div className={styles.registration}>
                <h1 className={styles.bigBlackText}>Добавление операции</h1><br/>
                <h1 className={styles.text}>Введите сумму</h1><br/>
                <div><input className={styles.inputMoney} type="text" /*value={date.email_or_phone} onChange={(e) => handleFieldChange("email_or_phone", e)}*/
                       title="Пример: Ivanov@mail.ru"/>
                <select className={styles.selectorCurrency} /*value={date.country} onChange={(e) => handleFieldChange("country", e)}*/ title="Укажите валюту. Пример: BYN">
                    <option value="RUB">RUB</option>
                    <option value="BYN">BYN</option>
                    <option value="USD">USD</option>
                    <option value="PLN">PLN</option>
                    <option value="EUR">EUR</option>
                </select></div><br/>
                <h1 className={styles.text}>Выберите категорию трат</h1><br/>
                <select className={styles.selector} /*value={date.country} onChange={(e) => handleFieldChange("country", e)}*/ title="Укажите категорию трат. Пример: Продукты">
                    <option value="products">Продукты</option>
                    <option value="clothes">Одежда</option>
                    <option value="house">Жильё</option>
                    <option value="car">Автомобиль</option>
                    <option value="entertainment">Развлечения</option>
                </select><br/>
                <h1 className={styles.text}>Выберите счёт</h1><br/>
                <select className={styles.selector} /*value={date.country} onChange={(e) => handleFieldChange("country", e)}*/ title="Укажите категорию трат. Пример: Продукты">
                    <option value="name1">Счёт 1</option>
                    <option value="name2">Счёт 2</option>
                    <option value="new">Новый счёт</option>
                </select><br/>
                <button className={styles.button}>Добавить</button>
            </div>
        </div>
    )
}
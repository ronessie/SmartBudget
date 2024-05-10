import {getSession} from "next-auth/react";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Header from "../components/header"
import styles from "@/styles/pages.module.css";
import {useState} from "react";
import LongFooter from "@/components/longFooter";
import {List} from "@mantine/core";

export default function Page() {

    return (
        <div className={styles.page}>
            <Header/> {/*надо поменять хедер*/}
            <div className={styles.pageContent} style={{width: 800, textAlign: "justify", marginLeft: 500}}>
                <h1 style={{color: "blue", fontSize: 30}}>Политика конфиденциальности</h1>
                <h2>Настоящая Политика конфиденциальности регулирует способ, которым SmartBudget собирает, использует,
                    хранит и раскрывает информацию, полученную от пользователей (каждый из которых именуется
                    «Пользователь») веб-сайта smartbudget («Сайт»). Настоящая политика конфиденциальности
                    распространяется на Сайт и все услуги, предлагаемые SmartBudget.</h2><br/>

                <h1 style={{color: "blue", fontSize: 30}}>Личная идентификационная информация</h1>
                <h2>Мы можем собирать личную идентификационную информацию от Пользователей различными способами,
                    включая, помимо прочего, когда Пользователи посещают наш сайт, регистрируются на сайте,
                    подписываются на новостную рассылку, отвечают на опросы, а также в связи с другими действиями,
                    услугами, функциями или ресурсами, которые мы предоставляем на нашем Сайте. Пользователей могут
                    попросить, при необходимости, имя, адрес электронной почты. Мы будем собирать личную
                    идентификационную информацию от Пользователей только в том случае, если они добровольно предоставят
                    нам такую информацию. Пользователи всегда могут отказаться от предоставления личной
                    идентификационной информации, за исключением случаев, когда это может помешать им участвовать в
                    определенных действиях, связанных с Сайтом.</h2><br/>

                <h1 style={{color: "blue", fontSize: 30}}>Идентификационная информация, не являющаяся личной</h1>
                <h2>Мы можем собирать идентификационную информацию неличного характера о Пользователях всякий раз, когда
                    они взаимодействуют с нашим Сайтом. Идентификационная информация, не являющаяся личной, может
                    включать в себя имя браузера, тип компьютера и техническую информацию о средствах подключения
                    Пользователей к нашему Сайту, такую как операционная система и используемые интернет-провайдеры, а
                    также другую подобную информацию.</h2><br/>

                <h1 style={{color: "blue", fontSize: 30}}>Файлы cookie веб-браузера</h1>
                <h2>Наш Сайт может использовать файлы cookie для улучшения пользовательского опыта. Веб-браузер
                    пользователя размещает файлы cookie на его жестком диске в целях учета, а иногда и для отслеживания
                    информации о них. Пользователь может настроить свой веб-браузер таким образом, чтобы он отклонял
                    файлы cookie или предупреждал вас об отправке файлов cookie. Если они это сделают, обратите
                    внимание, что некоторые части Сайта могут не функционировать должным образом.</h2><br/>

                <h1 style={{color: "blue", fontSize: 30}}>Как мы используем собранную информацию</h1>
                <h2>SmartBudget может собирать и использовать личную информацию Пользователей в следующих целях:
                    <List withPadding={true} listStyleType="disc">
                    <List.Item>Для улучшения обслуживания клиентов: Информация, которую вы предоставляете, помогает нам более
                        эффективно реагировать на ваши запросы в службу поддержки клиентов и потребности в поддержке.</List.Item>
                    <List.Item>Для персонализации пользовательского опыта: Мы можем использовать информацию в совокупности, чтобы
                    понять, как наши Пользователи как группа используют услуги и ресурсы, предоставляемые на нашем
                        Сайте.</List.Item>
                    <List.Item>Для отправки периодических электронных писем: Мы можем использовать адрес электронной почты для
                    отправки им информации и обновлений. Если Пользователь решит подписаться на
                    нашу рассылку, он будет получать электронные письма, которые могут содержать новости компании,
                    обновления, информацию о продуктах или услугах и т. д.</List.Item></List></h2><br/>

                <h1 style={{color: "blue", fontSize: 30}}>Как мы защищаем вашу информацию</h1>
                <h2>Мы применяем надлежащие методы сбора, хранения и обработки данных, а также меры безопасности для
                    защиты от несанкционированного доступа, изменения, раскрытия или уничтожения вашей личной
                    информации, имени пользователя, пароля, информации о транзакциях и данных, хранящихся на нашем
                    Сайте. Обмен конфиденциальными и частными данными между Сайтом и его Пользователями происходит по
                    защищенному каналу связи SSL.</h2><br/>

                <h1 style={{color: "blue", fontSize: 30}}>Передача ваших персональных данных</h1>
                <h2>Мы не продаем, не обмениваем и не сдаем в аренду личную идентификационную информацию Пользователей
                    другим лицам. Мы можем передавать общую агрегированную демографическую информацию, не связанную с
                    какой-либо личной идентификационной информацией о посетителях и пользователях, нашим деловым
                    партнерам, доверенным аффилированным лицам и рекламодателям для целей, изложенных выше. Мы можем
                    использовать сторонних поставщиков услуг, чтобы помочь нам управлять нашим бизнесом и Сайтом или
                    управлять деятельностью от нашего имени, такой как рассылка информационных бюллетеней или опросов.
                    Мы можем передавать вашу информацию этим третьим лицам для этих ограниченных целей при условии, что
                    вы дали нам свое разрешение.</h2><br/>

                <h1 style={{color: "blue", fontSize: 30}}>Изменения в политике конфиденциальности</h1>
                <h2>SmartBudget имеет право по своему усмотрению обновлять эту политику конфиденциальности в любое
                    время.  Мы рекомендуем
                    Пользователям часто проверять эту страницу на предмет любых изменений, чтобы быть в курсе того, как
                    мы помогаем защитить личную информацию, которую мы собираем. Вы признаете и соглашаетесь с тем, что
                    вы несете ответственность за периодическое ознакомление с настоящей политикой конфиденциальности и
                    ознакомление с изменениями.</h2><br/>

                <h1 style={{color: "blue", fontSize: 30}}>Ваше согласие с настоящими условиями</h1>
                <h2>Используя этот Сайт, вы подтверждаете свое согласие с этой политикой. Если вы не согласны с этой
                    политикой, пожалуйста, не используйте наш Сайт. Ваше дальнейшее использование Сайта после публикации
                    изменений в этой политике будет считаться вашим согласием с этими изменениями.</h2><br/>

                <h1 style={{color: "blue", fontSize: 30}}>Связаться с нами</h1>
                <h2>Если у вас есть какие-либо вопросы о настоящей Политике конфиденциальности, методах работы этого
                    сайта или ваших отношениях с этим сайтом, пожалуйста, свяжитесь с нами по адресу:
                    vsakolinskaa@gmail.com</h2><br/>
            </div>
            <LongFooter/>
        </div>
    )
}

export const getServerSideProps = async (ctx: any) => {
    const session = await getSession(ctx);

    return {
        props: {
            ...(await serverSideTranslations(ctx.locale, ['common']))
        }
    }
};
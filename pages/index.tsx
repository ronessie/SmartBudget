import Link from "next/link";
import { useRouter } from 'next/router';
import { en } from '@/public/locales/english/en';
import { ru } from '@/public/locales/russian/ru';

export default function Page() {
    const router = useRouter();
    const t = router.locale === 'ru' ? ru : en;
    return(
        <div>
            <a href="authentication">{t.indexPage.authentication}</a>
            <br/>
            <a href="registration">{t.indexPage.registration}</a>
            <br/>
            <a href="settings">{t.indexPage.settings}</a>
            <br/>
            <a href="main">{t.indexPage.main}</a>
            <br/>
            <a href="operations">{t.indexPage.operations}</a>
            <div>
                <Link href="/" locale="en">
                    {t.indexPage.languages.english}
                </Link>
                <Link href="/" locale="ru">
                    {t.indexPage.languages.russian}
                </Link>
            </div>
        </div>
    )
}
//ТУТ БУДЕТ СТРАНИЦА - РЕКЛАМА, ВСЁ О ПРИЛОЖЕНИ И ТД + КНОПКА ВХОДА/РЕГИСТРАЦИИ
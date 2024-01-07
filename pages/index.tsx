import { useTranslation } from 'next-i18next';
import path from 'path';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from "next/link";
import {useRouter} from "next/router";
path.resolve('./next.config.js');

export default function Page() {
    const router = useRouter()
    const { locale, locales, asPath } = router
    const {t, i18n} = useTranslation('common');
    const changeLanguage = (language: any) => {
        i18n.changeLanguage(language);
    };

    return(
        <div>
            <a href="authentication">{t('indexPage.authentication')}</a>
            <br/>
            <a href="registration">{t('indexPage.registration')}</a>
            <br/>
            <a href="settings">{t('indexPage.settings')}</a>
            <br/>
            <a href="main">{t('indexPage.main')}</a>
            <br/>
            <a href="operations">{t('indexPage.operations')}</a>
            <div>
                {locales?.map((loc) => (
                    <Link key={loc} href={asPath} locale={loc}>
                        {loc}
                    </Link>
                ))}
            </div>
        </div>
    )
}

export const getServerSideProps = async (ctx: any) => ({
    props: {
        ...(await serverSideTranslations(ctx.locale, ['common']))
    }
});
//ТУТ БУДЕТ СТРАНИЦА - РЕКЛАМА, ВСЁ О ПРИЛОЖЕНИ И ТД + КНОПКА ВХОДА/РЕГИСТРАЦИИ
/*<Link href="/" locale="en">
                    {t('indexPage.languages.english')}
                </Link>
                <Link href="/" locale="ru">
                    {t('indexPage.languages.russian')}
                </Link>*/
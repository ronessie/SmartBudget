import {useTranslation} from 'next-i18next';
import path from 'path';
import Link from "next/link";
import {useRouter} from "next/router";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {Button} from "@mantine/core";

path.resolve('./next.config.js');

export default function Page() {
    const router = useRouter()
    const {t} = useTranslation('common');
    const changeLanguage = async (language: string) => {
        await router.push(router.pathname, router.asPath, {locale: language});
    };

    return (
        <div>
            <Link href={"authentication"}>{t('indexPage.authentication')}</Link>
            <br/>
            <Link href={"registration"}>{t('indexPage.registration')}</Link>
            <br/>
            <Link href={"settings"}>{t('indexPage.settings')}</Link>
            <br/>
            <Link href={"main"}>{t('indexPage.main')}</Link>
            <br/>
            <Link href={"addingCheck"}>Чеки</Link>
            <br/>
            <Link href={"account"}>Аккаунт</Link>
            <br/>
            <Button onClick={() => changeLanguage('en')}>EN</Button>
            <Button onClick={() => changeLanguage('ru')}>RU</Button>
        </div>
    )
}
export const getServerSideProps = async (ctx: any) => ({
    props: {
        ...(await serverSideTranslations(ctx.locale, ['common']))
    }
});
//ТУТ БУДЕТ СТРАНИЦА - РЕКЛАМА, ВСЁ О ПРИЛОЖЕНИ И ТД + КНОПКА ВХОДА/РЕГИСТРАЦИИ
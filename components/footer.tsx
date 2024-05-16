import {Container, Group, Anchor, Divider} from '@mantine/core'
import classes from '../styles/footer.module.css';
import {useTranslation} from 'next-i18next'
import {useRouter} from "next/navigation";

export default function Footer() {
    const router = useRouter();
    const {t} = useTranslation()
    const links = [
        {link: '/about', label: 'indexPage.about', onClick: () => router.push('/about')},
        {link: '/contacts', label: 'indexPage.contacts', onClick: () => router.push('/contacts')},
        {link: '/policy', label: 'indexPage.privacy', onClick: () => router.push('/policy')},
    ]
    const items = links.map((link) => (
        <Anchor<'a'>
            c='dimmed'
            key={link.label}
            href={link.link}
            onClick={link.onClick}
            size='sm'>
            {t(link.label)}
        </Anchor>
    ))

    return (
        <footer
            style={{
                position: 'fixed',
                bottom: '0',
                left: '0',
                width: '100%',
                textAlign: 'center',
                height: '25px',
                marginBottom: '2rem',
            }}>
            <Divider mb={'sm'}/>
            <Container className={classes.inner}>
                <h1>© SmartBudget. All Rights Reserved. 2024</h1>
                <Group>{items}</Group>
            </Container>
        </footer>
    )
}
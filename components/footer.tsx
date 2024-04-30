import { Container, Group, Anchor, Divider } from '@mantine/core'
import classes from '../styles/footer.module.css';
import { useTranslation } from 'next-i18next'

const links = [
    { link: '#', label: 'About' },
    { link: '#', label: 'Contact' },
    { link: '#', label: 'Privacy' },
    { link: '#', label: 'Help' },
]

export default function Footer() {
    const { t } = useTranslation()

    const items = links.map((link) => (
        <Anchor<'a'>
            c='dimmed'
            key={link.label}
            href={link.link}
            onClick={(event) => event.preventDefault()}
            size='sm'
        >
            {link.label}
        </Anchor>
    ))

    return (
        <footer
            style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                width: '100%',
                textAlign: 'center',
                height: '25px',
                marginBottom: '2rem',
            }}
        >
            <Divider mb={'sm'}/>
            <Container className={classes.inner}>
                <h1>© SmartBudget. All Rights Reserved. 2024</h1>
                <Group>{items}</Group>
            </Container>
        </footer>
    )
}
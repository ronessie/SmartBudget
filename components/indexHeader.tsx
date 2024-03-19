import { useState } from 'react';
import {Container, Group, Burger} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from '../styles/header.module.css';

const links = [
    { link: '1', label: 'About' },
    { link: '2', label: 'Contacts' },
    { link: '3', label: 'Settings' },
    { link: '4', label: 'LogIn/SignIn' },
];

export default function IndexHeader() {
    const [opened, { toggle }] = useDisclosure(false);
    const [active, setActive] = useState(links[0].link);

    const items = links.map((link) => (
        <a
            key={link.label}
            href={link.link}
            className={classes.link}
            data-active={active === link.link || undefined}
            onClick={(event) => {
                event.preventDefault();
                setActive(link.link);
            }}
        >
            {link.label}
        </a>
    ));

    return (
        <header className={classes.header}>
            <Container size="md" className={classes.inner}>
                <img src="/images/small_logo.svg" alt="SmartBudget" style={{paddingTop: 9}}/>
                <Group gap={5} visibleFrom="xs">
                    {items}
                </Group>
                <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
            </Container>
        </header>
    );
}
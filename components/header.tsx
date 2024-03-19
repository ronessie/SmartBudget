import { useState } from 'react';
import {Container, Group, Burger} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from '../styles/header.module.css';
import {useRouter} from "next/navigation";

const links = [
    { link: '/main', label: 'Main' },
    { link: '/', label: 'Index' },
    { link: '/account', label: 'Account' },
    { link: '/addingCheck', label: 'AddCheck' },
];

export default function Header() {
    const [opened, { toggle }] = useDisclosure(false);
    const [active, setActive] = useState(links[0].link);
    const router = useRouter();


    const items = links.map((link) => (
        <a
            key={link.label}
            href={link.link}
            className={classes.link}
            data-active={active === link.link || undefined}
            onClick={(event) => {
                setActive(link.link);
            }}
        >
            {link.label}
        </a>
    ));

    return (
        <header className={classes.header}>
            <Container size="md" className={classes.inner}>
                <img src="/images/small_logo.svg" alt="SmartBudget" style={{paddingTop: 9}} onClick={()=> router.push('/')}/>
                <Group gap={5} visibleFrom="xs">
                    {items}
                </Group>
                <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
            </Container>
        </header>
    );
}
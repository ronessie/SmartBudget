import {Container, Group, Burger, Button} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from '../styles/header.module.css';
import {useRouter} from "next/navigation";

export default function Header() {
    const [opened, { toggle }] = useDisclosure(false);
    const router = useRouter();

    return (
        <header className={classes.header}>
            <Container size="md" className={classes.inner}>
                <img src="/images/small_logo.svg" alt="SmartBudget" style={{paddingTop: 9}} onClick={()=> router.push('/')}/>
                <Group gap={5} visibleFrom="xs">
                    <Button className={classes.button} onClick={()=> router.push('/main')}>Main</Button>
                    <Button className={classes.button} onClick={()=> router.push('/account')}>Account</Button>
                    <Button className={classes.button} onClick={()=> router.push('/addingCheck')}>AddingCheck</Button>
                    <Button className={classes.button} onClick={()=> router.push('/checks')}>Checks</Button>
                </Group>
                <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
            </Container>
        </header>
    );
}
import { Text, ActionIcon, Group, rem } from '@mantine/core';
import { IconBrandTwitter, IconBrandYoutube, IconBrandInstagram } from '@tabler/icons-react';
import classes from '../styles/footer.module.css';
import {useRouter} from "next/router";

export default function Footer() {
    const router = useRouter();

    return (
        <footer className={classes.footer}>
            <img src="/images/whiteLogo.svg" alt="SmartBudget" style={{paddingTop: 9}}
                 onClick={() => router.push('/')}/>
            <Text c="dimmed" size="sm">
                © 2024 mantine.dev. All rights reserved.
            </Text>

            <Group gap={0} className={classes.social} justify="flex-end" wrap="nowrap">
                <ActionIcon size="lg" color="gray" variant="subtle">
                    <IconBrandTwitter style={{width: rem(18), height: rem(18)}} stroke={1.5}/>
                </ActionIcon>
                <ActionIcon size="lg" color="gray" variant="subtle">
                    <IconBrandYoutube style={{width: rem(18), height: rem(18)}} stroke={1.5}/>
                </ActionIcon>
                <ActionIcon size="lg" color="gray" variant="subtle">
                    <IconBrandInstagram style={{width: rem(18), height: rem(18)}} stroke={1.5}/>
                </ActionIcon>
            </Group>
        </footer>
    );
}
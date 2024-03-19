import React from 'react';
import {Button, Container, Text, Title} from '@mantine/core';
import { useRouter } from 'next/router';

const Error500Page = () => {
    const router = useRouter();

    const handleBackHome = () => {
        router.push('/');
    };

    return (
        <Container size="sm">
            <img src='/images/500.png' style={{width: 500, height: 500, marginLeft: 100, marginTop: 100, marginBottom: 50}}/>
            <Title  order={1} style={{ marginBottom: 10, textAlign: "center"}}>
                Internal Server Error
            </Title>
            <Text  style={{ marginBottom: 20, textAlign: "center"}}>
                Sorry, something went wrong on our end. Please try again later.
            </Text>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button onClick={handleBackHome}>Go back to Home</Button>
            </div>
        </Container>
    );
};

export default Error500Page;
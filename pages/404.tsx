import React from 'react';
import {Button, Container, Image, Text, Title} from '@mantine/core';
import {useRouter} from 'next/router';

const Error404Page = () => {
    const router = useRouter();

    const handleBackHome = () => {
        router.push('/');
    };

    return (
        <Container size="sm">
            <Image src='/images/404.png' alt="Image 404"
                 style={{width: 500, height: 500, marginLeft: 100, marginTop: 100, marginBottom: 50}}/>
            <Title order={1} style={{marginBottom: 10, textAlign: "center"}}>
                Oops! Something went wrong
            </Title>
            <Text style={{marginBottom: 20, textAlign: "center"}}>
                We apologize, but it seems there was an internal server error.
            </Text>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <Button onClick={handleBackHome}>Go back to Home</Button>
            </div>
        </Container>
    );
};

export default Error404Page;
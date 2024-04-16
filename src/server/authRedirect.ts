import {getSession} from 'next-auth/react';

export async function authRedirect(ctx: any) {
    const session = await getSession(ctx);
    if (!session)
        return {
            destination: '/',
            permanent: false
        };
    return undefined;
}
import {getSession} from 'next-auth/react';

export async function authRedirect(ctx: any, destination: string) {
    const session = await getSession(ctx);

    if (!session) {
        return {
            destination,
            permanent: false
        };
    }

    return undefined;
}

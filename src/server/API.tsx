import IUser from '../types/IUser';

const {NEXTAUTH_URL} = process.env;

export namespace API {
    export async function getUser(
        username: string,
        ctx: any
    ): Promise<IUser> {
        const response = await fetch(`${NEXTAUTH_URL}/api/user/${username}`, {
            headers: {
                cookie: ctx.req.headers.cookie || ''
            }
        });

        if (!response.ok) throw new Error(response.statusText);

        const json = await response.json();

        return json.account;
    }

    export async function getAllUsers(): Promise<IUser[]> {
        const response = await fetch(`${NEXTAUTH_URL}/api/users`);

        if (!response.ok) throw new Error(response.statusText);

        const json = await response.json();

        return json.accounts;
    }
}
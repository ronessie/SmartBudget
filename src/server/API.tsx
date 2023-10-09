import IUser from '../types/IUser';
/*import Permissions from '../types/Permissions';
import IReport from '../types/IReport';*/

const { NEXTAUTH_URL } = process.env;

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
    /*export async function getUserPermission(
        username: string,
        ctx: any
    ): Promise<Permissions> {
        const response = await fetch(
            `${NEXTAUTH_URL}/api/user/permission/${username}`,
            {
                method: 'GET',
                headers: {
                    cookie: ctx.req.headers.cookie || ''
                }
            }
        );

        if (!response.ok) throw new Error(response.statusText);

        const json = await response.json();

        return json.permission;
    }

    export async function getAllReports(): Promise<IReport[]> {
        const response = await fetch(`${NEXTAUTH_URL}/api/reports`);

        if (!response.ok) throw new Error(response.statusText);

        const json = await response.json();

        return json.reports;
    }*/
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from "next-auth/providers/credentials"
import NextAuth from "next-auth";
import {connectToDatabase} from "@/src/database";
import IUser from "@/src/types/IUser";
import {createBankAccountObj, createUserObj} from "@/src/utils";
import {ObjectId} from "bson";

export default NextAuth({
    providers: [
        GoogleProvider({
            id: 'google',
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
        CredentialsProvider({
            id: "credentials",
            name: 'Credentials',
            credentials: {
                username: {label: "Username", type: "text"},
                password: {label: "Password", type: "password"}
            },
            async authorize(credentials, req) {
                if (!credentials) return false as any;

                const username = credentials.username;
                const password = credentials.password;
                console.log("credentials auth: ", username, password);

                return {
                    email: username,
                };
            }
        })
    ],
    secret: process.env.JWT_SECRET,
    pages: {
        signIn: '/',
        signOut: '/',
        error: '/'
    },
    callbacks: {
        async signIn({user, account, profile}) {
            if (account?.provider === 'google') {
                console.log('auth by google: ', user);

                const {db} = await connectToDatabase();

                const userExists = ((await db
                    .collection('users')
                    .find()
                    .toArray()) as IUser[]).find((u: IUser) => u.email === user.email);

                if (userExists) {
                    return true;
                }

                const bankAccount_id = new ObjectId().toString();
                const userPassword = new ObjectId().toString()

                const userCollection = await db.collection('users');
                const userObj = createUserObj(user?.name ?? profile?.name ?? 'unknown', user.email!, userPassword, bankAccount_id);
                await userCollection.insertOne(userObj);

                const bankCollection = await db.collection('bankAccounts');
                const bankAccount = createBankAccountObj(userObj._id, bankAccount_id);
                await bankCollection.insertOne(bankAccount);
            } else {
                const username = user.name;
                const email = user.email;
                console.log(`unknown auth: ${username} ${email}`)
            }

            return true;
        }
    }
});

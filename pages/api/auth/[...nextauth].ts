import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from "next-auth/providers/credentials"
import NextAuth from "next-auth";

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
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
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
        async signIn(props) {
            const username = props.user.name;
            const email = props.user.email;
            console.log(username +" bebebe "+ email)
            return true;
        }
    }
});
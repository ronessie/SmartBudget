import GoogleProvider from 'next-auth/providers/google';
import NextAuth from "next-auth";

export default NextAuth({
    providers: [
        GoogleProvider({
            id: 'google',
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
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
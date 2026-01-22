import NextAuth, { DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

// Extend session types
declare module "next-auth" {
    interface Session {
        user: {
            _id: string;
            role: string;
            token: string;
        } & DefaultSession["user"]
    }
    interface User {
        _id: string;
        role: string;
        token: string;
    }
}

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, credentials);
                    if (res.data) {
                        const { user, token } = res.data;
                        return { ...user, token };
                    }
                    return null;
                } catch (e) {
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.user = user;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.user) {
                session.user = token.user as any;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login', // Optional custom login page
    }
});

export { handler as GET, handler as POST };

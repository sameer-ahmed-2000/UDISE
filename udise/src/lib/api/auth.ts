import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

export const authConfig: NextAuthOptions = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, account }: { token: JWT; account: any }) {
            if (account) {
                token.accessToken = account.access_token
            }
            return token
        },
        async session({ session, token }: { session: any; token: JWT }) {
            session.accessToken = token.accessToken
            return session
        },
    },
    providers: [], // Add providers with an empty array for now
}

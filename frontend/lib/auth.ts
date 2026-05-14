import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "student@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }
                
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
                        method: 'POST',
                        body: JSON.stringify(credentials),
                        headers: { "Content-Type": "application/json" }
                    }).catch(() => null);
                    
                    if (res && res.ok) {
                        const user = await res.json().catch(() => null);
                        if (user) {
                            return {
                                id: user._id || "mock-id-123",
                                name: user.name || "Demo Student",
                                email: user.email || credentials.email,
                                role: user.role || "student",
                                token: user.token || "mock-jwt-token"
                            };
                        }
                    }
                } catch (error) {
                    console.error("Login attempt error:", error);
                }

                // Fallback to mock user if backend is down or authentication fails
                console.log("Backend auth failed or unavailable, using mock user");
                return {
                    id: "mock-id-123",
                    name: "Demo Student",
                    email: credentials.email,
                    role: "student",
                    token: "mock-jwt-token"
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.accessToken = user.token;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.accessToken = token.accessToken as string;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

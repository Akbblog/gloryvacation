import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                await connectDB();

                const user = await User.findOne({ email: credentials.email });

                if (!user) {
                    throw new Error("User not found");
                }

                const isPasswordMatch = await bcrypt.compare(credentials.password, user.password || "");

                if (!isPasswordMatch) {
                    throw new Error("Invalid password");
                }

                if (!user.isApproved) {
                    throw new Error("Account pending approval");
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "development-secret-key",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

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
                try {
                    if (!credentials?.email || !credentials?.password) {
                        console.log("Auth attempt with missing credentials");
                        return null;
                    }

                    console.log("Auth attempt for:", credentials.email);

                    await connectDB();

                    const user = await User.findOne({ email: credentials.email });

                    if (!user) {
                        console.log("User not found for email:", credentials.email);
                        return null;
                    }

                    console.log("User found:", user.email, user.role, user.isApproved, !!user.password);

                    const isPasswordMatch = await bcrypt.compare(credentials.password, user.password || "");

                    if (!isPasswordMatch) {
                        console.log("Password mismatch for user:", user.email);
                        return null;
                    }

                    if (!user.isApproved) {
                        console.log("Account not approved for user:", user.email);
                        return null;
                    }

                    console.log("Auth successful for user:", user.email, user.role);

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role,
                        permissions: user.permissions,
                    };
                } catch (err) {
                    console.error("authorize error:", err);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.permissions = user.permissions;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.permissions = token.permissions;
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
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

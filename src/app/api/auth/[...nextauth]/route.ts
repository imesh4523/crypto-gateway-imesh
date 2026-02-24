import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import { headers } from "next/headers";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                token: { label: "2FA Token", type: "text" } // Optional, passed if 2FA is required
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const headersList = await headers();
                const forwardedFor = headersList.get("x-forwarded-for");
                const realIp = headersList.get("x-real-ip");
                const ip = forwardedFor?.split(",")[0] || realIp || "127.0.0.1";
                const userAgent = headersList.get("user-agent") || "Unknown Browser";

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user || !user.password) {
                    throw new Error("Invalid credentials");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                if (!isPasswordValid) {
                    // Log failed attempt
                    await prisma.loginHistory.create({
                        data: {
                            userId: user.id,
                            ipAddress: ip,
                            userAgent: userAgent,
                            location: "Parsed from IP",
                            status: "FAILED_PASSWORD"
                        }
                    });
                    throw new Error("Invalid credentials");
                }

                // --- 2FA Verification Flow ---
                if (user.twoFactorEnabled && user.twoFactorSecret) {
                    // If they haven't provided a token yet, tell the frontend to prompt for it
                    if (!credentials.token) {
                        // Return a specific error string the frontend can catch
                        throw new Error("2FA_REQUIRED");
                    }

                    // Verify the token with speakeasy
                    const isValidToken = speakeasy.totp.verify({
                        secret: user.twoFactorSecret,
                        encoding: 'base32',
                        token: credentials.token,
                        window: 1
                    });

                    if (!isValidToken) {
                        await prisma.loginHistory.create({
                            data: {
                                userId: user.id,
                                ipAddress: ip,
                                userAgent: userAgent,
                                location: "Parsed from IP",
                                status: "FAILED_2FA"
                            }
                        });
                        throw new Error("Invalid 2FA token");
                    }
                }

                // Log SUCCESS attempt
                await prisma.loginHistory.create({
                    data: {
                        userId: user.id,
                        ipAddress: ip,
                        userAgent: userAgent,
                        location: "Parsed from IP",
                        status: "SUCCESS"
                    }
                });

                return user;
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

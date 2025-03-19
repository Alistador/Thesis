import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import NextAuth from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          active: true,
        };
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          active: true,
        };
      },
    }),
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "hello@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Please provide both email and password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("No account found with this email address");
        if (!user.password)
          throw new Error("Use the provider you originally signed up with");

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid)
          throw new Error("Invalid password. Please try again");

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          active: user.active ?? false,
        };
      },
    }),
  ],
  pages: {
    signIn: "/dashboard",
    signOut: "/",
    error: "/?error=true",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // For sign-out, redirect to the home page without parameters
      if (url.includes("/signout") || url.includes("/api/auth/signout")) {
        return baseUrl;
      }

      // For sign-in, redirect to dashboard
      if (
        url.includes("/signin") ||
        url.includes("/api/auth/signin") ||
        url === baseUrl
      ) {
        return `${baseUrl}/dashboard`;
      }

      // For callback URLs (e.g. from OAuth providers), redirect to dashboard
      if (url.includes("/callback")) {
        return `${baseUrl}/dashboard`;
      }

      // If the URL is already fully qualified and within our site, respect it
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Default fallback to dashboard
      return `${baseUrl}/dashboard`;
    },
    // JWT callback
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.active = user.active ?? true;
        token.name = user.name;
      }
      return token;
    },
    // Session callback
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.active = token.active as boolean;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

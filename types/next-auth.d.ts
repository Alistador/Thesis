import NextAuth, { DefaultSession, DefaultUser, DefaultJWT } from "next-auth";

// Extend the default User type in NextAuth
declare module "next-auth" {
  interface User extends DefaultUser {
    active?: boolean;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      active?: boolean;
    } & DefaultSession["user"];
  }
}

// Extend the default JWT type in NextAuth
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    active?: boolean;
  }
}

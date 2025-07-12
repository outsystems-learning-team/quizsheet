import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/schema";
import type { Account, Profile, User } from "next-auth"; // User, Account, Profile をインポート

const authOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      authorization: { params: { scope: 'read:user user:email' } }, // メールアドレス取得のためのスコープを追加
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile, email, credentials }: { user: User; account: Account | null; profile?: Profile; email?: { verificationRequest?: boolean }; credentials?: Record<string, any> /* eslint-disable-line @typescript-eslint/no-explicit-any */ }) {
      console.log("Sign In Callback:");
      console.log("User:", user);
      console.log("Account:", account);
      console.log("Profile:", profile);
      console.log("Email:", email);
      console.log("Credentials:", credentials);
      return true; // 認証を続行
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

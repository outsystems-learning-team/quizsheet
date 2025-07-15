
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user_quiz_attempts } from '@/lib/schema';
import { getServerSession } from "next-auth/next"
import { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, sessions, users, verificationTokens } from "@/lib/schema";
import type { Session, User } from 'next-auth';

// This is a temporary workaround to avoid exporting authOptions from the [...nextauth] route
// which causes a build error. Ideally, this should be shared.
const authOptions: NextAuthOptions = {
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
      authorization: { params: { scope: 'read:user user:email' } },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }: { session: Session; user: User }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const { quizQuestionId, isCorrect, userAnswer, timeTakenSeconds } = body;

    if (quizQuestionId === undefined || isCorrect === undefined || userAnswer === undefined) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const newAttempt = await db.insert(user_quiz_attempts).values({
      userId: session.user.id,
      quizQuestionId: quizQuestionId,
      isCorrect: isCorrect,
      userAnswer: userAnswer,
      timeTakenSeconds: timeTakenSeconds,
    }).returning();

    return NextResponse.json(newAttempt[0]);
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

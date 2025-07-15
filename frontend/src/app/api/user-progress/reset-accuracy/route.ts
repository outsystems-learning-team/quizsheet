import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { user_quiz_attempts } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;

  try {
    await db.delete(user_quiz_attempts).where(eq(user_quiz_attempts.userId, userId));

    console.log(`ユーザー ${userId} の正答率データをリセットしました。`);
    return NextResponse.json({ message: '正答率データがリセットされました。' });
  } catch (error) {
    console.error('Error resetting accuracy:', error);
    return NextResponse.json({ error: '正答率のリセットに失敗しました。' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // ここにユーザーの学習履歴データをリセットするロジックを実装します。
    // 現時点ではダミーデータなので、成功レスポンスを返すだけです。
    console.log('正答率データをリセットしました（ダミー処理）');
    return NextResponse.json({ message: '正答率データがリセットされました。' });
  } catch (error) {
    console.error('Error resetting accuracy:', error);
    return NextResponse.json({ error: '正答率のリセットに失敗しました。' }, { status: 500 });
  }
}

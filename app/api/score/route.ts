import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';

/**
 * スコアデータを取得するAPIエンドポイント
 * score.dbから全件のスコアデータを取得して返す
 */
export async function GET() {
    try {
        // score.dbを読み取り専用で開く
        const db = new Database('./db/score.db', { readonly: true });

        // 全スコアデータを取得
        const scores = db.prepare('SELECT * FROM score').all();

        // データベース接続を閉じる
        db.close();

        // JSON形式でスコアデータを返す
        return NextResponse.json(scores);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
    }
}
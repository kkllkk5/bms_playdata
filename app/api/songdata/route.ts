import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';

/**
 * 楽曲データのインターフェース定義
 */
export interface SongRecord {
    md5: string;          // MD5ハッシュ
    sha256: string;       // SHA256ハッシュ（主キー）
    title: string;        // 曲名
    subtitle: string;     // サブタイトル
    genre: string;        // ジャンル
    artist: string;       // アーティスト
    subartist: string;    // サブアーティスト
    parent: string;       // 親曲
    mode: number;         // モード
    judge: number;        // 判定数
    feature: number;      // 特徴
    content: number;      // コンテンツ
    date: number;         // 日付
    adddate: number;      // 追加日付
    notes: number;        // ノーツ数
    charthash: string;    // チャートハッシュ
}

/**
 * 楽曲データを取得するAPIエンドポイント
 * songdata.dbから楽曲情報を取得し、sha256をキーとした連想配列で返す
 */
export async function GET() {
    try {
        // songdata.dbを読み取り専用で開く
        const db = new Database('./db/songdata.db', { readonly: true });

        // 必要なカラムのみ取得（sha256, title, subtitle）
        const songs = db.prepare('SELECT \
            sha256, \
            title, \
            subtitle \
                FROM song ').all() as SongRecord[];

        // データベース接続を閉じる
        db.close();

        // sha256をキーとした連想配列に変換（スコアデータとの統合用）
        const songsMap: { [key: string]: SongRecord } = {};
        songs.forEach((song: SongRecord) => {
            songsMap[song.sha256] = song;
        });

        // JSON形式で楽曲データを返す
        return NextResponse.json(songsMap);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
    }
}
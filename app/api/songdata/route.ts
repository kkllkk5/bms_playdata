import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';

export interface SongRecord {
    md5: string;
    sha256: string;
    title: string;
    subtitle: string;
    genre: string;
    artist: string;
    subartist: string;
    parent: string;
    mode: number;
    judge: number;
    feature: number;
    content: number;
    date: number;
    adddate: number;
    notes: number;
    charthash: string;
}

export async function GET() {
    try {
        const db = new Database('./db/songdata.db', { readonly: true });

        const songs = db.prepare('SELECT \
            sha256, \
            title, \
            subtitle \
                FROM song ').all() as SongRecord[];

        db.close();

        // sha256をキーとした連想配列に変換
        const songsMap: { [key: string]: SongRecord } = {};
        songs.forEach((song: SongRecord) => {
            songsMap[song.sha256] = song;
        });

        return NextResponse.json(songsMap);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
    }
}
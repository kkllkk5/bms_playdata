import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';

export async function GET() {
    try {
        const db = new Database('./db/score.db', { readonly: true });

        const scores = db.prepare('SELECT * FROM score').all();

        db.close();

        return NextResponse.json(scores);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
    }
}
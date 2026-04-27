import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

/**
 * テーブルデータを取得するAPIエンドポイント
 * satellite_table.csv と stella_table.csv を読み込んで返す
 */
export async function GET() {
    try {
        // Satelliteテーブルデータの読み込みとパース
        const slFilePath = path.join(process.cwd(), 'db', 'satellite_table.csv');
        const slCsvText = fs.readFileSync(slFilePath, 'utf8');
        const slRecords = Papa.parse(slCsvText, {
            header: true,        // 最初の行をヘッダーとして扱う
            skipEmptyLines: true, // 空行をスキップ
            dynamicTyping: true   // 自動型変換を有効化
        }).data;

        // Stellaテーブルデータの読み込みとパース
        const stFilePath = path.join(process.cwd(), 'db', 'stella_table.csv');
        const stCsvText = fs.readFileSync(stFilePath, 'utf8');
        const stRecords = Papa.parse(stCsvText, {
            header: true,        // 最初の行をヘッダーとして扱う
            skipEmptyLines: true, // 空行をスキップ
            dynamicTyping: true   // 自動型変換を有効化
        }).data;

        // 両方のテーブルデータをJSONで返す
        return NextResponse.json({ slRecords, stRecords });
    } catch (error) {
        console.error('CSV read error:', error);
        return NextResponse.json({ error: 'Failed to read CSV' }, { status: 500 });
    }
}
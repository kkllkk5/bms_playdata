import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function parseCsv(csvText: string) {
    const lines = csvText.trim().split(/\r?\n/);
    const headers = lines[0].split(',').map(header => header.trim());

    return lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim());
        return headers.reduce<Record<string, string>>((row, header, index) => {
            row[header] = values[index] ?? '';
            return row;
        }, {});
    });
}

export async function GET() {
    try {
        const slFilePath = path.join(process.cwd(), 'db', 'satellite_table.csv');
        const slCsvText = fs.readFileSync(slFilePath, 'utf8');
        const slRecords = parseCsv(slCsvText);

        const stFilePath = path.join(process.cwd(), 'db', 'stella_table.csv');
        const stCsvText = fs.readFileSync(stFilePath, 'utf8');
        const stRecords = parseCsv(stCsvText);

        return NextResponse.json({ slRecords, stRecords });
    } catch (error) {
        console.error('CSV read error:', error);
        return NextResponse.json({ error: 'Failed to read CSV' }, { status: 500 });
    }
}
import { ScoreRecord } from './scoreTable';

/**
 * 集計表コンポーネント - 難易度×クリアランプのクロス集計を表示
 */
export function SummaryTable({ data }: { data: ScoreRecord[] }) {
    // クリアランプの順序定義
    const clearLampOrder = ['NO PLAY', 'FAILED', 'ASSIST CLEAR', 'EASY', 'CLEAR', 'HARD', 'EX-HARD', 'FULL COMBO', 'PERFECT'];

    // クロス集計データの作成（難易度×クリアランプ）
    const crossTabData = data.reduce<Record<string, Record<string, number>>>((acc, score) => {
        const difficulty = score.tableDifficulty?.trim() || 'Unknown';
        if (difficulty === 'Unknown') {
            return acc; // 難易度不明は集計から除外
        }
        const clearLamp = getClearLampName(score.clear);

        if (!acc[difficulty]) {
            acc[difficulty] = {};
        }
        acc[difficulty][clearLamp] = (acc[difficulty][clearLamp] || 0) + 1;

        return acc;
    }, {});

    // 難易度のソート（Unknownを最後に）
    const sortedDifficulties = Object.keys(crossTabData).sort((a, b) => {
        if (a === 'Unknown') return 1;
        if (b === 'Unknown') return -1;

        // プレフィックス（sl, stなど）と数字部分を抽出
        const prefixA = a.replace(/\d/g, '');
        const prefixB = b.replace(/\d/g, '');
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;

        // プレフィックスで比較（slがstより先）
        if (prefixA !== prefixB) {
            return prefixA.localeCompare(prefixB);
        }

        // 同じプレフィックスの場合は数字で比較
        return numA - numB;
    },);


    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                            <th className="px-4 py-3 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                                難易度
                            </th>
                            {clearLampOrder.map(clearLamp => (
                                <th key={clearLamp} className="px-4 py-3 border-b text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {clearLamp}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedDifficulties.map(difficulty => (
                            <tr key={difficulty} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                <td className="px-4 py-3 border-b text-sm text-gray-900 dark:text-gray-100 font-medium">
                                    {difficulty}
                                </td>
                                {clearLampOrder.map(clearLamp => (
                                    <td key={clearLamp} className="px-4 py-3 border-b text-center text-sm text-gray-900 dark:text-gray-100">
                                        {crossTabData[difficulty][clearLamp] || 0}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/**
 * クリアランプの数値から名前を取得する関数
 */
function getClearLampName(clear: number): string {
    const clearlamp_map: { [key: number]: string } = {
        0: "NO PLAY",
        1: "FAILED",
        2: "",
        3: "ASSIST CLEAR",
        4: "EASY",
        5: "CLEAR",
        6: "HARD",
        7: "EX-HARD",
        8: "FULL COMBO",
        9: "PERFECT"
    };
    return clearlamp_map[clear] || "UNKNOWN";
}
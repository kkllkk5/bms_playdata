export interface ScoreRecord {
    sha256: string;
    mode: number;
    clear: number;
    epg: number;
    lpg: number;
    egr: number;
    lgr: number;
    egd: number;
    lgd: number;
    ebd: number;
    lbd: number;
    epr: number;
    lpr: number;
    ems: number;
    lms: number;
    notes: number;
    combo: number;
    minbp: number;
    playcount: number;
    clearcount: number;
    trophy: string;
    ghost: string;
    scorehash: string;
    option: number;
    random: number;
    date: number;
    state: number;
    seed: number;
    avgjudge: number;
    title?: string; // songDataから統合されるタイトル
    tableDifficulty?: string; // tableDataから統合される難易度
}

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
}

const option_map: { [key: number]: string } = {
    0: "NORMAL",
    1: "MIRROR",
    2: "RANDOM",
    3: "R-RANDOM",
    4: "S-RANDOM",
    5: "SPIRAL",
    6: "H-RANDOM",
    7: "ALL-SCR",
    8: "RANDOM+",
    9: "S-RANDOM+",
};

const mode_map: { [key: number]: string } = {
    0: "",
    1: "CN",
    2: "HCN",
}

// 数値で保存されている日付をYYYY/MM/DD形式へと変換する
function formatDate(timeNumber: number): string {
    // ミリ秒に変換（ここ重要）
    const date = new Date(timeNumber * 1000);

    const formatted = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')
        }/${String(date.getDate()).padStart(2, '0')
        }`;
    return formatted;
}

export function ScoreTable({ data }: { data: ScoreRecord[] }) {
    const getStatusColor = (clear: number): string => {
        switch (clear) {
            case 0:
                return 'bg-gray-300 dark:bg-gray-700';
            case 1:
                return 'animate-flash-red';
            case 3:
                return 'bg-purple-300 dark:bg-purple-600';
            case 4:
                return 'bg-lime-300 dark:bg-lime-600';
            case 5:
                return 'bg-cyan-300 dark:bg-cyan-500';
            case 6:
                return 'bg-white dark:bg-gray-200 border-1 border-gray-400 dark:border-gray-500';
            case 7:
                return 'bg-yellow-300 dark:bg-yellow-600';
            case 8:
            case 9:
                return 'animate-pulse-cyan';
            default:
                return '';
        }
    };

    return (
        <>
            <style>{`
                @keyframes flash-red {
                    0%, 100% { background-color: #374151; }
                    50% { background-color: #dc2626; }
                }
                .animate-flash-red {
                    animation: flash-red 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes white-cyan {
                    0%, 100% { background-color: #e0f7fa; }
                    50% { background-color: #06b6d4; }
                }
                .dark .animate-pulse-cyan {
                    animation: white-cyan 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                .animate-pulse-cyan {
                    animation: white-cyan 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
            <table className="min-w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700">
                <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                        <th className="px-4 py-2 w-1 border-b"></th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">曲名</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">難易度表</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">CNモード</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">Clear</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">PGREAT</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">GREAT</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">GOOD</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">BAD</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">POOR</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">空POOR</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">総ノーツ数</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">最大コンボ</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">最小BP</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">プレイ回数</th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">クリア回数</th>
                        {/*<th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">Trophy</th>*/}
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">オプション</th>
                        {/*<th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">Random</th>*/}
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">Date</th>
                        {/*<th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">State</th>*/}
                        {/* <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">Seed</th> */}
                        {/*<th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-900 dark:text-gray-100">Avg Judge</th> */}
                    </tr>
                </thead>
                <tbody>
                    {data.filter(score => score.title !== 'Unknown').map((score, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                            <td className={`w-1 border-b ${getStatusColor(score.clear)}`}></td>
                            <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.title}</td>
                            <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.tableDifficulty}</td>
                            <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{mode_map[score.mode]}</td>
                            <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{clearlamp_map[score.clear]}</td>
                            <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.epg + score.lpg}</td>
                            <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.egr + score.lgr}</td>
                            <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.egd + score.lgd}</td>
                            <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.ebd + score.lbd}</td>
                            <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.epr + score.lpr}</td>
                            <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.ems + score.lms}</td>
                            <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.notes}</td>
                            <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.combo}</td>
                            <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.minbp}</td>
                            <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.playcount}</td>
                            <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.clearcount}</td>
                            {/*<td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.trophy}</td>*/}
                            <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{option_map[score.option]}</td>
                            {/*<td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.random}</td>*/}
                            <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{formatDate(score.date)}</td>
                            {/*<td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.state}</td>
                        */}
                            {/* <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.seed}</td> */}
                            {/* <td className="px-4 py-2 border-b text-sm text-gray-900 dark:text-gray-100">{score.avgjudge}</td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
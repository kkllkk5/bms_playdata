/**
 * スコアデータのインターフェース定義
 */
export interface ScoreRecord {
    sha256: string;           // SHA256ハッシュ（楽曲識別子）
    mode: number;             // モード（CN, HCNなど）
    clear: number;            // クリアランプ（0-9の数値）
    epg: number;              // EASY PERFECT GREAT
    lpg: number;              // LIGHT PERFECT GREAT
    egr: number;              // EASY GREAT
    lgr: number;              // LIGHT GREAT
    egd: number;              // EASY GOOD
    lgd: number;              // LIGHT GOOD
    ebd: number;              // EASY BAD
    lbd: number;              // LIGHT BAD
    epr: number;              // EASY POOR
    lpr: number;              // LIGHT POOR
    ems: number;              // EASY MISS
    lms: number;              // LIGHT MISS
    notes: number;            // 総ノーツ数
    combo: number;            // 最大コンボ数
    minbp: number;            // 最小BAD数
    playcount: number;        // プレイ回数
    clearcount: number;       // クリア回数
    trophy: string;           // トロフィー
    ghost: string;            // ゴーストデータ
    scorehash: string;        // スコアハッシュ
    option: number;           // オプション設定
    random: number;           // ランダム設定
    date: number;             // 日付（Unixタイムスタンプ）
    state: number;            // 状態
    seed: number;             // シード値
    avgjudge: number;         // 平均判定
    title?: string;           // songDataから統合されるタイトル
    tableDifficulty?: string; // tableDataから統合される難易度
}

/**
 * クリアランプの数値と文字列のマッピング
 */
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

/**
 * オプション設定の数値と文字列のマッピング
 */
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

/**
 * モード設定の数値と文字列のマッピング
 */
const mode_map: { [key: number]: string } = {
    0: "",
    1: "CN",
    2: "HCN",
}

/**
 * UnixタイムスタンプをYYYY/MM/DD形式に変換する関数
 * @param timeNumber - Unixタイムスタンプ（秒単位）
 * @returns YYYY/MM/DD形式の日付文字列
 */
function formatDate(timeNumber: number): string {
    // ミリ秒に変換（ここ重要）
    const date = new Date(timeNumber * 1000);

    const formatted = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')
        }/${String(date.getDate()).padStart(2, '0')
        }`;
    return formatted;
}

/**
 * スコアデータを表形式で表示するコンポーネント
 * @param data - 表示するスコアデータの配列
 */
export function ScoreTable({ data }: { data: ScoreRecord[] }) {
    /**
     * クリアランプに応じた背景色を取得する関数
     * @param clear - クリアランプの数値
     * @returns Tailwind CSSのクラス名
     */
    const getStatusColor = (clear: number): string => {
        switch (clear) {
            case 0:
                return 'bg-gray-300 dark:bg-gray-700';  // NO PLAY
            case 1:
                return 'animate-flash-red';             // FAILED（赤色点滅）
            case 3:
                return 'bg-purple-300 dark:bg-purple-600'; // ASSIST CLEAR
            case 4:
                return 'bg-lime-300 dark:bg-lime-600';   // EASY
            case 5:
                return 'bg-cyan-300 dark:bg-cyan-500';   // CLEAR
            case 6:
                return 'bg-white dark:bg-gray-200 border-1 border-gray-400 dark:border-gray-500'; // HARD
            case 7:
                return 'bg-yellow-300 dark:bg-yellow-600'; // EX-HARD
            case 8:
            case 9:
                return 'animate-pulse-cyan';             // FULL COMBO/PERFECT（シアン色点滅）
            default:
                return '';
        }
    };

    return (
        <>
            {/* カスタムアニメーションのCSS定義 */}
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

            {/* スコアデータ表示テーブル */}
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
                    {/* Unknownタイトルを除外して表示 */}
                    {data.filter(score => score.title !== 'Unknown').map((score, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                            {/* クリアランプ表示用の色付きカラム */}
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
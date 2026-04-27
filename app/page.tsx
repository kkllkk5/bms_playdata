'use client';
import { useEffect, useState } from 'react';
import { SongRecord } from './api/songdata/route';
import { ScoreTable, ScoreRecord } from './component/scoreTable';
import { SummaryTable } from './component/summaryTable';

// 1ページあたりの表示件数
const ITEMS_PER_PAGE = 50;

/**
 * テーブルデータから難易度を取得する関数
 * @param sha256 - 楽曲のSHA256ハッシュ
 * @param stRecords - Stellaテーブルデータ
 * @param slRecords - Satelliteテーブルデータ
 * @returns 難易度文字列（例: "st12", "sl10"）
 */
function findTableDifficulty(
  sha256: string,
  stRecords: any[],
  slRecords: any[]
): string {
  const getLastValue = (record: any) => {
    if (!record) return undefined
    const values = Object.values(record)
    return values[values.length - 1]
  }

  const st = stRecords.find(r => r.sha256 === sha256)
  if (st) {
    const last = getLastValue(st)
    if (last) return "st" + last
  }

  const sl = slRecords.find(r => r.sha256 === sha256)
  if (sl) {
    const last = getLastValue(sl)
    if (last) return "sl" + last
  }

  return ""
}

/**
 * メインコンポーネント - スコアデータと楽曲データを統合して表示
 */
export default function Home() {
  // 状態管理
  const [scoreData, setScoreData] = useState<ScoreRecord[]>([]);  // 統合されたスコアデータ
  const [loading, setLoading] = useState(true);                  // ローディング状態
  const [error, setError] = useState<string | null>(null);       // エラー状態
  const [currentPage, setCurrentPage] = useState(1);             // 現在のページ番号
  const [searchKeyword, setSearchKeyword] = useState('');        // 検索キーワード
  const [searchInput, setSearchInput] = useState('');            // 検索入力値
  const [viewMode, setViewMode] = useState<'score' | 'summary'>('score'); // 表示モード

  /**
   * データ取得処理 - 起動時に両方のDBからデータを取得
   */
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // 両方のデータを並行して取得
        const [scoreResponse, songResponse, tableResponse] = await Promise.all([
          fetch('/api/score'),
          fetch('/api/songdata'),
          fetch('/api/table')
        ]);

        if (!scoreResponse.ok || !songResponse.ok || !tableResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const scores: ScoreRecord[] = await scoreResponse.json();
        const songs: { [key: string]: SongRecord } = await songResponse.json();
        const { slRecords, stRecords } = await tableResponse.json();

        // scoreDataにsongDataのtitleを統合
        const scoresWithTitles = scores.map(score => ({
          ...score,
          title: songs[score.sha256]?.title + songs[score.sha256]?.subtitle || 'Unknown',
          tableDifficulty: findTableDifficulty(score.sha256, stRecords, slRecords) || ''
        }));

        setScoreData(scoresWithTitles);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // フィルタリング処理 - 検索キーワードによる絞り込み
  const filteredData = searchKeyword
    ? scoreData.filter(score =>
      score.title?.toLowerCase().includes(searchKeyword.toLowerCase())
    )
    : scoreData;

  // 難易度別集計データの作成
  const difficultyCounts = filteredData.reduce<Record<string, number>>((acc, score) => {
    const difficulty = score.tableDifficulty?.trim() || 'Unknown';
    if (difficulty != 'Unknown') {
      acc[difficulty] = (acc[difficulty] || 0) + 1;
    }
    return acc;
  }, {});

  // ページング計算
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // 検索実行ハンドラー
  const handleSearch = () => {
    setSearchKeyword(searchInput);
    setCurrentPage(1);
  };

  // Enterキーで検索実行
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex flex-1 w-full max-w-6xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
          <p className="text-lg">Loading data...</p>
        </main>
      </div>
    );
  }

  // エラー表示
  if (error) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex flex-1 w-full max-w-6xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
          <p className="text-lg text-red-600">Error: {error}</p>
        </main>
      </div>
    );
  }

  // メインUI
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-6xl flex-col items-center py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold mb-8 text-black dark:text-zinc-50">
          Score Data with Song Titles
        </h1>

        {/* 表示モード切り替えボタン */}
        <div className="w-full mb-8 flex gap-2">
          <button
            onClick={() => setViewMode('score')}
            className={`px-6 py-2 rounded font-medium ${viewMode === 'score'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            スコア表
          </button>
          <button
            onClick={() => setViewMode('summary')}
            className={`px-6 py-2 rounded font-medium ${viewMode === 'summary'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            集計表
          </button>
        </div>

        {/* 検索ボックス */}
        <div className="w-full mb-8 flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="曲名を入力..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium"
          >
            検索
          </button>
          {searchKeyword && (
            <button
              onClick={() => {
                setSearchKeyword('');
                setSearchInput('');
                setCurrentPage(1);
              }}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-medium"
            >
              クリア
            </button>
          )}
        </div>

        {/* スコア表表示モード */}
        {viewMode === 'score' && (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
              {searchKeyword ? `検索結果: ${filteredData.length} / ${scoreData.length} 件` : `全件: ${scoreData.length} 件`}
              {filteredData.length > 0 && ` - Page ${currentPage} of ${totalPages}`}
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              (CNモードの空欄はLN or ロングなし)
            </p>

            <div className="w-full overflow-x-auto">
              {filteredData.length > 0 ? (
                <ScoreTable data={paginatedData} />
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">該当する曲がありません</p>
              )}
            </div>

            {/* ページングコントロール */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600"
              >
                Previous
              </button>
              <span className="text-gray-700 dark:text-gray-300">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* 集計表表示モード */}
        {viewMode === 'summary' && (
          <SummaryTable data={filteredData} />
        )}
      </main>
    </div>
  )
}
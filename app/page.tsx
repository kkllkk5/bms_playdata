'use client';
import { useEffect, useState } from 'react';
import { SongRecord } from './api/songdata/route';
import { ScoreTable, ScoreRecord } from './component/scoreTable';

const ITEMS_PER_PAGE = 50;

export default function Home() {
  const [scoreData, setScoreData] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // 両方のデータを並行して取得
        const [scoreResponse, songResponse] = await Promise.all([
          fetch('/api/score'),
          fetch('/api/songdata')
        ]);

        if (!scoreResponse.ok || !songResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const scores: ScoreRecord[] = await scoreResponse.json();
        const songs: { [key: string]: SongRecord } = await songResponse.json();

        // scoreDataにsongDataのtitleを統合
        const scoresWithTitles = scores.map(score => ({
          ...score,
          title: songs[score.sha256]?.title + songs[score.sha256]?.subtitle || 'Unknown'
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

  // フィルタリング
  const filteredData = searchKeyword
    ? scoreData.filter(score =>
      score.title?.toLowerCase().includes(searchKeyword.toLowerCase())
    )
    : scoreData;

  // ページング計算
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // 検索実行
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

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex flex-1 w-full max-w-6xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
          <p className="text-lg">Loading data...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex flex-1 w-full max-w-6xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
          <p className="text-lg text-red-600">Error: {error}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-6xl flex-col items-center py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold mb-8 text-black dark:text-zinc-50">
          Score Data with Song Titles
        </h1>

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

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          {searchKeyword ? `検索結果: ${filteredData.length} / ${scoreData.length} 件` : `全件: ${scoreData.length} 件`}
          {filteredData.length > 0 && ` - Page ${currentPage} of ${totalPages}`}
        </p>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4"
        >
          (CNモードの空欄はLN or ロングなし)
        </p>

        <div className="w-full overflow-x-auto">
          {filteredData.length > 0 ? (
            <ScoreTable data={paginatedData} />
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">該当する曲がありません</p>
          )}
        </div>
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
      </main>
    </div>
  );
}
/** @param {{ progress: { currentLevel: number, levelProgress: number, totalCorrect: number, totalReviewed: number } }} props */
export function ProgressBar({ progress }) {
  const { currentLevel = 1, levelProgress = 0, totalCorrect = 0, totalReviewed = 0 } = progress ?? {};

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
      <div className="flex justify-between text-xs text-gray-400">
        <span className="font-medium text-indigo-500">Level {currentLevel}</span>
        <span>{totalCorrect} correct &middot; {totalReviewed} reviewed</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${levelProgress}%` }}
        />
      </div>
      <p className="text-right text-xs text-gray-300">{levelProgress}% to level {currentLevel + 1}</p>
    </div>
  );
}

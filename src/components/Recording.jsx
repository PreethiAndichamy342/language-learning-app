import { useRecording } from '../hooks/useRecording.js';

const ScoreRing = ({ score }) => {
  const color = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-400';
  return (
    <div className={`text-4xl font-bold ${color} text-center`}>{score}%</div>
  );
};

/** @param {{ card: Object, onResult: (quality: number) => void, language: string }} props */
export function Recording({ card, onResult, language }) {
  const { isRecording, score, feedback, start, stop, submit } = useRecording(card, language, onResult);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
      <div className="flex justify-center">
        <button
          onPointerDown={start}
          onPointerUp={stop}
          onPointerLeave={stop}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-150 select-none
            ${isRecording
              ? 'bg-red-500 scale-110 ring-4 ring-red-200 animate-pulse'
              : 'bg-indigo-500 hover:bg-indigo-600 active:scale-95 shadow-lg shadow-indigo-200'
            }`}
          aria-label={isRecording ? 'Recording' : 'Hold to record'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/>
          </svg>
        </button>
      </div>

      <p className="text-center text-xs text-gray-400">
        {isRecording ? 'Listening… release to stop' : 'Hold button and speak the sentence'}
      </p>

      {score !== null && (
        <div className="space-y-3 border-t pt-4">
          <ScoreRing score={score} />
          <p className="text-center text-sm text-gray-500">{feedback}</p>
          <button
            onClick={submit}
            className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Next card
          </button>
        </div>
      )}
    </div>
  );
}

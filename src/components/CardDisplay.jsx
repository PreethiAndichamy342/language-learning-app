import { useState } from 'react';

/** @param {{ card: Object, onAudio: (url: string) => void }} props */
export function CardDisplay({ card, onAudio }) {
  const [showPron, setShowPron] = useState(false);
  const [showTrans, setShowTrans] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-indigo-300 bg-indigo-50 px-2 py-0.5 rounded-full">
          Zipf {card.zipfLevel}
        </span>
        <button
          onClick={() => onAudio(card.audioUrl)}
          aria-label="Play audio"
          className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 active:scale-95 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
        </button>
      </div>

      <p className="text-2xl font-semibold text-gray-800 text-center leading-relaxed">{card.text}</p>

      <div className="space-y-2 border-t pt-4">
        <button onClick={() => setShowPron(!showPron)} className="w-full text-xs text-indigo-400 hover:text-indigo-600 transition-colors">
          {showPron ? 'Hide' : 'Show'} pronunciation guide
        </button>
        {showPron && <p className="text-center text-sm text-gray-400 italic font-mono">{card.pronunciation}</p>}

        <button onClick={() => setShowTrans(!showTrans)} className="w-full text-xs text-gray-300 hover:text-gray-500 transition-colors">
          I don't understand — show translation
        </button>
        {showTrans && <p className="text-center text-sm text-gray-600 font-medium">{card.translation}</p>}
      </div>
    </div>
  );
}

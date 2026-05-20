import { useApp } from './hooks/useApp.js';
import { CardDisplay } from './components/CardDisplay.jsx';
import { Recording } from './components/Recording.jsx';
import { ProgressBar } from './components/ProgressBar.jsx';
import { LanguageSelector } from './components/LanguageSelector.jsx';
import { LoadingSpinner } from './components/LoadingSpinner.jsx';

export default function App() {
  const { state, handlers } = useApp();
  const { card, progress, language, loading, error } = state;

  if (loading) return <LoadingSpinner />;

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md text-center">
        <p className="text-red-600 font-medium mb-2">Something went wrong</p>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col items-center py-10 px-4">
      <header className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-bold text-indigo-600 tracking-tight">LinguaFlow</h1>
        <p className="text-gray-400 text-sm mt-1">Master languages, one sentence at a time</p>
        <LanguageSelector language={language} onChange={handlers.onLanguageChange} />
      </header>

      <main className="w-full max-w-md space-y-4">
        <ProgressBar progress={progress} />
        {card ? (
          <>
            <CardDisplay card={card} onAudio={handlers.onPlayAudio} />
            <Recording card={card} onResult={handlers.onRecordingResult} language={language} />
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center text-gray-400">
            No cards available for this level.
          </div>
        )}
      </main>
    </div>
  );
}

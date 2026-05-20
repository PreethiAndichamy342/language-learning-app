import { useState, useEffect } from 'react';
import { DataService } from '../services/data.js';

const FLAG = { spanish: '', chinese: '', swedish: '' };

/** @param {{ language: string, onChange: (lang: string) => void }} props */
export function LanguageSelector({ language, onChange }) {
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    DataService.getLanguages().then(setLanguages).catch(console.error);
  }, []);

  return (
    <div className="flex justify-center mt-3">
      <select
        value={language}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600
                   focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {FLAG[lang]} {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

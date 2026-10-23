import React from 'react';
import { Sparkles, BookOpen, History, Flame, Database, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  activeTab: 'create' | 'history' | 'bank';
  onSelectTab: (tab: 'create' | 'history' | 'bank') => void;
  aiAvailable: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  aiAvailable
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div
          onClick={() => onSelectTab('create')}
          className="flex items-center gap-3 cursor-pointer select-none group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectTab('create')}
          aria-label="QuizForge Home"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-amber-200 fill-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                Quiz<span className="text-indigo-600">Forge</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Study Tool
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Interactive technical quizzes & active recall
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('create')}
            className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'create'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-current={activeTab === 'create' ? 'page' : undefined}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Create Quiz</span>
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'history'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-current={activeTab === 'history' ? 'page' : undefined}
          >
            <History className="w-4 h-4 text-slate-600" />
            <span>History & Stats</span>
          </button>

          <button
            onClick={() => onSelectTab('bank')}
            className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'bank'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            aria-current={activeTab === 'bank' ? 'page' : undefined}
          >
            <Database className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Question Bank</span>
            <span className="sm:hidden">Bank</span>
          </button>
        </nav>

        {/* AI status badge */}
        <div className="hidden lg:flex items-center gap-2">
          {aiAvailable ? (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
              title="Gemini API is connected on the server for dynamic question generation"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Provider Active</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
              title="Built-in question bank mode is active. No external API key required."
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>Bank Mode (Offline Ready)</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

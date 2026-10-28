import React from 'react';
import { Sparkles, Globe, User, LogOut, CheckCircle2 } from 'lucide-react';

export default function Navbar({
  portfolio,
  onSave,
  onPublishToggle,
  isSaving,
  user,
  onLogout,
  onOpenAuth,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border-gray/20 px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-dark-charcoal text-white flex items-center justify-center shadow-apple-subtle">
            <Sparkles className="w-5 h-5 text-accent-blue" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-dark-charcoal">
              Portfolio Generator
            </h1>
            <p className="text-xs text-border-gray font-medium">
              Gemini 2.0 Flash • STAR Architecture
            </p>
          </div>
        </div>

        {/* Portfolio Status and Action Controls */}
        <div className="flex items-center space-x-4">
          {portfolio && (
            <div className="hidden sm:flex items-center space-x-2 text-xs text-dark-charcoal/70 bg-bg-slate px-3 py-1.5 rounded-full border border-border-gray/20">
              <span
                className={`w-2 h-2 rounded-full ${
                  portfolio.is_published ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-medium">
                {portfolio.is_published ? 'Published' : 'Draft Mode'}
              </span>
              <span className="text-border-gray">•</span>
              <span className="font-mono text-[11px] text-dark-charcoal/80 truncate max-w-[140px]">
                /p/{portfolio.slug || 'untitled'}
              </span>
            </div>
          )}

          {/* Quick Publish Toggle */}
          {portfolio && (
            <button
              onClick={onPublishToggle}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-apple transition-all flex items-center space-x-1.5 ${
                portfolio.is_published
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  : 'bg-dark-charcoal text-white hover:bg-dark-charcoal/90 shadow-apple-subtle'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{portfolio.is_published ? 'Published' : 'Publish'}</span>
            </button>
          )}

          {/* Manual Save Button */}
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-4 py-1.5 bg-accent-blue text-white text-xs font-medium rounded-apple hover:bg-accent-blue/90 disabled:opacity-50 transition-all flex items-center space-x-1.5 shadow-apple-subtle"
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>

          {/* Auth State */}
          <div className="border-l border-border-gray/20 pl-4 flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-medium text-dark-charcoal truncate max-w-[100px]">
                  {user.username}
                </span>
                <button
                  onClick={onLogout}
                  title="Log out"
                  className="p-1.5 text-border-gray hover:text-dark-charcoal rounded-apple hover:bg-bg-slate transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="text-xs font-medium text-dark-charcoal hover:text-accent-blue flex items-center space-x-1"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


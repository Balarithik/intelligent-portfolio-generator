import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import api from '../../api/client';

export default function AIEnhanceButton({
  textToEnhance,
  targetRole = 'Software Engineer',
  onEnhanced,
  className = '',
  buttonLabel = 'AI Enhance',
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEnhance = async (e) => {
    e.preventDefault();
    if (!textToEnhance || !textToEnhance.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.enhanceDescription(textToEnhance, targetRole);
      if (res && res.enhanced_text) {
        onEnhanced(res.enhanced_text);
      }
    } catch (err) {
      console.warn('AI enhancement error, using fallback format:', err.message);
      // Client-side fallback if server is unreachable
      const lines = textToEnhance.split('\n').filter((l) => l.trim());
      const fallback = lines
        .map(
          (l) =>
            `• Spearheaded ${l.trim().toLowerCase().replace(/^\W+/, '')}, delivering quantifiable impact and measurable acceleration for ${targetRole}.`
        )
        .join('\n');
      onEnhanced(fallback || textToEnhance);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={handleEnhance}
        disabled={loading || !textToEnhance?.trim()}
        title="Apply STAR Method AI Optimization"
        className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium text-accent-blue bg-accent-blue/10 hover:bg-accent-blue/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-all"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-blue" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
        )}
        <span>{loading ? 'Optimizing...' : buttonLabel}</span>
      </button>
      {error && <span className="text-[10px] text-red-500 ml-1.5">{error}</span>}
    </div>
  );
}


import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink, Copy, Check } from 'lucide-react';

export default function ResponsiveControls({
  viewport,
  onChangeViewport,
  portfolioSlug,
  isPublished,
}) {
  const [copied, setCopied] = useState(false);

  const copyPublicLink = () => {
    const origin = window.location.origin;
    const url = `${origin}/p/${portfolioSlug || 'preview'}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openPublicLink = () => {
    window.open(`/p/${portfolioSlug || 'preview'}`, '_blank');
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white/90 backdrop-blur border-b border-border-gray/20 text-xs">
      {/* Device Viewport Switcher */}
      <div className="flex items-center space-x-1 bg-bg-slate p-0.5 rounded-lg border border-border-gray/20">
        <button
          type="button"
          onClick={() => onChangeViewport('desktop')}
          className={`px-2.5 py-1 rounded-md flex items-center space-x-1.5 transition-all ${
            viewport === 'desktop'
              ? 'bg-white text-dark-charcoal font-medium shadow-apple-subtle'
              : 'text-dark-charcoal/60 hover:text-dark-charcoal'
          }`}
          title="Desktop (100%)"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Desktop</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeViewport('tablet')}
          className={`px-2.5 py-1 rounded-md flex items-center space-x-1.5 transition-all ${
            viewport === 'tablet'
              ? 'bg-white text-dark-charcoal font-medium shadow-apple-subtle'
              : 'text-dark-charcoal/60 hover:text-dark-charcoal'
          }`}
          title="Tablet (768px)"
        >
          <Tablet className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tablet</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeViewport('mobile')}
          className={`px-2.5 py-1 rounded-md flex items-center space-x-1.5 transition-all ${
            viewport === 'mobile'
              ? 'bg-white text-dark-charcoal font-medium shadow-apple-subtle'
              : 'text-dark-charcoal/60 hover:text-dark-charcoal'
          }`}
          title="Mobile (375px)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Mobile</span>
        </button>
      </div>

      {/* Share / Link Controls */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={copyPublicLink}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-apple bg-bg-slate hover:bg-white text-dark-charcoal/80 border border-border-gray/20 transition-all"
          title="Copy Live URL"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-border-gray" />
              <span>Copy Link</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={openPublicLink}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-apple bg-bg-slate hover:bg-white text-dark-charcoal/80 border border-border-gray/20 transition-all"
          title="Open in new window"
        >
          <ExternalLink className="w-3.5 h-3.5 text-border-gray" />
          <span>Preview</span>
        </button>
      </div>
    </div>
  );
}

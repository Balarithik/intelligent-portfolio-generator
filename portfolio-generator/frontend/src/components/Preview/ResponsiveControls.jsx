import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink, Copy, Check } from 'lucide-react';

export default function ResponsiveControls({
  viewport,
  onChangeViewport,
  portfolioSlug,
  isPublished,
}) {
  const [copied, setCopied] = useState(false);
  const canShare = Boolean(isPublished && portfolioSlug);

  const copyPublicLink = async () => {
    if (!canShare) return;

    const url = `${window.location.origin}/p/${encodeURIComponent(portfolioSlug)}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const field = document.createElement('textarea');
        field.value = url;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        const copiedSuccessfully = document.execCommand('copy');
        field.remove();
        if (!copiedSuccessfully) throw new Error('Clipboard access is unavailable.');
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Could not copy public portfolio URL:', error);
    }
  };

  const openPublicLink = () => {
    if (!canShare) return;
    window.open(`/p/${encodeURIComponent(portfolioSlug)}`, '_blank', 'noopener,noreferrer');
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
          disabled={!canShare}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-apple bg-bg-slate hover:bg-white text-dark-charcoal/80 border border-border-gray/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          title={canShare ? 'Copy Live URL' : 'Publish your portfolio to enable sharing'}
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
          disabled={!canShare}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-apple bg-bg-slate hover:bg-white text-dark-charcoal/80 border border-border-gray/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          title={canShare ? 'Open published portfolio' : 'Publish your portfolio to enable preview'}
        >
          <ExternalLink className="w-3.5 h-3.5 text-border-gray" />
          <span>Preview</span>
        </button>
      </div>
    </div>
  );
}

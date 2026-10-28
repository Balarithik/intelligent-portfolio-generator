import React, { useEffect, useState } from 'react';
import PortfolioLivePreview from '../Preview/PortfolioLivePreview';
import api from '../../api/client';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';

export default function PublicPortfolioView({ slug, initialData = null }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData && Boolean(slug));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      return;
    }
    if (!slug) return;

    let isMounted = true;
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const res = await api.getPublicPortfolio(slug);
        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Portfolio not found or not published.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPortfolio();
    return () => {
      isMounted = false;
    };
  }, [slug, initialData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-slate flex items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
          <p className="text-xs text-dark-charcoal/70 font-medium">Loading portfolio presentation...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-bg-slate flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-apple-lg border border-border-gray/20 shadow-apple-card text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-semibold text-dark-charcoal">Portfolio Unavailable</h2>
          <p className="text-xs text-border-gray leading-relaxed">
            {error || 'This portfolio is either private or has not been published yet.'}
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 text-xs font-medium text-white bg-dark-charcoal rounded-apple hover:bg-dark-charcoal/90 transition-all shadow-apple-subtle"
          >
            Create Your Own Portfolio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-slate">
      <main className="max-w-4xl mx-auto shadow-2xl my-0 sm:my-8 rounded-none sm:rounded-apple-lg overflow-hidden border border-border-gray/10">
        <PortfolioLivePreview
          sectionsData={data.sections_data || {}}
          theme={data.theme || 'minimalist'}
          title={data.title}
        />
      </main>

      {/* Subtle branding watermark */}
      <footer className="py-6 text-center text-[11px] text-border-gray">
        <a
          href="/"
          className="inline-flex items-center space-x-1.5 hover:text-dark-charcoal transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
          <span>Built with Intelligent Portfolio Generator</span>
        </a>
      </footer>
    </div>
  );
}

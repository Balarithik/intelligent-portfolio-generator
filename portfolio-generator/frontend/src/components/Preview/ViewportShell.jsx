import React from 'react';
import ResponsiveControls from './ResponsiveControls';
import PortfolioLivePreview from './PortfolioLivePreview';

export default function ViewportShell({
  viewport,
  onChangeViewport,
  sectionsData,
  theme,
  title,
  slug,
  isPublished,
}) {
  const getContainerWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'w-[375px]';
      case 'tablet':
        return 'w-[768px]';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-slate border-l border-border-gray/20">
      {/* Top Toolbar */}
      <ResponsiveControls
        viewport={viewport}
        onChangeViewport={onChangeViewport}
        portfolioSlug={slug}
        isPublished={isPublished}
      />

      {/* Frame Container */}
      <div className="flex-1 overflow-auto p-4 md:p-6 flex justify-center items-start">
        <div
          data-testid="viewport-frame"
          className={`transition-all duration-300 ease-out bg-white rounded-apple-lg border border-border-gray/20 shadow-apple-card overflow-hidden min-h-[600px] ${getContainerWidth()}`}
        >
          <PortfolioLivePreview
            sectionsData={sectionsData}
            theme={theme}
            title={title}
          />
        </div>
      </div>
    </div>
  );
}

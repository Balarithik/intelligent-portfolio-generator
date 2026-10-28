import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SplitWorkspace from '../components/SplitWorkspace';
import api from '../api/client';

describe('SplitWorkspace Integration & Synchronization', () => {
  const initialPortfolio = {
    id: 1,
    title: 'Senior Developer Portfolio',
    slug: 'senior-dev',
    theme: 'minimalist',
    is_published: false,
    sections_data: {
      profile: {
        name: 'Jordan Chase',
        target_role: 'Lead Cloud Architect',
        bio: 'Building scalable resilient cloud architectures.',
      },
      experience: [],
      projects: [],
      skills: ['Python', 'Docker'],
    },
  };

  function TestHarness() {
    const [portfolio, setPortfolio] = useState(initialPortfolio);
    return (
      <SplitWorkspace
        portfolio={portfolio}
        onUpdatePortfolio={setPortfolio}
        onSave={vi.fn()}
      />
    );
  }

  it('synchronizes profile form inputs immediately to the live preview', async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    // Check initial preview state
    expect(screen.getAllByText('Jordan Chase').length).toBeGreaterThan(0);
    expect(screen.getByText('Lead Cloud Architect')).toBeInTheDocument();

    // Type into Full Name input in ProfileForm
    const nameInput = screen.getByPlaceholderText('e.g. Alex Rivera');
    await user.clear(nameInput);
    await user.type(nameInput, 'Taylor Swift');

    // Live preview must immediately reflect updated name
    expect(screen.getByRole('heading', { name: 'Taylor Swift' })).toBeInTheDocument();
  });

  it('toggles responsive preview viewport between desktop, tablet, and mobile', async () => {
    const user = userEvent.setup();
    render(<TestHarness />);

    const viewportContainer = screen.getByTestId('viewport-frame');
    expect(viewportContainer).toHaveClass('w-full');

    // Click Tablet toggle
    const tabletBtn = screen.getByTitle('Tablet (768px)');
    await user.click(tabletBtn);
    expect(viewportContainer).toHaveClass('w-[768px]');

    // Click Mobile toggle
    const mobileBtn = screen.getByTitle('Mobile (375px)');
    await user.click(mobileBtn);
    expect(viewportContainer).toHaveClass('w-[375px]');

    // Return to Desktop
    const desktopBtn = screen.getByTitle('Desktop (100%)');
    await user.click(desktopBtn);
    expect(viewportContainer).toHaveClass('w-full');
  });

  it('triggers AI Enhance and updates bio content with STAR results', async () => {
    const user = userEvent.setup();
    const mockEnhancedText =
      '• Spearheaded cloud optimization reducing infrastructure latency by 45% across $10M systems.';
    vi.spyOn(api, 'enhanceDescription').mockResolvedValueOnce({
      enhanced_text: mockEnhancedText,
    });

    render(<TestHarness />);

    const enhanceBtn = screen.getByTitle('Apply STAR Method AI Optimization');
    expect(enhanceBtn).toBeInTheDocument();

    await user.click(enhanceBtn);

    await waitFor(() => {
      expect(api.enhanceDescription).toHaveBeenCalled();
      const matchingElements = screen.getAllByText(mockEnhancedText);
      expect(matchingElements.length).toBeGreaterThanOrEqual(1);
      expect(matchingElements[0]).toBeInTheDocument();
    });
  });
});

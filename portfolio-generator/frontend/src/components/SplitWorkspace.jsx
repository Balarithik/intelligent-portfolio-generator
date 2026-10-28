import React, { useState } from 'react';
import SectionTabs from './Editor/SectionTabs';
import ProfileForm from './Editor/ProfileForm';
import ExperienceForm from './Editor/ExperienceForm';
import ProjectsForm from './Editor/ProjectsForm';
import SkillsForm from './Editor/SkillsForm';
import ResumeDropzone from './Editor/ResumeDropzone';
import ViewportShell from './Preview/ViewportShell';
import { Sparkles, FileText, Globe, Check } from 'lucide-react';

const THEMES = [
  {
    id: 'minimalist',
    name: 'Minimalist',
    desc: 'Apple-aesthetic, crisp typography, generous whitespace.',
  },
  {
    id: 'executive',
    name: 'Executive',
    desc: 'Distinguished leadership profile with classic timeline.',
  },
  {
    id: 'modern',
    name: 'Modern Dev',
    desc: 'Dark high-contrast developer theme with tech badges.',
  },
];

export default function SplitWorkspace({
  portfolio,
  onUpdatePortfolio,
  onSave,
}) {
  const [activeTab, setActiveTab] = useState('profile');
  const [viewport, setViewport] = useState('desktop');
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  const sectionsData = portfolio?.sections_data || {
    profile: {},
    experience: [],
    projects: [],
    skills: [],
  };

  const handleUpdateSection = (sectionName, data) => {
    onUpdatePortfolio({
      ...portfolio,
      sections_data: {
        ...sectionsData,
        [sectionName]: data,
      },
    });
  };

  const handleParsedResume = (newSections) => {
    onUpdatePortfolio({
      ...portfolio,
      title: portfolio.title || `${newSections.profile?.name || 'My'} Portfolio`,
      sections_data: {
        profile: {
          ...sectionsData.profile,
          ...newSections.profile,
        },
        experience: newSections.experience || sectionsData.experience,
        projects: newSections.projects || sectionsData.projects,
        skills: newSections.skills || sectionsData.skills,
      },
    });
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-61px)] overflow-hidden">
      {/* ================= Left Column (45% width, scrollable) ================= */}
      <div className="w-full lg:w-[45%] h-full flex flex-col bg-white border-r border-border-gray/20 overflow-hidden">
        {/* Workspace Toolbar */}
        <div className="p-4 border-b border-border-gray/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-3">
              <input
                type="text"
                value={portfolio?.title || ''}
                onChange={(e) =>
                  onUpdatePortfolio({ ...portfolio, title: e.target.value })
                }
                placeholder="Portfolio Title (e.g. Staff Engineer Portfolio)"
                className="w-full text-sm font-semibold text-dark-charcoal px-2.5 py-1.5 rounded-lg border border-transparent hover:border-border-gray/30 focus:border-accent-blue focus:outline-none transition-all"
              />
            </div>

            {/* Resume Upload Quick Action */}
            <button
              type="button"
              onClick={() => setIsResumeModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-accent-blue bg-accent-blue/10 hover:bg-accent-blue/20 rounded-apple transition-all whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Import Resume</span>
            </button>
          </div>

          {/* Section Navigation Tabs */}
          <SectionTabs activeTab={activeTab} onSelectTab={setActiveTab} />
        </div>

        {/* Form Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'profile' && (
            <ProfileForm
              profile={sectionsData.profile || {}}
              onChange={(updated) => handleUpdateSection('profile', updated)}
            />
          )}

          {activeTab === 'experience' && (
            <ExperienceForm
              experiences={sectionsData.experience || []}
              targetRole={sectionsData.profile?.target_role || ''}
              onChange={(updated) => handleUpdateSection('experience', updated)}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsForm
              projects={sectionsData.projects || []}
              targetRole={sectionsData.profile?.target_role || ''}
              onChange={(updated) => handleUpdateSection('projects', updated)}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsForm
              skills={sectionsData.skills || []}
              onChange={(updated) => handleUpdateSection('skills', updated)}
            />
          )}

          {activeTab === 'theme' && (
            <div className="space-y-3">
              <p className="text-xs text-border-gray">
                Choose the visual style and typography for your generated portfolio.
              </p>
              <div className="grid grid-cols-1 gap-3">
                {THEMES.map((t) => {
                  const isSelected = portfolio?.theme === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() =>
                        onUpdatePortfolio({ ...portfolio, theme: t.id })
                      }
                      className={`p-4 rounded-apple border cursor-pointer transition-all flex items-start justify-between ${
                        isSelected
                          ? 'border-accent-blue bg-accent-blue/5 shadow-apple-subtle'
                          : 'border-border-gray/20 hover:border-border-gray/40 bg-white'
                      }`}
                    >
                      <div>
                        <h4 className="text-xs font-semibold text-dark-charcoal">
                          {t.name}
                        </h4>
                        <p className="text-xs text-border-gray mt-0.5">
                          {t.desc}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-accent-blue text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= Right Column (55% width, sticky) ================= */}
      <div className="w-full lg:w-[55%] h-full">
        <ViewportShell
          viewport={viewport}
          onChangeViewport={setViewport}
          sectionsData={sectionsData}
          theme={portfolio?.theme || 'minimalist'}
          title={portfolio?.title || 'Portfolio Preview'}
          slug={portfolio?.slug || ''}
          isPublished={Boolean(portfolio?.is_published)}
        />
      </div>

      {/* Gemini Resume Extraction Modal */}
      <ResumeDropzone
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        onParsedSections={handleParsedResume}
      />
    </div>
  );
}

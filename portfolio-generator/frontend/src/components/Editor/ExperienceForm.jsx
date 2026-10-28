import React from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Briefcase } from 'lucide-react';
import AIEnhanceButton from './AIEnhanceButton';

export default function ExperienceForm({ experiences = [], targetRole = '', onChange }) {
  const addExperience = () => {
    const newItem = {
      company: '',
      role: '',
      start_date: '',
      end_date: 'Present',
      description: '',
      highlights: [],
    };
    onChange([...experiences, newItem]);
  };

  const removeExperience = (index) => {
    const updated = experiences.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateExperience = (index, field, value) => {
    const updated = [...experiences];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  const updateHighlights = (index, textValue) => {
    const lines = textValue.split('\n').filter((l) => l.trim());
    updateExperience(index, 'highlights', lines);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-border-gray">
          List your professional career roles and key achievements.
        </p>
        <button
          type="button"
          onClick={addExperience}
          className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-white bg-dark-charcoal hover:bg-dark-charcoal/90 rounded-apple shadow-apple-subtle transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Position</span>
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border-gray/30 rounded-apple bg-white/50">
          <Briefcase className="w-8 h-8 text-border-gray/50 mx-auto mb-2" />
          <p className="text-xs font-medium text-dark-charcoal/70">No work experiences added yet.</p>
          <p className="text-[11px] text-border-gray mt-1">
            Click "Add Position" or import from a resume.
          </p>
        </div>
      ) : (
        experiences.map((exp, idx) => (
          <div
            key={idx}
            className="p-4 bg-white rounded-apple border border-border-gray/20 shadow-apple-subtle space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-dark-charcoal">
                Position #{idx + 1}: {exp.role || 'Untitled Role'}{' '}
                {exp.company ? `@ ${exp.company}` : ''}
              </span>
              <button
                type="button"
                onClick={() => removeExperience(idx)}
                className="p-1 text-border-gray hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                title="Remove experience"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-dark-charcoal/70 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={exp.company || ''}
                  onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-border-gray/30 focus:outline-none focus:border-accent-blue"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-dark-charcoal/70 mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  value={exp.role || ''}
                  onChange={(e) => updateExperience(idx, 'role', e.target.value)}
                  placeholder="e.g. Senior Software Architect"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-border-gray/30 focus:outline-none focus:border-accent-blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-dark-charcoal/70 mb-1">
                  Start Date
                </label>
                <input
                  type="text"
                  value={exp.start_date || ''}
                  onChange={(e) => updateExperience(idx, 'start_date', e.target.value)}
                  placeholder="e.g. Jan 2021"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-border-gray/30 focus:outline-none focus:border-accent-blue"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-dark-charcoal/70 mb-1">
                  End Date
                </label>
                <input
                  type="text"
                  value={exp.end_date || ''}
                  onChange={(e) => updateExperience(idx, 'end_date', e.target.value)}
                  placeholder="e.g. Present"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-border-gray/30 focus:outline-none focus:border-accent-blue"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-medium text-dark-charcoal/70 mb-1">
                Overview of Scope & Team
              </label>
              <input
                type="text"
                value={exp.description || ''}
                onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                placeholder="Brief summary of domain, team size, and core mission"
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-border-gray/30 focus:outline-none focus:border-accent-blue"
              />
            </div>

            {/* STAR Highlights */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-dark-charcoal/70">
                  STAR Achievements & Impact (One bullet per line)
                </label>
                <AIEnhanceButton
                  textToEnhance={(exp.highlights || []).join('\n')}
                  targetRole={targetRole || exp.role || 'Software Engineer'}
                  onEnhanced={(enhanced) => updateHighlights(idx, enhanced)}
                  buttonLabel="STAR Optimize"
                />
              </div>
              <textarea
                rows={3}
                value={(exp.highlights || []).join('\n')}
                onChange={(e) => updateHighlights(idx, e.target.value)}
                placeholder="• Engineered cloud microservices reducing tail latency by 35%&#10;• Led cross-functional squad of 5 engineers to deliver core payment integration"
                className="w-full text-xs p-2.5 rounded-lg border border-border-gray/30 bg-bg-slate/30 focus:bg-white focus:outline-none focus:border-accent-blue resize-none"
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

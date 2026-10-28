import React, { useState } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';

const SUGGESTED_SKILLS = [
  'Python', 'Django', 'React', 'TypeScript', 'Tailwind CSS',
  'PostgreSQL', 'Docker', 'Kubernetes', 'FastAPI', 'Node.js',
  'GraphQL', 'AWS', 'Redis', 'CI/CD', 'System Design'
];

export default function SkillsForm({ skills = [], onChange }) {
  const [inputVal, setInputVal] = useState('');

  const addSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInputVal('');
  };

  const removeSkill = (index) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill(inputVal);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-border-gray mb-3">
          Manage the core technical competencies and specialized tools featured on your portfolio.
        </p>

        {/* Input bar */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type skill name and press Enter (e.g. 'Django')..."
            className="flex-1 text-xs px-3 py-2 rounded-apple border border-border-gray/30 bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
          />
          <button
            type="button"
            onClick={() => addSkill(inputVal)}
            disabled={!inputVal.trim()}
            className="px-3.5 py-2 text-xs font-medium text-white bg-dark-charcoal hover:bg-dark-charcoal/90 rounded-apple disabled:opacity-40 transition-all flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Active Skills Pills */}
      <div>
        <label className="block text-xs font-medium text-dark-charcoal/80 mb-2">
          Active Portfolio Skills ({skills.length})
        </label>
        {skills.length === 0 ? (
          <p className="text-xs text-border-gray italic">No skills added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white text-dark-charcoal rounded-full text-xs font-medium border border-border-gray/30 shadow-apple-subtle transition-all"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(idx)}
                  className="p-0.5 text-border-gray hover:text-red-500 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Suggested Skills */}
      <div className="pt-2 border-t border-border-gray/10">
        <label className="flex items-center space-x-1.5 text-xs font-medium text-dark-charcoal/70 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-accent-blue" />
          <span>Quick Add Suggestions</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => addSkill(skill)}
              className="px-2.5 py-1 text-[11px] bg-bg-slate hover:bg-white text-dark-charcoal/80 rounded-full border border-border-gray/20 hover:border-accent-blue/50 transition-all"
            >
              + {skill}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

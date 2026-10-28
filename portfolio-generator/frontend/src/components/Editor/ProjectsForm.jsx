import React from 'react';
import { Plus, Trash2, FolderGit2, ExternalLink } from 'lucide-react';
import AIEnhanceButton from './AIEnhanceButton';

export default function ProjectsForm({ projects = [], targetRole = '', onChange }) {
  const addProject = () => {
    const newProject = {
      title: '',
      description: '',
      technologies: [],
      link: '',
    };
    onChange([...projects, newProject]);
  };

  const removeProject = (index) => {
    const updated = projects.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    onChange(updated);
  };

  const updateTechnologies = (index, rawString) => {
    const tags = rawString.split(',').map((t) => t.trim()).filter(Boolean);
    updateProject(index, 'technologies', tags);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-border-gray">
          Showcase notable projects, open source tools, and technical architectures.
        </p>
        <button
          type="button"
          onClick={addProject}
          className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-white bg-dark-charcoal hover:bg-dark-charcoal/90 rounded-apple shadow-apple-subtle transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border-gray/30 rounded-apple bg-white/50">
          <FolderGit2 className="w-8 h-8 text-border-gray/50 mx-auto mb-2" />
          <p className="text-xs font-medium text-dark-charcoal/70">No projects added yet.</p>
          <p className="text-[11px] text-border-gray mt-1">
            Highlight your best work with technologies and metrics.
          </p>
        </div>
      ) : (
        projects.map((proj, idx) => (
          <div
            key={idx}
            className="p-4 bg-white rounded-apple border border-border-gray/20 shadow-apple-subtle space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-dark-charcoal">
                Project #{idx + 1}: {proj.title || 'Untitled Project'}
              </span>
              <button
                type="button"
                onClick={() => removeProject(idx)}
                className="p-1 text-border-gray hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                title="Remove project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-dark-charcoal/70 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  value={proj.title || ''}
                  onChange={(e) => updateProject(idx, 'title', e.target.value)}
                  placeholder="e.g. Distributed Task Orchestrator"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-border-gray/30 focus:outline-none focus:border-accent-blue"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-dark-charcoal/70 mb-1">
                  Live Demo / Repository URL
                </label>
                <input
                  type="url"
                  value={proj.link || ''}
                  onChange={(e) => updateProject(idx, 'link', e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-border-gray/30 focus:outline-none focus:border-accent-blue"
                />
              </div>
            </div>

            {/* Project Description with STAR AI Enhancer */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-dark-charcoal/70">
                  Project Description & Outcomes
                </label>
                <AIEnhanceButton
                  textToEnhance={proj.description || ''}
                  targetRole={targetRole || 'Software Engineer'}
                  onEnhanced={(enhanced) => updateProject(idx, 'description', enhanced)}
                  buttonLabel="AI Optimize"
                />
              </div>
              <textarea
                rows={3}
                value={proj.description || ''}
                onChange={(e) => updateProject(idx, 'description', e.target.value)}
                placeholder="High-performance async scheduler managing 10k concurrent workers with automatic failover..."
                className="w-full text-xs p-2.5 rounded-lg border border-border-gray/30 bg-bg-slate/30 focus:bg-white focus:outline-none focus:border-accent-blue resize-none"
              />
            </div>

            {/* Technologies */}
            <div>
              <label className="block text-[11px] font-medium text-dark-charcoal/70 mb-1">
                Technologies Used (Comma-separated)
              </label>
              <input
                type="text"
                value={(proj.technologies || []).join(', ')}
                onChange={(e) => updateTechnologies(idx, e.target.value)}
                placeholder="React, Django, Python, Docker, Redis, Tailwind"
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-border-gray/30 focus:outline-none focus:border-accent-blue"
              />
              {proj.technologies && proj.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {proj.technologies.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 text-[10px] bg-bg-slate text-dark-charcoal/80 rounded-md font-mono border border-border-gray/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

import React from 'react';
import AIEnhanceButton from './AIEnhanceButton';

export default function ProfileForm({ profile = {}, onChange }) {
  const updateField = (field, value) => {
    onChange({
      ...profile,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-dark-charcoal/80 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={profile.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g. Alex Rivera"
            className="w-full text-xs px-3 py-2 rounded-apple border border-border-gray/30 bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-dark-charcoal/80 mb-1">
            Target Professional Role
          </label>
          <input
            type="text"
            value={profile.target_role || ''}
            onChange={(e) => updateField('target_role', e.target.value)}
            placeholder="e.g. Staff Distributed Systems Engineer"
            className="w-full text-xs px-3 py-2 rounded-apple border border-border-gray/30 bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-dark-charcoal/80 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={profile.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="name@example.com"
            className="w-full text-xs px-3 py-2 rounded-apple border border-border-gray/30 bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-dark-charcoal/80 mb-1">
            Phone Number
          </label>
          <input
            type="text"
            value={profile.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full text-xs px-3 py-2 rounded-apple border border-border-gray/30 bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-dark-charcoal/80 mb-1">
            Location
          </label>
          <input
            type="text"
            value={profile.location || ''}
            onChange={(e) => updateField('location', e.target.value)}
            placeholder="San Francisco, CA"
            className="w-full text-xs px-3 py-2 rounded-apple border border-border-gray/30 bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
          />
        </div>
      </div>

      {/* Bio / Summary with AI Enhancer */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-dark-charcoal/80">
            Professional Summary / Bio
          </label>
          <AIEnhanceButton
            textToEnhance={profile.bio || ''}
            targetRole={profile.target_role || 'Software Engineer'}
            onEnhanced={(enhanced) => updateField('bio', enhanced)}
            buttonLabel="Enhance Bio"
          />
        </div>
        <textarea
          rows={4}
          value={profile.bio || ''}
          onChange={(e) => updateField('bio', e.target.value)}
          placeholder="Brief executive summary highlighting key technical proficiencies and career impact..."
          className="w-full text-xs p-3 rounded-apple border border-border-gray/30 bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all resize-none"
        />
      </div>

      {/* Social / External Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div>
          <label className="block text-xs font-medium text-dark-charcoal/80 mb-1">
            GitHub URL
          </label>
          <input
            type="url"
            value={profile.github || ''}
            onChange={(e) => updateField('github', e.target.value)}
            placeholder="https://github.com/username"
            className="w-full text-xs px-3 py-2 rounded-apple border border-border-gray/30 bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-dark-charcoal/80 mb-1">
            LinkedIn URL
          </label>
          <input
            type="url"
            value={profile.linkedin || ''}
            onChange={(e) => updateField('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/username"
            className="w-full text-xs px-3 py-2 rounded-apple border border-border-gray/30 bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-dark-charcoal/80 mb-1">
            Personal Website
          </label>
          <input
            type="url"
            value={profile.website || ''}
            onChange={(e) => updateField('website', e.target.value)}
            placeholder="https://myportfolio.dev"
            className="w-full text-xs px-3 py-2 rounded-apple border border-border-gray/30 bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue/30 focus:border-accent-blue transition-all"
          />
        </div>
      </div>
    </div>
  );
}


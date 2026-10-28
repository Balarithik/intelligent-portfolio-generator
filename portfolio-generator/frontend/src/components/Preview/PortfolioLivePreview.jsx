import React from 'react';
import { Mail, Phone, MapPin, Globe, Github, Linkedin, ExternalLink, Calendar, Sparkles } from 'lucide-react';

/**
 * Sanitizes URLs to prevent DOM-based XSS via javascript:, data:, or vbscript: schemes.
 * Ensures external links default to secure https:// if protocol is omitted.
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return '#';
  }
  if (/^(mailto|tel):/i.test(trimmed)) {
    return trimmed;
  }
  if (/^(https?:\/\/|\/\/|\/)/i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export default function PortfolioLivePreview({
  sectionsData = {},
  theme = 'minimalist',
  title = '',
}) {
  const { profile = {}, experience = [], projects = [], skills = [] } = sectionsData;

  if (theme === 'executive') {
    return <ExecutiveTheme profile={profile} experience={experience} projects={projects} skills={skills} title={title} />;
  }

  if (theme === 'modern') {
    return <ModernTheme profile={profile} experience={experience} projects={projects} skills={skills} title={title} />;
  }

  // Default: Minimalist Apple Aesthetic
  return <MinimalistTheme profile={profile} experience={experience} projects={projects} skills={skills} title={title} />;
}

/* ================= 1. Minimalist Theme (Apple Aesthetic) ================= */
function MinimalistTheme({ profile, experience, projects, skills }) {
  return (
    <div className="bg-[#FFFFFF] text-dark-charcoal min-h-full p-8 md:p-12 font-sans selection:bg-accent-blue selection:text-white">
      {/* Header Profile */}
      <header className="border-b border-border-gray/20 pb-8 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-dark-charcoal mb-1">
          {profile.name || 'Your Name'}
        </h1>
        <p className="text-base text-accent-blue font-medium mb-3">
          {profile.target_role || 'Target Professional Role'}
        </p>

        {profile.bio && (
          <p className="text-sm text-dark-charcoal/80 leading-relaxed max-w-2xl mb-4">
            {profile.bio}
          </p>
        )}

        {/* Contact Info & Links */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-dark-charcoal/60">
          {profile.email && (
            <span className="flex items-center space-x-1 hover:text-dark-charcoal transition-colors">
              <Mail className="w-3.5 h-3.5 text-border-gray" />
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </span>
          )}
          {profile.phone && (
            <span className="flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5 text-border-gray" />
              <span>{profile.phone}</span>
            </span>
          )}
          {profile.location && (
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-border-gray" />
              <span>{profile.location}</span>
            </span>
          )}
          {profile.github && (
            <span className="flex items-center space-x-1 hover:text-accent-blue transition-colors">
              <Github className="w-3.5 h-3.5 text-border-gray" />
              <a href={sanitizeUrl(profile.github)} target="_blank" rel="noopener noreferrer">GitHub</a>
            </span>
          )}
          {profile.linkedin && (
            <span className="flex items-center space-x-1 hover:text-accent-blue transition-colors">
              <Linkedin className="w-3.5 h-3.5 text-border-gray" />
              <a href={sanitizeUrl(profile.linkedin)} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </span>
          )}
          {profile.website && (
            <span className="flex items-center space-x-1 hover:text-accent-blue transition-colors">
              <Globe className="w-3.5 h-3.5 text-border-gray" />
              <a href={sanitizeUrl(profile.website)} target="_blank" rel="noopener noreferrer">Portfolio</a>
            </span>
          )}
        </div>
      </header>

      {/* Experience Section */}
      {experience && experience.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-border-gray mb-6">
            Professional Experience
          </h2>
          <div className="space-y-6">
            {experience.map((exp, idx) => (
              <div key={idx} className="group">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
                  <h3 className="text-sm font-semibold text-dark-charcoal">
                    {exp.role} <span className="font-normal text-dark-charcoal/60">at {exp.company}</span>
                  </h3>
                  <span className="text-xs text-border-gray font-mono">
                    {exp.start_date} – {exp.end_date || 'Present'}
                  </span>
                </div>
                {exp.description && (
                  <p className="text-xs text-dark-charcoal/70 mb-2 italic">{exp.description}</p>
                )}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="space-y-1.5 text-xs text-dark-charcoal/80 list-disc list-outside pl-4">
                    {exp.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="leading-relaxed">
                        {h.replace(/^[•\-\*]\s*/, '')}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section */}
      {projects && projects.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold tracking-wider uppercase text-border-gray mb-6">
            Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border-gray/20 bg-bg-slate/30 hover:border-accent-blue/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-xs font-semibold text-dark-charcoal">{proj.title}</h3>
                    {proj.link && (
                      <a
                        href={sanitizeUrl(proj.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-border-gray hover:text-accent-blue"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-dark-charcoal/70 leading-relaxed mb-3">
                    {proj.description}
                  </p>
                </div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-auto pt-2">
                    {proj.technologies.map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-dark-charcoal/70 border border-border-gray/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills Section */}
      {skills && skills.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold tracking-wider uppercase text-border-gray mb-4">
            Core Competencies & Stack
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 rounded-full bg-bg-slate text-dark-charcoal font-medium border border-border-gray/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ================= 2. Executive Theme (Corporate Leadership) ================= */
function ExecutiveTheme({ profile, experience, projects, skills }) {
  return (
    <div className="bg-[#FAF9F6] text-[#222222] min-h-full font-serif selection:bg-[#1A365D] selection:text-white">
      {/* Top Banner */}
      <div className="bg-[#1A2530] text-white p-8 md:p-10 font-sans">
        <h1 className="text-3xl font-serif tracking-tight text-[#F7FAFC]">
          {profile.name || 'Executive Name'}
        </h1>
        <p className="text-sm uppercase tracking-widest text-[#63B3ED] font-semibold mt-1">
          {profile.target_role || 'Executive Leadership Profile'}
        </p>

        {profile.bio && (
          <p className="text-xs text-gray-300 font-sans mt-3 max-w-3xl leading-relaxed">
            {profile.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-4 font-sans">
          {profile.email && <span>{profile.email}</span>}
          {profile.phone && <span>• {profile.phone}</span>}
          {profile.location && <span>• {profile.location}</span>}
          {profile.linkedin && <span>• <a href={sanitizeUrl(profile.linkedin)} target="_blank" rel="noopener noreferrer" className="text-[#63B3ED]">LinkedIn</a></span>}
        </div>
      </div>

      <div className="p-8 md:p-10 space-y-8 font-sans">
        {/* Experience Timeline */}
        {experience && experience.length > 0 && (
          <section>
            <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-[#1A2530] border-b-2 border-[#1A2530] pb-1 mb-4">
              Career History
            </h2>
            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div key={idx} className="border-l-2 border-gray-300 pl-4 py-1">
                  <div className="flex flex-col sm:flex-row justify-between mb-1">
                    <span className="font-semibold text-xs text-[#1A2530]">
                      {exp.role} — <span className="font-normal text-gray-700">{exp.company}</span>
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      {exp.start_date} – {exp.end_date || 'Present'}
                    </span>
                  </div>
                  {exp.description && <p className="text-xs text-gray-600 mb-2">{exp.description}</p>}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="text-xs text-gray-700 space-y-1 list-disc pl-4">
                      {exp.highlights.map((h, i) => (
                        <li key={i}>{h.replace(/^[•\-\*]\s*/, '')}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <section>
            <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-[#1A2530] border-b-2 border-[#1A2530] pb-1 mb-4">
              Key Strategic Deliverables
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj, idx) => (
                <div key={idx} className="p-4 bg-white border border-gray-200 shadow-sm rounded">
                  <h3 className="text-xs font-bold text-[#1A2530] mb-1">{proj.title}</h3>
                  <p className="text-xs text-gray-600 mb-2 leading-relaxed">{proj.description}</p>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className="text-[10px] text-gray-500 font-mono">
                      Tools: {proj.technologies.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <section>
            <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-[#1A2530] border-b-2 border-[#1A2530] pb-1 mb-4">
              Areas of Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 bg-white border border-gray-300 text-gray-800 rounded">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

/* ================= 3. Modern Theme (Interactive Dev Aesthetic) ================= */
function ModernTheme({ profile, experience, projects, skills }) {
  return (
    <div className="bg-[#0F172A] text-slate-100 min-h-full p-8 md:p-12 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Hero Header */}
      <div className="relative mb-10 pb-8 border-b border-slate-800">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono mb-4 border border-cyan-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Available for New Roles</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
          {profile.name || 'Modern Developer'}
        </h1>
        <p className="text-base text-cyan-400 font-mono mb-4">
          &gt; {profile.target_role || 'Full Stack Engineer'}
        </p>

        {profile.bio && (
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed mb-6">
            {profile.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400">
          {profile.email && <span className="hover:text-cyan-400">{profile.email}</span>}
          {profile.location && <span>📍 {profile.location}</span>}
          {profile.github && (
            <a href={sanitizeUrl(profile.github)} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
              github.com
            </a>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      {projects && projects.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">
            // Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-white font-mono">{proj.title}</h3>
                    {proj.link && (
                      <a href={sanitizeUrl(proj.link)} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{proj.description}</p>
                </div>
                {proj.technologies && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
                    {proj.technologies.map((t, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-4">
            // Experience Log
          </h2>
          <div className="space-y-6">
            {experience.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex flex-col sm:flex-row justify-between mb-1">
                  <span className="text-xs font-bold text-white font-mono">
                    {exp.role} <span className="text-cyan-400">@{exp.company}</span>
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {exp.start_date} - {exp.end_date || 'Present'}
                  </span>
                </div>
                {exp.highlights && (
                  <ul className="text-xs text-slate-300 space-y-1.5 mt-2 pl-4 list-disc">
                    {exp.highlights.map((h, i) => (
                      <li key={i}>{h.replace(/^[•\-\*]\s*/, '')}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills && skills.length > 0 && (
        <section>
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3">
            // Tech Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <span key={idx} className="text-xs font-mono px-3 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

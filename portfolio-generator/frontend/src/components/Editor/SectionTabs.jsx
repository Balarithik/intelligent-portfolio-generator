import React from 'react';
import { User, Briefcase, FolderGit2, Wrench, Palette } from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'theme', label: 'Theme', icon: Palette },
];

export default function SectionTabs({ activeTab, onSelectTab }) {
  return (
    <div className="flex items-center space-x-1 p-1 bg-bg-slate rounded-apple border border-border-gray/20 overflow-x-auto scrollbar-none">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex-1 min-w-[76px] py-1.5 px-3 text-xs font-medium rounded-lg flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap ${
              isActive
                ? 'bg-white text-dark-charcoal shadow-apple-subtle border border-border-gray/10'
                : 'text-dark-charcoal/60 hover:text-dark-charcoal hover:bg-white/40'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent-blue' : 'text-border-gray'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}


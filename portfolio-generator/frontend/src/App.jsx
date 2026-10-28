import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SplitWorkspace from './components/SplitWorkspace';
import PublicPortfolioView from './components/Public/PublicPortfolioView';
import api from './api/client';
import { X, Lock, Mail, User as UserIcon } from 'lucide-react';

const DEFAULT_PORTFOLIO = {
  id: 'local-draft',
  title: 'Alex Rivera — Staff Distributed Systems Engineer',
  slug: 'alex-rivera',
  theme: 'minimalist',
  is_published: false,
  sections_data: {
    profile: {
      name: 'Alex Rivera',
      target_role: 'Staff Distributed Systems Engineer',
      email: 'alex.rivera@example.com',
      phone: '+1 (555) 392-1084',
      location: 'San Francisco, CA',
      bio: 'Staff engineer with 9+ years architecting high-throughput distributed systems, real-time event streaming pipelines, and fault-tolerant cloud platforms.',
      github: 'https://github.com/alexrivera-dev',
      linkedin: 'https://linkedin.com/in/alexrivera-dev',
      website: 'https://alexrivera.dev',
    },
    experience: [
      {
        company: 'Vanguard Cloud Systems',
        role: 'Staff Infrastructure Architect',
        start_date: '2021',
        end_date: 'Present',
        description: 'Directing distributed consensus and storage fabric powering multi-tenant platform services.',
        highlights: [
          '• Architected multi-region consensus layer processing 45,000 requests/sec with p99 latency under 22ms.',
          '• Championed zero-downtime database migration strategy reducing cloud compute costs by 34% ($480k annual savings).',
          '• Mentored 8 senior engineers and introduced automated canary deployment pipelines across 14 global regions.',
        ],
      },
      {
        company: 'Nexus Scale Labs',
        role: 'Senior Backend Engineer',
        start_date: '2018',
        end_date: '2021',
        description: 'Engineered high-scale asynchronous event-driven services and developer tooling.',
        highlights: [
          '• Built distributed job scheduler managing 2M+ background tasks daily with guaranteed at-least-once delivery.',
          '• Optimized Postgres query performance, driving 95th percentile database latency down from 420ms to 45ms.',
        ],
      },
    ],
    projects: [
      {
        title: 'ChronoStream: Distributed Event Engine',
        description: 'Low-latency append-only commit log engine built in Go with Raft consensus protocol.',
        technologies: ['Go', 'Raft', 'gRPC', 'Docker', 'Prometheus'],
        link: 'https://github.com/alexrivera-dev/chronostream',
      },
      {
        title: 'PulseTelemetry Dashboard',
        description: 'Real-time observability platform with sub-second metrics streaming and alerting.',
        technologies: ['React', 'TypeScript', 'Python', 'Django', 'Tailwind CSS'],
        link: 'https://github.com/alexrivera-dev/pulsetelemetry',
      },
    ],
    skills: [
      'Python', 'Django', 'React', 'Go', 'Distributed Systems',
      'Docker', 'Kubernetes', 'PostgreSQL', 'Tailwind CSS', 'Kafka', 'System Architecture'
    ],
  },
};

export default function App() {
  const [portfolio, setPortfolio] = useState(() => {
    const saved = localStorage.getItem('active_portfolio');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_PORTFOLIO;
  });

  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '', target_role: '' });
  const [authError, setAuthError] = useState(null);
  const [operationError, setOperationError] = useState(null);

  // Check URL pathname for public portfolio routing: /p/:slug
  const path = window.location.pathname;
  const isPublicRoute = path.startsWith('/p/');
  const publicSlug = isPublicRoute ? path.replace('/p/', '').replace(/\/$/, '') : null;

  // Sync to local storage for instant offline resilience
  useEffect(() => {
    localStorage.setItem('active_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // Attempt initial auth check
  useEffect(() => {
    const checkAuth = async () => {
      if (api.token) {
        try {
          const me = await api.getMe();
          setUser(me);
          try {
            const portfolios = await api.listPortfolios();
            if (portfolios.length > 0) setPortfolio(portfolios[0]);
          } catch (err) {
            setOperationError(`Could not load saved portfolios: ${err.message}`);
          }
        } catch {
          api.logout();
          setUser(null);
        }
      }
    };
    checkAuth();
  }, []);

  const handleSave = async () => {
    setOperationError(null);
    if (!user) {
      setAuthMode('login');
      setAuthModalOpen(true);
      setOperationError('Sign in to save your portfolio to your account.');
      return;
    }

    setIsSaving(true);
    try {
      if (portfolio.id && portfolio.id !== 'local-draft' && portfolio.slug) {
        const updated = await api.updatePortfolio(portfolio.slug, portfolio);
        setPortfolio(updated);
      } else {
        const created = await api.createPortfolio(portfolio);
        setPortfolio(created);
      }
    } catch (err) {
      setOperationError(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    setOperationError(null);
    if (!user) {
      setAuthMode('login');
      setAuthModalOpen(true);
      setOperationError('Sign in to publish your portfolio.');
      return;
    }

    const nextState = !portfolio.is_published;
    try {
      const updated = portfolio.id && portfolio.id !== 'local-draft' && portfolio.slug
        ? await api.updatePortfolio(portfolio.slug, { is_published: nextState })
        : await api.createPortfolio({ ...portfolio, is_published: nextState });
      setPortfolio(updated);
    } catch (err) {
      setOperationError(`Publish failed: ${err.message}`);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    let response;
    try {
      if (authMode === 'login') {
        response = await api.login(authForm.username, authForm.password);
      } else {
        response = await api.register(authForm);
      }
      setUser(response.user);
      setAuthModalOpen(false);
      setAuthError(null);
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
      return;
    }

    setOperationError(null);
    try {
      const portfolios = await api.listPortfolios();
      if (portfolios.length > 0) {
        setPortfolio(portfolios[0]);
      } else {
        setPortfolio(await api.createPortfolio(portfolio));
      }
    } catch (err) {
      setOperationError(`Account connected, but portfolio sync failed: ${err.message}`);
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setOperationError(null);
  };

  // If visiting public path /p/:slug directly, show clean public view
  if (isPublicRoute && publicSlug) {
    return <PublicPortfolioView slug={publicSlug} initialData={publicSlug === portfolio.slug ? portfolio : null} />;
  }

  return (
    <div className="min-h-screen bg-bg-slate flex flex-col font-sans">
      <Navbar
        portfolio={portfolio}
        onSave={handleSave}
        onPublishToggle={handlePublishToggle}
        isSaving={isSaving}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {operationError && (
        <div role="alert" className="px-6 py-2 text-sm text-red-700 bg-red-50 border-b border-red-200">
          {operationError}
        </div>
      )}

      <SplitWorkspace
        portfolio={portfolio}
        onUpdatePortfolio={setPortfolio}
        onSave={handleSave}
      />

      {/* Auth Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-apple-lg shadow-2xl border border-border-gray/20 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-gray/10 pb-3">
              <h3 className="text-sm font-semibold text-dark-charcoal">
                {authMode === 'login' ? 'Sign In to Cloud Sync' : 'Create Free Account'}
              </h3>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="p-1 text-border-gray hover:text-dark-charcoal rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-dark-charcoal/80 mb-1">
                  Username
                </label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-border-gray absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={authForm.username}
                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-apple border border-border-gray/30 focus:outline-none focus:border-accent-blue"
                  />
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-dark-charcoal/80 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-border-gray absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-apple border border-border-gray/30 focus:outline-none focus:border-accent-blue"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-dark-charcoal/80 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-border-gray absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-apple border border-border-gray/30 focus:outline-none focus:border-accent-blue"
                  />
                </div>
              </div>

              {authError && <p className="text-xs text-red-500">{authError}</p>}

              <button
                type="submit"
                className="w-full py-2 bg-dark-charcoal text-white text-xs font-medium rounded-apple hover:bg-dark-charcoal/90 transition-all shadow-apple-subtle"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-border-gray/10 text-xs text-border-gray">
              {authMode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setAuthMode('register')}
                    className="text-accent-blue font-medium hover:underline"
                  >
                    Register
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-accent-blue font-medium hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

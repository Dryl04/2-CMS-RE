import { useState } from 'react';
import { Layout, LogOut, User, FileText, Image, TrendingUp, Paintbrush, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onNavigate?: (view: string) => void;
  currentView?: string;
}

const NAV_ITEMS = [
  { key: 'pages', label: 'Pages', icon: FileText },
  { key: 'visual-builder', label: 'Createur Visuel', icon: Sparkles, highlight: true },
  { key: 'templates', label: 'Editeur Avance', icon: Paintbrush },
  { key: 'media', label: 'Medias', icon: Image },
  { key: 'analytics', label: 'Stats', icon: TrendingUp },
];

export default function Header({ onNavigate, currentView }: HeaderProps) {
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900 hidden sm:inline">SEO Manager</span>
          </button>

          {profile && (
            <div className="hidden lg:flex items-center space-x-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.key;
                const isHighlight = (item as any).highlight;
                return (
                  <button
                    key={item.key}
                    onClick={() => onNavigate?.(item.key)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? isHighlight
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-900 text-white'
                        : isHighlight
                        ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center space-x-3">
            {profile && (
              <>
                <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <div className="w-7 h-7 bg-gray-200 rounded-md flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-gray-900 leading-tight">
                      {profile.full_name || profile.email}
                    </p>
                    <p className="text-[10px] text-gray-500 capitalize leading-tight">
                      {profile.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={signOut}
                  className="flex items-center space-x-1.5 text-gray-500 hover:text-gray-900 transition-colors px-3 py-2 hover:bg-gray-50 rounded-lg"
                  title="Deconnexion"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">Quitter</span>
                </button>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {mobileMenuOpen && profile && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.key;
              const isHighlight = (item as any).highlight;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onNavigate?.(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? isHighlight
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-900 text-white'
                      : isHighlight
                      ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

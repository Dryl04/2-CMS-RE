import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Theme, ThemeColors } from '../lib/themeTypes';
import { Palette, Plus, Trash2, Copy, Check, Eye, AlertCircle, Download, ExternalLink, ClipboardCopy, Code } from 'lucide-react';
import { getSQLScript } from '../lib/setupThemes';
import { ThemeCSSEditor } from './ThemeCSSEditor';

export const ThemeManager: React.FC = () => {
  const { themes, currentTheme, setCurrentTheme, createTheme, deleteTheme, loading, error, initializeDefaultThemes } = useTheme();
  const [initializing, setInitializing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCSSTheme, setEditingCSSTheme] = useState<Theme | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeDescription, setNewThemeDescription] = useState('');
  const [baseTheme, setBaseTheme] = useState<Theme | null>(null);

  const handleDuplicateTheme = async (theme: Theme) => {
    setBaseTheme(theme);
    setNewThemeName(`${theme.name} (Copy)`);
    setNewThemeDescription(theme.description || '');
    setShowCreateModal(true);
  };

  const handleCreateTheme = async () => {
    if (!newThemeName.trim() || !baseTheme) return;

    const newTheme = await createTheme({
      name: newThemeName,
      description: newThemeDescription,
      colors: baseTheme.colors,
      typography: baseTheme.typography,
      spacing: baseTheme.spacing,
      components: baseTheme.components,
      user_id: null,
      is_default: false,
    });

    if (newTheme) {
      setShowCreateModal(false);
      setNewThemeName('');
      setNewThemeDescription('');
      setBaseTheme(null);
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    if (window.confirm('Are you sure you want to delete this theme?')) {
      await deleteTheme(themeId);
    }
  };

  const handleInitializeThemes = async () => {
    try {
      setInitializing(true);
      await initializeDefaultThemes();
    } catch (err) {
      console.error('Failed to initialize themes:', err);
    } finally {
      setInitializing(false);
    }
  };

  const handleCopySQL = async () => {
    const sql = getSQLScript();
    try {
      await navigator.clipboard.writeText(sql);
      alert('✅ SQL script copied to clipboard!\n\nNow:\n1. Open Supabase Dashboard\n2. Go to SQL Editor\n3. Paste and execute');
    } catch (err) {
      console.error('Failed to copy:', err);
      const textarea = document.createElement('textarea');
      textarea.value = sql;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('✅ SQL script copied to clipboard!');
    }
  };

  const handleOpenSupabase = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
      if (projectRef) {
        window.open(`https://supabase.com/dashboard/project/${projectRef}/sql/new`, '_blank');
      }
    }
  };

  const getColorPreview = (colors: ThemeColors) => {
    return [colors.primary, colors.secondary, colors.accent, colors.success, colors.warning];
  };

  if (loading || initializing) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-600 mt-4">{initializing ? 'Initializing themes...' : 'Loading...'}</p>
      </div>
    );
  }

  if (error && error.includes('relation "themes" does not exist')) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Theme Table Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The themes table needs to be created in your Supabase database. Click below to set it up automatically.
            </p>

            <div className="flex flex-col gap-3 mb-6">
              <button
                onClick={async () => {
                  await handleCopySQL();
                  handleOpenSupabase();
                }}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Copy SQL & Open Supabase Dashboard
              </button>

              <button
                onClick={handleCopySQL}
                className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <ClipboardCopy className="w-5 h-5" />
                Just Copy SQL Script
              </button>
            </div>

            <div className="bg-white rounded-lg p-4 text-left">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Steps:</p>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Click the button above (SQL will be copied automatically)</li>
                <li>In the Supabase SQL Editor that opens, paste the SQL</li>
                <li>Click "Run" or press Ctrl/Cmd + Enter</li>
                <li>Return here and refresh the page</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (themes.length === 0 && !error) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <Download className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Themes Found
            </h2>
            <p className="text-gray-600 mb-6">
              The themes table is empty. Click below to initialize it with 5 modern pre-built themes.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleInitializeThemes}
                disabled={initializing}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {initializing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Initializing...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Initialize Default Themes
                  </>
                )}
              </button>

              <details className="mt-4">
                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                  Having trouble? Use manual setup
                </summary>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={async () => {
                      await handleCopySQL();
                      handleOpenSupabase();
                    }}
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Copy SQL & Open Dashboard
                  </button>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Palette className="w-8 h-8" />
              Theme Manager
            </h1>
            <p className="text-gray-600 mt-1">
              Manage visual themes for your pages
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-900">Error Loading Themes</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map(theme => (
          <div
            key={theme.id}
            className={`relative bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl ${
              currentTheme?.id === theme.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div
              className="h-32 p-6 flex items-center justify-center"
              style={{ backgroundColor: theme.colors.background }}
            >
              <div className="flex gap-2">
                {getColorPreview(theme.colors).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 rounded-lg shadow-md"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="p-6" style={{ backgroundColor: theme.colors.surface }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: theme.colors.text }}
                  >
                    {theme.name}
                  </h3>
                  {theme.is_default && (
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 mt-1">
                      System Theme
                    </span>
                  )}
                </div>
                {currentTheme?.id === theme.id && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
              </div>

              {theme.description && (
                <p
                  className="text-sm mb-4"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {theme.description}
                </p>
              )}

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setCurrentTheme(theme)}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: theme.colors.primary,
                    color: '#ffffff',
                  }}
                >
                  <Eye className="w-4 h-4 inline mr-1" />
                  Preview
                </button>

                <button
                  onClick={() => handleDuplicateTheme(theme)}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                  title="Duplicate theme"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {!theme.is_default && (
                  <button
                    onClick={() => setEditingCSSTheme(theme)}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: theme.colors.surface,
                      color: theme.colors.text,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                    title="Edit CSS"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                )}

                {!theme.is_default && (
                  <button
                    onClick={() => handleDeleteTheme(theme.id)}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    title="Delete theme"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingCSSTheme && (
        <ThemeCSSEditor
          theme={editingCSSTheme}
          onClose={() => setEditingCSSTheme(null)}
        />
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create Custom Theme</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme Name
                </label>
                <input
                  type="text"
                  value={newThemeName}
                  onChange={e => setNewThemeName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="My Custom Theme"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newThemeDescription}
                  onChange={e => setNewThemeDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="A brief description of your theme"
                  rows={3}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  This will create a copy of "{baseTheme?.name}" that you can customize later.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateTheme}
                disabled={!newThemeName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Create Theme
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewThemeName('');
                  setNewThemeDescription('');
                  setBaseTheme(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Save, X, Trash2, Plus, Copy, Palette, Type, Ruler, Weight, Upload, Download } from 'lucide-react';
import { PageTheme } from '../lib/pageThemes';
import { createEmptyTheme, isCustomTheme } from '../lib/pageThemesStorage';
import { usePageTheme } from '../contexts/PageThemeContext';
import { supabase } from '../lib/supabase';
import FontImporter from './FontImporter';

interface PageThemeEditorProps {
  onClose: () => void;
  initialThemeId?: string;
}

const GOOGLE_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Work Sans',
  'Playfair Display',
  'Merriweather',
  'Lora',
  'Georgia',
  'Times New Roman',
  'Arial',
  'Helvetica',
];

const FONT_WEIGHTS = [
  { value: '300', label: 'Léger (300)' },
  { value: '400', label: 'Normal (400)' },
  { value: '500', label: 'Moyen (500)' },
  { value: '600', label: 'Semi-gras (600)' },
  { value: '700', label: 'Gras (700)' },
  { value: '800', label: 'Extra-gras (800)' },
  { value: '900', label: 'Ultra-gras (900)' },
];

interface FontLibraryItem {
  id: string;
  font_name: string;
  font_family: string;
}

export default function PageThemeEditor({ onClose, initialThemeId }: PageThemeEditorProps) {
  const { pageThemes, loading, saveTheme, deleteTheme: deleteThemeContext, migrateLegacyThemes } = usePageTheme();
  const [editingTheme, setEditingTheme] = useState<PageTheme | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customThemes, setCustomThemes] = useState<PageTheme[]>([]);
  const [defaultThemes, setDefaultThemes] = useState<PageTheme[]>([]);
  const [migrating, setMigrating] = useState(false);
  const [showMigrationBanner, setShowMigrationBanner] = useState(false);
  const [showFontImporter, setShowFontImporter] = useState(false);
  const [availableFonts, setAvailableFonts] = useState<FontLibraryItem[]>([]);

  useEffect(() => {
    if (pageThemes.length > 0) {
      const defaults = pageThemes.filter(t => t.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i));
      const customs = pageThemes.filter(t => !t.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i));
      setDefaultThemes(defaults);
      setCustomThemes(customs);
    }

    if (typeof window !== 'undefined') {
      const hasLocalThemes = localStorage.getItem('custom_page_themes');
      setShowMigrationBanner(!!hasLocalThemes);
    }
  }, [pageThemes]);

  useEffect(() => {
    loadAvailableFonts();
  }, []);

  const loadAvailableFonts = async () => {
    try {
      const { data, error } = await supabase
        .from('fonts_library')
        .select('id, font_name, font_family')
        .order('font_name');

      if (error) throw error;
      setAvailableFonts(data || []);

      (data || []).forEach(font => {
        const link = document.createElement('link');
        const fontUrl = `https://fonts.googleapis.com/css2?family=${font.font_name.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
        link.href = fontUrl;
        link.rel = 'stylesheet';
        if (!document.querySelector(`link[href="${fontUrl}"]`)) {
          document.head.appendChild(link);
        }
      });
    } catch (error) {
      console.error('Error loading fonts:', error);
    }
  };

  useEffect(() => {
    if (initialThemeId && pageThemes.length > 0) {
      const theme = pageThemes.find(t => t.id === initialThemeId);
      if (theme) {
        isCustomTheme(initialThemeId).then(isCustom => {
          if (isCustom) {
            setEditingTheme({ ...theme });
          }
        });
      }
    }
  }, [initialThemeId, pageThemes]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMigrate = async () => {
    setMigrating(true);
    try {
      const result = await migrateLegacyThemes();
      if (result.success) {
        showToast(result.message);
        setShowMigrationBanner(false);
      } else {
        showToast(`Erreur: ${result.message}`);
      }
    } catch (error) {
      showToast('Erreur lors de la migration');
    } finally {
      setMigrating(false);
    }
  };

  const handleSaveTheme = async () => {
    if (!editingTheme) return;

    if (!editingTheme.name.trim()) {
      showToast('Le nom du thème est requis');
      return;
    }

    const duplicate = pageThemes.find(t =>
      t.id !== editingTheme.id &&
      t.name.trim().toLowerCase() === editingTheme.name.trim().toLowerCase()
    );

    if (duplicate) {
      showToast('Un thème avec ce nom existe déjà');
      return;
    }

    const cssString = JSON.stringify(editingTheme.css);
    const exactDuplicate = pageThemes.find(t =>
      t.id !== editingTheme.id &&
      JSON.stringify(t.css) === cssString
    );

    if (exactDuplicate) {
      showToast('Un thème identique existe déjà. Modifiez au moins une propriété.');
      return;
    }

    try {
      await saveTheme(editingTheme);
      showToast('Thème enregistré');
      setEditingTheme(null);
    } catch (error) {
      showToast('Erreur lors de l\'enregistrement');
    }
  };

  const handleDeleteTheme = async (themeId: string) => {
    if (!confirm('Supprimer ce thème ?')) return;

    try {
      await deleteThemeContext(themeId);
      showToast('Thème supprimé');
      if (editingTheme?.id === themeId) {
        setEditingTheme(null);
      }
    } catch (error) {
      showToast('Erreur lors de la suppression');
    }
  };

  const handleDuplicateTheme = (theme: PageTheme) => {
    const duplicate = {
      ...theme,
      id: `temp-${Date.now()}`,
      name: `${theme.name} (copie)`,
    };
    setEditingTheme(duplicate);
  };

  const handleNewTheme = () => {
    setEditingTheme(createEmptyTheme());
  };

  const updateThemeField = (field: keyof PageTheme, value: any) => {
    if (!editingTheme) return;
    setEditingTheme({ ...editingTheme, [field]: value });
  };

  const updateCSSField = (field: keyof PageTheme['css'], value: string) => {
    if (!editingTheme) return;
    setEditingTheme({
      ...editingTheme,
      css: { ...editingTheme.css, [field]: value },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Palette className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold">Gestionnaire de thèmes CSS</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Liste des thèmes */}
          <div className="w-80 border-r bg-gray-50 overflow-auto">
            <div className="p-4 space-y-3">
              {showMigrationBanner && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Upload className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 text-xs">
                      <p className="font-medium text-yellow-800 mb-1">Thèmes locaux détectés</p>
                      <p className="text-yellow-700 mb-2">Migrez vos thèmes vers le cloud</p>
                      <button
                        onClick={handleMigrate}
                        disabled={migrating}
                        className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                      >
                        {migrating ? 'Migration...' : 'Migrer'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleNewTheme}
                className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Nouveau thème</span>
              </button>

              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto"></div>
                  <p className="text-xs text-gray-500 mt-2">Chargement...</p>
                </div>
              )}

              {!loading && defaultThemes.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase px-2">Thèmes par défaut</h3>
                  {defaultThemes.map(theme => (
                  <div
                    key={theme.id}
                    className="bg-white rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{theme.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{theme.description}</p>
                      </div>
                      <button
                        onClick={() => handleDuplicateTheme(theme)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Dupliquer"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
                </div>
              )}

              {!loading && customThemes.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase px-2">Thèmes personnalisés</h3>
                  {customThemes.map(theme => (
                    <div
                      key={theme.id}
                      className={`bg-white rounded-lg p-3 border-2 cursor-pointer transition-colors ${
                        editingTheme?.id === theme.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setEditingTheme({ ...theme })}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{theme.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{theme.description}</p>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateTheme(theme);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Dupliquer"
                          >
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTheme(theme.id);
                            }}
                            className="p-1.5 hover:bg-red-50 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Éditeur */}
          <div className="flex-1 overflow-auto p-6">
            {editingTheme ? (
              <div className="space-y-6 max-w-3xl">
                {/* Informations générales */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du thème
                      </label>
                      <input
                        type="text"
                        value={editingTheme.name}
                        onChange={(e) => updateThemeField('name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Mon thème personnalisé"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editingTheme.description}
                        onChange={(e) => updateThemeField('description', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        placeholder="Description du thème"
                      />
                    </div>
                  </div>
                </div>

                {/* Polices */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Type className="w-5 h-5 text-gray-700" />
                      <h3 className="text-lg font-semibold">Polices</h3>
                    </div>
                    <button
                      onClick={() => setShowFontImporter(true)}
                      className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Importer polices</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Police du texte
                      </label>
                      <select
                        value={editingTheme.css.bodyFont.split(',')[0].replace(/"/g, '').trim()}
                        onChange={(e) => updateCSSField('bodyFont', `"${e.target.value}", system-ui, sans-serif`)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {availableFonts.map(font => (
                          <option key={font.id} value={font.font_name}>{font.font_name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Police des titres
                      </label>
                      <select
                        value={editingTheme.css.headingFont.split(',')[0].replace(/"/g, '').trim()}
                        onChange={(e) => updateCSSField('headingFont', `"${e.target.value}", system-ui, sans-serif`)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {availableFonts.map(font => (
                          <option key={font.id} value={font.font_name}>{font.font_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Couleurs générales */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Palette className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-semibold">Couleurs générales</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Arrière-plan
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={editingTheme.css.backgroundColor || '#ffffff'}
                          onChange={(e) => updateCSSField('backgroundColor', e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editingTheme.css.backgroundColor || '#ffffff'}
                          onChange={(e) => updateCSSField('backgroundColor', e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur primaire
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={editingTheme.css.primaryColor || '#3b82f6'}
                          onChange={(e) => updateCSSField('primaryColor', e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editingTheme.css.primaryColor || '#3b82f6'}
                          onChange={(e) => updateCSSField('primaryColor', e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur secondaire
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={editingTheme.css.secondaryColor || '#8b5cf6'}
                          onChange={(e) => updateCSSField('secondaryColor', e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editingTheme.css.secondaryColor || '#8b5cf6'}
                          onChange={(e) => updateCSSField('secondaryColor', e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder="#8b5cf6"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur d'accent
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={editingTheme.css.accentColor || '#10b981'}
                          onChange={(e) => updateCSSField('accentColor', e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editingTheme.css.accentColor || '#10b981'}
                          onChange={(e) => updateCSSField('accentColor', e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder="#10b981"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Couleurs du texte */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Palette className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-semibold">Couleurs du texte</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur du texte
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={editingTheme.css.textColor}
                          onChange={(e) => updateCSSField('textColor', e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editingTheme.css.textColor}
                          onChange={(e) => updateCSSField('textColor', e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Couleur des titres (par défaut)
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={editingTheme.css.headingColor}
                          onChange={(e) => updateCSSField('headingColor', e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editingTheme.css.headingColor}
                          onChange={(e) => updateCSSField('headingColor', e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Couleurs individuelles des titres */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Palette className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-semibold">Couleurs des titres (personnalisées)</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Par défaut, les titres héritent de la couleur par défaut. H2 hérite de H1, H3 hérite de H2.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        H1 {!editingTheme.css.h1Color && <span className="text-xs text-gray-500">(hérite)</span>}
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={editingTheme.css.h1Color || editingTheme.css.headingColor}
                          onChange={(e) => updateCSSField('h1Color', e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editingTheme.css.h1Color || ''}
                          onChange={(e) => updateCSSField('h1Color', e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder={editingTheme.css.headingColor}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        H2 {!editingTheme.css.h2Color && <span className="text-xs text-gray-500">(hérite)</span>}
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={editingTheme.css.h2Color || editingTheme.css.h1Color || editingTheme.css.headingColor}
                          onChange={(e) => updateCSSField('h2Color', e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editingTheme.css.h2Color || ''}
                          onChange={(e) => updateCSSField('h2Color', e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder={editingTheme.css.h1Color || editingTheme.css.headingColor}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        H3 {!editingTheme.css.h3Color && <span className="text-xs text-gray-500">(hérite)</span>}
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={editingTheme.css.h3Color || editingTheme.css.h2Color || editingTheme.css.h1Color || editingTheme.css.headingColor}
                          onChange={(e) => updateCSSField('h3Color', e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editingTheme.css.h3Color || ''}
                          onChange={(e) => updateCSSField('h3Color', e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          placeholder={editingTheme.css.h2Color || editingTheme.css.h1Color || editingTheme.css.headingColor}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tailles de texte */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Ruler className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-semibold">Tailles du texte</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Petit</label>
                      <input
                        type="text"
                        value={editingTheme.css.textSm}
                        onChange={(e) => updateCSSField('textSm', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="14px"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Normal</label>
                      <input
                        type="text"
                        value={editingTheme.css.textBase}
                        onChange={(e) => updateCSSField('textBase', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="16px"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Grand</label>
                      <input
                        type="text"
                        value={editingTheme.css.textLg}
                        onChange={(e) => updateCSSField('textLg', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="18px"
                      />
                    </div>
                  </div>
                </div>

                {/* Tailles des titres */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Ruler className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-semibold">Tailles des titres</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">H1</label>
                      <input
                        type="text"
                        value={editingTheme.css.h1Size}
                        onChange={(e) => updateCSSField('h1Size', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="48px"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">H2</label>
                      <input
                        type="text"
                        value={editingTheme.css.h2Size}
                        onChange={(e) => updateCSSField('h2Size', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="36px"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">H3</label>
                      <input
                        type="text"
                        value={editingTheme.css.h3Size}
                        onChange={(e) => updateCSSField('h3Size', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="30px"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">H4</label>
                      <input
                        type="text"
                        value={editingTheme.css.h4Size}
                        onChange={(e) => updateCSSField('h4Size', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="24px"
                      />
                    </div>
                  </div>
                </div>

                {/* Poids de police */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Weight className="w-5 h-5 text-gray-700" />
                    <h3 className="text-lg font-semibold">Épaisseur</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Épaisseur du texte
                      </label>
                      <select
                        value={editingTheme.css.textWeight}
                        onChange={(e) => updateCSSField('textWeight', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {FONT_WEIGHTS.map(weight => (
                          <option key={weight.value} value={weight.value}>{weight.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Épaisseur des titres
                      </label>
                      <select
                        value={editingTheme.css.headingWeight}
                        onChange={(e) => updateCSSField('headingWeight', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {FONT_WEIGHTS.map(weight => (
                          <option key={weight.value} value={weight.value}>{weight.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Aperçu */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Aperçu</h3>
                  <div
                    className="bg-white rounded-lg p-8 border border-gray-200"
                    style={{
                      fontFamily: editingTheme.css.bodyFont,
                      color: editingTheme.css.textColor,
                      fontWeight: editingTheme.css.textWeight,
                      backgroundColor: editingTheme.css.backgroundColor || '#ffffff',
                    }}
                  >
                    <h1
                      style={{
                        fontFamily: editingTheme.css.headingFont,
                        color: editingTheme.css.h1Color || editingTheme.css.headingColor,
                        fontSize: editingTheme.css.h1Size,
                        fontWeight: editingTheme.css.headingWeight,
                        marginBottom: '1rem',
                      }}
                    >
                      Titre H1
                    </h1>
                    <h2
                      style={{
                        fontFamily: editingTheme.css.headingFont,
                        color: editingTheme.css.h2Color || editingTheme.css.h1Color || editingTheme.css.headingColor,
                        fontSize: editingTheme.css.h2Size,
                        fontWeight: editingTheme.css.headingWeight,
                        marginBottom: '1rem',
                      }}
                    >
                      Titre H2
                    </h2>
                    <h3
                      style={{
                        fontFamily: editingTheme.css.headingFont,
                        color: editingTheme.css.h3Color || editingTheme.css.h2Color || editingTheme.css.h1Color || editingTheme.css.headingColor,
                        fontSize: editingTheme.css.h3Size,
                        fontWeight: editingTheme.css.headingWeight,
                        marginBottom: '1rem',
                      }}
                    >
                      Titre H3
                    </h3>
                    <p style={{ fontSize: editingTheme.css.textBase, marginBottom: '1rem' }}>
                      Ceci est un exemple de texte normal. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <p style={{ fontSize: editingTheme.css.textSm }}>
                      Ceci est un exemple de texte petit.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setEditingTheme(null)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveTheme}
                    className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Palette className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Sélectionnez ou créez un thème</p>
                  <p className="text-sm mt-2">Choisissez un thème dans la liste ou créez-en un nouveau</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {toastMessage}
          </div>
        )}
      </div>

      {showFontImporter && (
        <FontImporter
          onClose={() => setShowFontImporter(false)}
          onFontImported={loadAvailableFonts}
        />
      )}
    </div>
  );
}

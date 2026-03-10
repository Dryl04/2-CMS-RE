import { useState, useEffect } from 'react';
import { useModal } from '@/contexts/ModalContext';
import { X, Search, Download, Check } from 'lucide-react';
import { api } from '@/lib/api';

interface FontImporterProps {
  onClose: () => void;
  onFontImported?: () => void;
}

interface FontLibraryItem {
  id: string;
  font_name: string;
  font_family: string;
  font_url: string;
  font_weights: string[];
  is_google_font: boolean;
  is_system: boolean;
  imported_by: string | null;
}

type FontSource = 'google' | 'websafe';

interface AvailableFontItem {
  name: string;
  source: FontSource;
}

type FontTab = 'available' | 'imported';

const WEB_SAFE_FONTS: AvailableFontItem[] = [
  { name: 'Times New Roman', source: 'websafe' },
  { name: 'Georgia', source: 'websafe' },
  { name: 'Arial', source: 'websafe' },
  { name: 'Helvetica', source: 'websafe' },
  { name: 'Verdana', source: 'websafe' },
  { name: 'Trebuchet MS', source: 'websafe' },
  { name: 'Tahoma', source: 'websafe' },
  { name: 'Courier New', source: 'websafe' },
  { name: 'Segoe UI', source: 'websafe' },
];

const POPULAR_GOOGLE_FONTS = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Inter', 'Nunito', 'Work Sans', 'Source Sans 3', 'PT Sans',
  'Merriweather', 'Playfair Display', 'Lora', 'Crimson Pro', 'Bitter', 'Libre Baskerville', 'Cormorant Garamond', 'Arvo',
  'Raleway', 'Oswald', 'Bebas Neue', 'Anton', 'Barlow', 'Titillium Web', 'Archivo', 'Kanit', 'Rubik', 'Manrope',
  'Fira Sans', 'DM Sans', 'Urbanist', 'Plus Jakarta Sans', 'Red Hat Display', 'Cabin', 'Alegreya Sans', 'Public Sans',
  'Noto Sans', 'Noto Serif', 'Noto Sans JP', 'Noto Sans KR', 'Noto Sans SC', 'Hind', 'Mukta', 'Karla', 'Inconsolata',
  'JetBrains Mono', 'IBM Plex Sans', 'IBM Plex Serif', 'Space Grotesk', 'Space Mono', 'Overpass', 'Exo 2', 'Sora',
  'Quicksand', 'Mulish', 'Asap', 'Heebo', 'Varela Round', 'Baloo 2', 'Josefin Sans', 'Questrial', 'Signika',
  'Ubuntu', 'Roboto Condensed', 'Roboto Slab', 'Assistant', 'Tajawal', 'Cairo', 'Amiri', 'Palanquin', 'Teko',
  'Dancing Script', 'Pacifico', 'Great Vibes', 'Satisfy', 'Shadows Into Light', 'Caveat', 'Indie Flower', 'Cookie',
  'Lobster', 'Abril Fatface', 'Cinzel', 'Bungee', 'Alfa Slab One', 'Righteous', 'Fredoka', 'Comfortaa', 'Vollkorn'
];

const GOOGLE_FONTS: AvailableFontItem[] = POPULAR_GOOGLE_FONTS.map(name => ({
  name,
  source: 'google',
}));

const AVAILABLE_FONTS: AvailableFontItem[] = [...WEB_SAFE_FONTS, ...GOOGLE_FONTS];

const WEB_SAFE_FONT_FAMILY: Record<string, string> = {
  'Times New Roman': '"Times New Roman", Times, serif',
  'Georgia': 'Georgia, serif',
  'Arial': 'Arial, Helvetica, sans-serif',
  'Helvetica': 'Helvetica, Arial, sans-serif',
  'Verdana': 'Verdana, Geneva, sans-serif',
  'Trebuchet MS': '"Trebuchet MS", sans-serif',
  'Tahoma': 'Tahoma, Geneva, sans-serif',
  'Courier New': '"Courier New", Courier, monospace',
  'Segoe UI': '"Segoe UI", Arial, sans-serif',
};

export default function FontImporter({ onClose, onFontImported }: FontImporterProps) {
  const modal = useModal();
  const [activeTab, setActiveTab] = useState<FontTab>('available');
  const [searchTerm, setSearchTerm] = useState('');
  const [customFontName, setCustomFontName] = useState('');
  const [importedFonts, setImportedFonts] = useState<FontLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadImportedFonts();
  }, []);

  const loadImportedFonts = async () => {
    try {
      const { data, error } = await api.fonts.list();

      if (error) throw error;
      setImportedFonts(data || []);
    } catch (error) {
      console.error('Error loading fonts:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleImportFont = async (fontName: string) => {
    const normalizedName = fontName.trim();
    if (!normalizedName) {
      showToast('Nom de police invalide');
      return;
    }

    setImporting(normalizedName);
    try {
      const { data: userData } = await api.auth.getUser();
      if (!userData) {
        showToast('Vous devez être connecté');
        return;
      }

      const alreadyImported = importedFonts.find(
        f => f.font_name.toLowerCase() === normalizedName.toLowerCase()
      );
      if (alreadyImported) {
        showToast('Police déjà importée');
        setImporting(null);
        return;
      }

      const isWebSafeFont = Object.prototype.hasOwnProperty.call(WEB_SAFE_FONT_FAMILY, normalizedName);
      const fontUrlName = normalizedName.replace(/\s+/g, '+');
      const fontUrl = isWebSafeFont
        ? 'about:blank'
        : `https://fonts.googleapis.com/css2?family=${fontUrlName}:wght@300;400;500;600;700;800;900&display=swap`;
      const fontFamily = isWebSafeFont
        ? WEB_SAFE_FONT_FAMILY[normalizedName]
        : `"${normalizedName}", system-ui, sans-serif`;
      const fontWeights = isWebSafeFont
        ? ['400', '700']
        : ['300', '400', '500', '600', '700', '800', '900'];

      const { error } = await api.fonts.create({
          font_name: normalizedName,
          font_family: fontFamily,
          font_url: fontUrl,
          font_weights: fontWeights,
          is_google_font: !isWebSafeFont,
          imported_by: userData.id,
          is_system: false,
        });

      if (error) throw error;

      showToast(`Police ${normalizedName} importée`);
      await loadImportedFonts();
      setCustomFontName('');

      if (onFontImported) {
        onFontImported();
      }

      if (!isWebSafeFont) {
        const link = document.createElement('link');
        link.href = fontUrl;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }

    } catch (error) {
      console.error('Error importing font:', error);
      showToast('Erreur lors de l\'importation');
    } finally {
      setImporting(null);
    }
  };

  const handleDeleteFont = async (fontId: string, fontName: string) => {
    if (!await modal.confirm(`Supprimer la police ${fontName} ?`, 'Supprimer la police')) return;

    try {
      const { error } = await api.fonts.delete(fontId);

      if (error) throw error;

      showToast('Police supprimée');
      await loadImportedFonts();

      if (onFontImported) {
        onFontImported();
      }
    } catch (error) {
      console.error('Error deleting font:', error);
      showToast('Erreur lors de la suppression');
    }
  };

  const filteredFonts = AVAILABLE_FONTS.filter(font =>
    font.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isFontImported = (fontName: string) => {
    return importedFonts.some(f => f.font_name.toLowerCase() === fontName.toLowerCase());
  };

  const canDeleteFont = (font: FontLibraryItem) => {
    return !font.is_system && font.imported_by !== null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Importer des polices Google Fonts</h2>
            <p className="text-sm text-gray-500 mt-1">
              Les polices importées seront disponibles dans tous vos thèmes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une police..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customFontName}
                onChange={(e) => setCustomFontName(e.target.value)}
                placeholder="Importer manuellement (ex: Outfit)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => handleImportFont(customFontName)}
                disabled={!customFontName.trim() || importing === customFontName.trim()}
                className="flex items-center space-x-2 bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>{importing === customFontName.trim() ? 'Import...' : 'Ajouter'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 border-b">
          <div className="flex gap-2 pt-3">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 text-sm rounded-t-lg border-b-2 transition-colors ${
                activeTab === 'available'
                  ? 'border-black text-black font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Polices à importer
            </button>
            <button
              onClick={() => setActiveTab('imported')}
              className={`px-4 py-2 text-sm rounded-t-lg border-b-2 transition-colors ${
                activeTab === 'imported'
                  ? 'border-black text-black font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Polices importées ({importedFonts.length})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Chargement...</p>
            </div>
          ) : (
            <>
              {activeTab === 'available' && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Polices disponibles</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Catalogue étendu prêt à l&apos;emploi. Si une police n&apos;apparaît pas, utilisez l&apos;import manuel ci-dessus.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredFonts.map(font => {
                    const imported = isFontImported(font.name);
                    return (
                      <div
                        key={`${font.source}-${font.name}`}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{font.name}</p>
                          <p className="text-xs text-gray-500">{font.source === 'google' ? 'Google Fonts' : 'Web-safe'}</p>
                        </div>
                        {imported ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <Check className="w-5 h-5" />
                            <span className="text-sm font-medium">Importée</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleImportFont(font.name)}
                            disabled={importing === font.name}
                            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                          >
                            <Download className="w-4 h-4" />
                            <span>{importing === font.name ? 'Import...' : 'Importer'}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              )}

              {activeTab === 'imported' && importedFonts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Polices importées ({importedFonts.length})
                  </h3>
                  <div className="space-y-2">
                    {importedFonts.map(font => (
                      <div
                        key={font.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{font.font_name}</p>
                          <p className="text-xs text-gray-500">
                            {font.is_system ? 'Système' : 'Personnalisée'} • {font.font_weights.length} poids
                          </p>
                        </div>
                        {canDeleteFont(font) && (
                          <button
                            onClick={() => handleDeleteFont(font.id, font.font_name)}
                            className="text-red-600 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors text-sm"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'imported' && importedFonts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Aucune police importée pour le moment.
                </div>
              )}
            </>
          )}
        </div>

        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}

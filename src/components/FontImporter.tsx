import { useState, useEffect } from 'react';
import { X, Search, Download, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

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

interface GoogleFont {
  family: string;
  variants: string[];
  category: string;
}

const POPULAR_GOOGLE_FONTS = [
  'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Roboto Condensed', 'Source Sans Pro', 'Oswald', 'Raleway',
  'PT Sans', 'Merriweather', 'Playfair Display', 'Ubuntu',
  'Nunito', 'Work Sans', 'Inter', 'Quicksand', 'Mukta'
];

export default function FontImporter({ onClose, onFontImported }: FontImporterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [importedFonts, setImportedFonts] = useState<FontLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadImportedFonts();
  }, []);

  const loadImportedFonts = async () => {
    try {
      const { data, error } = await supabase
        .from('fonts_library')
        .select('*')
        .order('font_name');

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
    setImporting(fontName);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showToast('Vous devez être connecté');
        return;
      }

      const alreadyImported = importedFonts.find(f => f.font_name === fontName);
      if (alreadyImported) {
        showToast('Police déjà importée');
        setImporting(null);
        return;
      }

      const fontUrlName = fontName.replace(/\s+/g, '+');
      const fontUrl = `https://fonts.googleapis.com/css2?family=${fontUrlName}:wght@300;400;500;600;700;800;900&display=swap`;
      const fontFamily = `"${fontName}", system-ui, sans-serif`;

      const { error } = await supabase
        .from('fonts_library')
        .insert({
          font_name: fontName,
          font_family: fontFamily,
          font_url: fontUrl,
          font_weights: ['300', '400', '500', '600', '700', '800', '900'],
          is_google_font: true,
          imported_by: user.id,
          is_system: false,
        });

      if (error) throw error;

      showToast(`Police ${fontName} importée`);
      await loadImportedFonts();

      if (onFontImported) {
        onFontImported();
      }

      const link = document.createElement('link');
      link.href = fontUrl;
      link.rel = 'stylesheet';
      document.head.appendChild(link);

    } catch (error) {
      console.error('Error importing font:', error);
      showToast('Erreur lors de l\'importation');
    } finally {
      setImporting(null);
    }
  };

  const handleDeleteFont = async (fontId: string, fontName: string) => {
    if (!confirm(`Supprimer la police ${fontName} ?`)) return;

    try {
      const { error } = await supabase
        .from('fonts_library')
        .delete()
        .eq('id', fontId);

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

  const filteredFonts = POPULAR_GOOGLE_FONTS.filter(font =>
    font.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isFontImported = (fontName: string) => {
    return importedFonts.some(f => f.font_name === fontName);
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
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">Chargement...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Polices disponibles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredFonts.map(fontName => {
                    const imported = isFontImported(fontName);
                    return (
                      <div
                        key={fontName}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{fontName}</p>
                          <p className="text-xs text-gray-500">Google Fonts</p>
                        </div>
                        {imported ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <Check className="w-5 h-5" />
                            <span className="text-sm font-medium">Importée</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleImportFont(fontName)}
                            disabled={importing === fontName}
                            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                          >
                            <Download className="w-4 h-4" />
                            <span>{importing === fontName ? 'Import...' : 'Importer'}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {importedFonts.length > 0 && (
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

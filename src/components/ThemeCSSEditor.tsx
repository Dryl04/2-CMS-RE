import React, { useState } from 'react';
import { Theme } from '../lib/themeTypes';
import { X, Save, Code, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeCSSEditorProps {
  theme: Theme;
  onClose: () => void;
}

export const ThemeCSSEditor: React.FC<ThemeCSSEditorProps> = ({ theme, onClose }) => {
  const { updateTheme } = useTheme();
  const [cssCode, setCssCode] = useState(theme.custom_css || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateTheme(theme.id, { custom_css: cssCode });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save CSS');
    } finally {
      setSaving(false);
    }
  };

  const exampleCSS = `/* Exemple de CSS personnalisé */

/* Modifier tous les boutons */
.button {
  border-radius: 12px;
  transition: all 0.3s ease;
}

/* Ajouter une animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

/* Styles pour les cartes */
.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}

/* Survol personnalisé */
.hover-effect:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Éditeur CSS Personnalisé</h2>
              <p className="text-sm text-gray-600">{theme.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900">Erreur</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code CSS
              </label>
              <textarea
                value={cssCode}
                onChange={(e) => setCssCode(e.target.value)}
                className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="/* Entrez votre CSS personnalisé ici... */"
                spellCheck={false}
              />
            </div>

            <details className="bg-gray-50 rounded-lg border border-gray-200">
              <summary className="px-4 py-3 cursor-pointer hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                Voir un exemple de CSS
              </summary>
              <div className="px-4 py-3 border-t border-gray-200">
                <pre className="text-xs text-gray-600 overflow-x-auto">
                  {exampleCSS}
                </pre>
              </div>
            </details>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Conseils</h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>Utilisez des sélecteurs spécifiques pour éviter les conflits</li>
                <li>Testez votre CSS sur différentes pages</li>
                <li>Évitez d'utiliser <code className="bg-blue-100 px-1 rounded">!important</code> si possible</li>
                <li>Le CSS sera appliqué globalement sur toutes les pages utilisant ce thème</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

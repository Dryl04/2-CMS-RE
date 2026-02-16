import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useDaisyTheme } from '../contexts/DaisyThemeContext';
import {
  DaisyTheme,
  DaisyThemeTokens,
  TOKEN_GROUPS,
  TOKEN_LABELS,
  createEmptyTokens,
  slugify,
} from '../lib/daisyThemes';

interface Props {
  theme: DaisyTheme | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function DaisyThemeEditorModal({ theme, onClose, onSaved }: Props) {
  const { createTheme, updateTheme } = useDaisyTheme();
  const isNew = !theme?.id;
  const isOfficial = theme?.source === 'daisyui';

  const [name, setName] = useState(theme?.name || '');
  const [slug, setSlug] = useState(theme?.slug || '');
  const [tokens, setTokens] = useState<DaisyThemeTokens>(theme?.tokens || createEmptyTokens());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSlug, setAutoSlug] = useState(!theme?.id);

  useEffect(() => {
    if (autoSlug && name) {
      setSlug(slugify(name));
    }
  }, [name, autoSlug]);

  const updateToken = (key: keyof DaisyThemeTokens, value: string) => {
    setTokens(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Le nom est requis'); return; }
    if (!slug.trim()) { setError('Le slug est requis'); return; }

    setSaving(true);
    setError(null);

    try {
      if (isNew || isOfficial) {
        await createTheme(name.trim(), slug.trim(), tokens);
      } else {
        await updateTheme(theme!.id, { name: name.trim(), slug: slug.trim(), tokens });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-base-100 text-base-content rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <h2 className="text-xl font-bold">
            {isNew || isOfficial ? 'Créer un thème' : `Modifier "${theme?.name}"`}
          </h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Nom du thème</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Mon thème personnalisé"
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Slug (identifiant)</span></label>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
                className="input input-bordered w-full font-mono text-sm"
                placeholder="mon-theme"
              />
            </div>
          </div>

          {TOKEN_GROUPS.map(group => (
            <div key={group.label}>
              <h3 className="text-lg font-semibold mb-3">{group.label}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {group.keys.map(key => (
                  <div key={key} className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">{TOKEN_LABELS[key]}</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={tokens[key]}
                        onChange={(e) => updateToken(key, e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-base-300"
                      />
                      <input
                        type="text"
                        value={tokens[key]}
                        onChange={(e) => updateToken(key, e.target.value)}
                        className="input input-bordered input-sm flex-1 font-mono text-xs"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h3 className="text-lg font-semibold mb-3">Aperçu</h3>
            <div
              className="rounded-xl p-6 space-y-4 border border-base-300"
              style={{ backgroundColor: tokens['base-100'], color: tokens['base-content'] }}
            >
              <div>
                <h4 className="text-xl font-bold mb-1" style={{ color: tokens['base-content'] }}>
                  Titre de la page
                </h4>
                <p className="text-sm opacity-70">Texte secondaire du contenu</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: tokens.primary, color: tokens['primary-content'] }}>
                  Primaire
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: tokens.secondary, color: tokens['secondary-content'] }}>
                  Secondaire
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: tokens.accent, color: tokens['accent-content'] }}>
                  Accent
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: tokens.neutral, color: tokens['neutral-content'] }}>
                  Neutre
                </button>
              </div>

              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: tokens['base-200'] }}
              >
                <p className="text-sm" style={{ color: tokens['base-content'] }}>
                  Bloc secondaire (base-200)
                </p>
              </div>

              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: tokens.info, color: tokens['info-content'] }}>Info</span>
                <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: tokens.success, color: tokens['success-content'] }}>Succès</span>
                <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: tokens.warning, color: tokens['warning-content'] }}>Avertissement</span>
                <span className="px-3 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: tokens.error, color: tokens['error-content'] }}>Erreur</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-base-300">
          <button onClick={onClose} className="btn btn-ghost">Annuler</button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

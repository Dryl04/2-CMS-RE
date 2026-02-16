import { useEffect, useMemo, useState } from 'react';
import { Plus, Check, Trash2, Edit3, Copy, X, Palette, Type } from 'lucide-react';
import { useDaisyTheme } from '../contexts/DaisyThemeContext';
import { DaisyTheme, TOKEN_GROUPS, TOKEN_LABELS } from '../lib/daisyThemes';
import DaisyThemeEditorModal from './DaisyThemeEditorModal';

interface DaisyThemeManagerProps {
  onClose: () => void;
}

export default function DaisyThemeManager({ onClose }: DaisyThemeManagerProps) {
  const { themes, activeTheme, loading, setActiveTheme, removeTheme, isThemeInUse } = useDaisyTheme();
  const [editingTheme, setEditingTheme] = useState<DaisyTheme | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'daisyui' | 'custom'>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleActivate = async (themeId: string) => {
    try {
      await setActiveTheme(themeId);
      showToast('Thème activé');
    } catch {
      showToast('Erreur lors de l\'activation');
    }
  };

  const handleDelete = async (theme: DaisyTheme) => {
    if (theme.source === 'daisyui') {
      showToast('Impossible de supprimer un thème officiel');
      return;
    }
    
    try {
      // First check if theme is in use
      const result = await removeTheme(theme.id, false);
      
      if (!result.success && result.usage) {
        // Theme is in use, show detailed warning
        const usageMsg = `Ce thème est utilisé dans ${result.usage.totalUsages} élément(s):\n` +
          `- ${result.usage.pageThemes} thème(s) de page\n` +
          `- ${result.usage.pageTemplates} modèle(s) de page\n\n` +
          `Voulez-vous vraiment le supprimer ? Les éléments utilisant ce thème seront migrés vers le thème par défaut.`;
        
        if (!confirm(usageMsg)) return;
        
        // Force delete with migration
        const forceResult = await removeTheme(theme.id, true);
        if (forceResult.success) {
          showToast('Thème supprimé et éléments migrés');
        }
      } else {
        // Theme not in use, simple deletion
        if (!confirm(`Supprimer le thème "${theme.name}" ?`)) return;
        await removeTheme(theme.id, false);
        showToast('Thème supprimé');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleDuplicate = (theme: DaisyTheme) => {
    setEditingTheme({
      ...theme,
      id: '',
      name: `${theme.name} (copie)`,
      slug: `${theme.slug}-copy`,
      source: 'custom',
      user_id: null,
    });
    setShowCreateModal(true);
  };

  const filteredThemes = useMemo(() => themes.filter(t => {
    if (filter === 'daisyui') return t.source === 'daisyui';
    if (filter === 'custom') return t.source === 'custom';
    return true;
  }), [themes, filter]);

  const officialCount = themes.filter(t => t.source === 'daisyui').length;
  const customCount = themes.filter(t => t.source === 'custom').length;
  const selectedTheme = filteredThemes.find((t) => t.id === selectedThemeId) || filteredThemes[0] || null;

  const officialThemes = filteredThemes.filter((t) => t.source === 'daisyui');
  const customThemes = filteredThemes.filter((t) => t.source === 'custom');

  useEffect(() => {
    if (!selectedThemeId && filteredThemes.length > 0) {
      setSelectedThemeId(filteredThemes[0].id);
      return;
    }

    if (selectedThemeId && !filteredThemes.some((t) => t.id === selectedThemeId)) {
      setSelectedThemeId(filteredThemes[0]?.id || null);
    }
  }, [filteredThemes, selectedThemeId]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-base-100 text-base-content rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div>
            <h2 className="text-2xl font-bold">Gestionnaire de thèmes</h2>
            <p className="text-sm opacity-60 mt-1">
              {officialCount} officiels, {customCount} personnalisés
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-96 border-r border-base-300 bg-base-200/40 overflow-auto p-4 space-y-4">
            <button
              onClick={() => {
                setEditingTheme(null);
                setShowCreateModal(true);
              }}
              className="btn btn-primary w-full gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouveau thème
            </button>

            <div className="join w-full">
              {(['all', 'daisyui', 'custom'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`btn btn-sm join-item flex-1 ${filter === f ? 'btn-primary' : 'btn-outline'}`}
                >
                  {f === 'all' ? 'Tous' : f === 'daisyui' ? 'Officiels' : 'Perso'}
                </button>
              ))}
            </div>

            {loading && (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            )}

            {!loading && (
              <>
                {officialThemes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase opacity-60 px-1">Thèmes officiels</p>
                    {officialThemes.map(theme => (
                      <ThemeListItem
                        key={theme.id}
                        theme={theme}
                        isActive={activeTheme?.id === theme.id}
                        isSelected={selectedTheme?.id === theme.id}
                        onSelect={() => setSelectedThemeId(theme.id)}
                        onActivate={() => handleActivate(theme.id)}
                        onEdit={() => { setEditingTheme(theme); setShowCreateModal(true); }}
                        onDuplicate={() => handleDuplicate(theme)}
                        onDelete={() => handleDelete(theme)}
                      />
                    ))}
                  </div>
                )}

                {customThemes.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-semibold uppercase opacity-60 px-1">Thèmes personnalisés</p>
                    {customThemes.map(theme => (
                      <ThemeListItem
                        key={theme.id}
                        theme={theme}
                        isActive={activeTheme?.id === theme.id}
                        isSelected={selectedTheme?.id === theme.id}
                        onSelect={() => setSelectedThemeId(theme.id)}
                        onActivate={() => handleActivate(theme.id)}
                        onEdit={() => { setEditingTheme(theme); setShowCreateModal(true); }}
                        onDuplicate={() => handleDuplicate(theme)}
                        onDelete={() => handleDelete(theme)}
                      />
                    ))}
                  </div>
                )}

                {!officialThemes.length && !customThemes.length && (
                  <div className="text-sm opacity-60 p-3 border border-base-300 rounded-lg">
                    Aucun thème disponible.
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex-1 overflow-auto p-6">
            {selectedTheme ? (
              <div className="space-y-6 max-w-4xl">
                <div className="bg-base-200 rounded-xl p-5 border border-base-300">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold">{selectedTheme.name}</h3>
                      <p className="text-sm opacity-70 mt-1">slug: {selectedTheme.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedTheme.source === 'daisyui' && <span className="badge badge-ghost">officiel</span>}
                      {isThemeInUse(selectedTheme.id) && <span className="badge badge-primary">actif</span>}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {!isThemeInUse(selectedTheme.id) && (
                      <button onClick={() => handleActivate(selectedTheme.id)} className="btn btn-primary btn-sm gap-2">
                        <Check className="w-4 h-4" /> Activer
                      </button>
                    )}
                    <button onClick={() => handleDuplicate(selectedTheme)} className="btn btn-outline btn-sm gap-2">
                      <Copy className="w-4 h-4" /> Dupliquer
                    </button>
                    <button
                      onClick={() => { setEditingTheme(selectedTheme); setShowCreateModal(true); }}
                      className="btn btn-ghost btn-sm gap-2"
                    >
                      <Edit3 className="w-4 h-4" /> Modifier
                    </button>
                    {selectedTheme.source === 'custom' && (
                      <button onClick={() => handleDelete(selectedTheme)} className="btn btn-error btn-outline btn-sm gap-2">
                        <Trash2 className="w-4 h-4" /> Supprimer
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-base-200 rounded-xl p-5 border border-base-300">
                  <div className="flex items-center gap-2 mb-4">
                    <Type className="w-5 h-5" />
                    <h4 className="text-lg font-semibold">Typographies</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-base-100 rounded-lg p-3 border border-base-300">
                      <p className="opacity-60 mb-1">Police du corps</p>
                      <p className="font-medium break-all">{selectedTheme.font_config?.bodyFont || 'Par défaut'}</p>
                    </div>
                    <div className="bg-base-100 rounded-lg p-3 border border-base-300">
                      <p className="opacity-60 mb-1">Police des titres</p>
                      <p className="font-medium break-all">{selectedTheme.font_config?.headingFont || 'Par défaut'}</p>
                    </div>
                    <div className="bg-base-100 rounded-lg p-3 border border-base-300">
                      <p className="opacity-60 mb-1">Poids des titres</p>
                      <p className="font-medium">{selectedTheme.font_config?.headingWeight || '700'}</p>
                    </div>
                  </div>
                  <p className="text-xs opacity-60 mt-3">
                    L’import Google Fonts est disponible dans « Modifier ».
                  </p>
                </div>

                {TOKEN_GROUPS.map((group) => (
                  <div key={group.label} className="bg-base-200 rounded-xl p-5 border border-base-300">
                    <h4 className="text-lg font-semibold mb-4">{group.label}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.keys.map((tokenKey) => {
                        const colorValue = selectedTheme.tokens[tokenKey];
                        return (
                          <div key={tokenKey} className="bg-base-100 rounded-lg p-3 border border-base-300 space-y-2">
                            <p className="text-xs opacity-70">{TOKEN_LABELS[tokenKey]}</p>
                            <div className="h-8 rounded border border-base-300" style={{ backgroundColor: colorValue }} />
                            <p className="font-mono text-xs">{colorValue}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="bg-base-200 rounded-xl p-5 border border-base-300">
                  <h4 className="text-lg font-semibold mb-4">Aperçu rapide</h4>
                  <div
                    className="rounded-lg p-5 border border-base-300"
                    style={{
                      backgroundColor: selectedTheme.tokens['base-100'],
                      color: selectedTheme.tokens['base-content'],
                      fontFamily: selectedTheme.font_config?.bodyFont || undefined,
                    }}
                  >
                    <h5
                      className="text-lg font-bold mb-3"
                      style={{
                        color: selectedTheme.tokens['base-content'],
                        fontFamily: selectedTheme.font_config?.headingFont || undefined,
                        fontWeight: selectedTheme.font_config?.headingWeight || '700',
                      }}
                    >
                      Exemple de titre
                    </h5>
                    <p className="text-sm mb-4">Exemple de texte pour visualiser les couleurs et polices du thème.</p>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn btn-sm" style={{ backgroundColor: selectedTheme.tokens.primary, color: selectedTheme.tokens['primary-content'] }}>
                        Primaire
                      </button>
                      <button className="btn btn-sm" style={{ backgroundColor: selectedTheme.tokens.secondary, color: selectedTheme.tokens['secondary-content'] }}>
                        Secondaire
                      </button>
                      <button className="btn btn-sm" style={{ backgroundColor: selectedTheme.tokens.accent, color: selectedTheme.tokens['accent-content'] }}>
                        Accent
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center opacity-60">
                Sélectionnez un thème pour afficher ses paramètres.
              </div>
            )}
          </div>
        </div>

        {toastMessage && (
          <div className="toast toast-center toast-bottom z-[60]">
            <div className="alert alert-info">
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <DaisyThemeEditorModal
          theme={editingTheme}
          onClose={() => { setShowCreateModal(false); setEditingTheme(null); }}
          onSaved={() => { setShowCreateModal(false); setEditingTheme(null); showToast('Thème enregistré'); }}
        />
      )}
    </div>
  );
}

function ThemeListItem({
  theme,
  isActive,
  isSelected,
  onSelect,
  onActivate,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  theme: DaisyTheme;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onActivate: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const t = theme.tokens;

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl p-3 border-2 cursor-pointer transition-colors ${
        isSelected ? 'border-primary bg-primary/5' : 'border-base-300 bg-base-100 hover:border-base-content/20'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{theme.name}</h3>
          <p className="text-xs opacity-60 truncate">{theme.slug}</p>
        </div>
        <div className="flex items-center gap-1">
          {theme.source === 'daisyui' && <span className="badge badge-ghost badge-xs">officiel</span>}
          {isActive && <span className="badge badge-primary badge-xs">actif</span>}
        </div>
      </div>

      <div className="flex gap-1 mt-3">
        {[t.primary, t.secondary, t.accent, t['base-100'], t['base-content']].map((color, i) => (
          <div
            key={i}
            className="h-5 flex-1 rounded border border-base-300"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      <div className="flex items-center justify-end gap-1 mt-3">
        {!isActive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActivate();
            }}
            className="btn btn-primary btn-xs"
          >
            <Check className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="btn btn-ghost btn-xs"
        >
          <Copy className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="btn btn-ghost btn-xs"
        >
          <Edit3 className="w-3 h-3" />
        </button>
        {theme.source === 'custom' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="btn btn-error btn-outline btn-xs"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Check, Trash2, Edit3, Copy, X, Palette } from 'lucide-react';
import { useDaisyTheme } from '../contexts/DaisyThemeContext';
import { DaisyTheme, DaisyThemeTokens, TOKEN_GROUPS, TOKEN_LABELS, createEmptyTokens, slugify, tokensAreDifferent } from '../lib/daisyThemes';
import DaisyThemeEditorModal from './DaisyThemeEditorModal';

interface DaisyThemeManagerProps {
  onClose: () => void;
}

export default function DaisyThemeManager({ onClose }: DaisyThemeManagerProps) {
  const { themes, activeTheme, loading, setActiveTheme, removeTheme, isThemeInUse } = useDaisyTheme();
  const [editingTheme, setEditingTheme] = useState<DaisyTheme | null>(null);
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
    if (isThemeInUse(theme.id)) {
      if (!confirm('Ce thème est actif. Il sera remplacé par le thème Light. Continuer ?')) return;
    } else {
      if (!confirm(`Supprimer le thème "${theme.name}" ?`)) return;
    }
    try {
      await removeTheme(theme.id);
      showToast('Thème supprimé');
    } catch {
      showToast('Erreur lors de la suppression');
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

  const filteredThemes = themes.filter(t => {
    if (filter === 'daisyui') return t.source === 'daisyui';
    if (filter === 'custom') return t.source === 'custom';
    return true;
  });

  const officialCount = themes.filter(t => t.source === 'daisyui').length;
  const customCount = themes.filter(t => t.source === 'custom').length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-base-100 text-base-content rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div>
            <h2 className="text-2xl font-bold">Gestionnaire de thèmes</h2>
            <p className="text-sm opacity-60 mt-1">
              {officialCount} officiels, {customCount} personnalisés
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingTheme(null);
                setShowCreateModal(true);
              }}
              className="btn btn-primary btn-sm gap-2"
            >
              <Plus className="w-4 h-4" />
              Créer un thème
            </button>
            <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 pt-4 flex gap-2">
          {(['all', 'daisyui', 'custom'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            >
              {f === 'all' ? 'Tous' : f === 'daisyui' ? 'Officiels' : 'Personnalisés'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredThemes.map(theme => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isActive={activeTheme?.id === theme.id}
                  onActivate={() => handleActivate(theme.id)}
                  onEdit={() => { setEditingTheme(theme); setShowCreateModal(true); }}
                  onDuplicate={() => handleDuplicate(theme)}
                  onDelete={() => handleDelete(theme)}
                />
              ))}
            </div>
          )}
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

function ThemeCard({
  theme,
  isActive,
  onActivate,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  theme: DaisyTheme;
  isActive: boolean;
  onActivate: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const t = theme.tokens;

  return (
    <div
      className={`card bg-base-200 border-2 transition-all duration-200 ${
        isActive ? 'border-primary shadow-lg' : 'border-transparent hover:border-base-300'
      }`}
    >
      <div className="card-body p-4 gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="card-title text-sm">{theme.name}</h3>
            {theme.source === 'daisyui' && (
              <span className="badge badge-ghost badge-xs">officiel</span>
            )}
            {isActive && (
              <span className="badge badge-primary badge-xs">actif</span>
            )}
          </div>
        </div>

        <div className="flex gap-1 flex-wrap">
          {[t.primary, t.secondary, t.accent, t.neutral, t['base-100'], t['base-content']].map((color, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-lg border border-base-300"
              style={{ backgroundColor: color }}
              title={['primary', 'secondary', 'accent', 'neutral', 'base-100', 'base-content'][i]}
            />
          ))}
          {[t.info, t.success, t.warning, t.error].map((color, i) => (
            <div
              key={`s-${i}`}
              className="w-6 h-6 rounded border border-base-300"
              style={{ backgroundColor: color }}
              title={['info', 'success', 'warning', 'error'][i]}
            />
          ))}
        </div>

        <div
          className="rounded-lg p-3 text-xs space-y-1"
          style={{ backgroundColor: t['base-100'], color: t['base-content'] }}
        >
          <div className="font-bold" style={{ color: t.primary }}>Titre primaire</div>
          <div className="opacity-70">Texte exemple</div>
          <div className="flex gap-1 mt-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: t.primary, color: t['primary-content'] }}>Primaire</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: t.secondary, color: t['secondary-content'] }}>Secondaire</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: t.accent, color: t['accent-content'] }}>Accent</span>
          </div>
        </div>

        <div className="card-actions justify-end mt-1">
          {!isActive && (
            <button onClick={onActivate} className="btn btn-primary btn-xs gap-1">
              <Check className="w-3 h-3" /> Activer
            </button>
          )}
          <button onClick={onDuplicate} className="btn btn-ghost btn-xs gap-1">
            <Copy className="w-3 h-3" /> Dupliquer
          </button>
          {theme.source === 'custom' && (
            <>
              <button onClick={onEdit} className="btn btn-ghost btn-xs gap-1">
                <Edit3 className="w-3 h-3" /> Éditer
              </button>
              <button onClick={onDelete} className="btn btn-error btn-xs btn-outline gap-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Palette, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { PageBuilderSection } from '../../lib/pageBuilderTypes';
import { useDaisyTheme } from '../../contexts/DaisyThemeContext';
import { DaisyThemeTokens, TOKEN_GROUPS } from '../../lib/daisyThemes';

interface WidgetThemeSelectorProps {
  section: PageBuilderSection;
  onUpdateSection: (updates: Partial<PageBuilderSection>) => void;
}

const EDITABLE_TOKENS: (keyof DaisyThemeTokens)[] = [
  'primary', 'primary-content',
  'secondary', 'secondary-content',
  'accent', 'accent-content',
  'neutral', 'neutral-content',
  'base-100', 'base-200', 'base-300', 'base-content',
];

const TOKEN_SHORT_LABELS: Partial<Record<keyof DaisyThemeTokens, string>> = {
  'primary': 'Primaire',
  'primary-content': 'Texte primaire',
  'secondary': 'Secondaire',
  'secondary-content': 'Texte secondaire',
  'accent': 'Accent',
  'accent-content': 'Texte accent',
  'neutral': 'Neutre',
  'neutral-content': 'Texte neutre',
  'base-100': 'Fond 1',
  'base-200': 'Fond 2',
  'base-300': 'Fond 3',
  'base-content': 'Texte base',
};

export default function WidgetThemeSelector({ section, onUpdateSection }: WidgetThemeSelectorProps) {
  const { themes, activeTheme } = useDaisyTheme();
  const [showCustomTokens, setShowCustomTokens] = useState(false);

  const themeConfig = section.themeConfig || { themeMode: 'inherit' as const };
  const currentMode = themeConfig.themeMode;

  const updateThemeConfig = (updates: Partial<PageBuilderSection['themeConfig']>) => {
    onUpdateSection({
      themeConfig: { ...themeConfig, ...updates } as PageBuilderSection['themeConfig'],
    });
  };

  const handleModeChange = (mode: 'inherit' | 'named' | 'custom') => {
    if (mode === 'inherit') {
      onUpdateSection({ themeConfig: { themeMode: 'inherit' } });
    } else if (mode === 'named') {
      const firstTheme = themes[0];
      onUpdateSection({
        themeConfig: {
          themeMode: 'named',
          themeRef: firstTheme?.slug || 'light',
        },
      });
    } else {
      onUpdateSection({
        themeConfig: {
          themeMode: 'custom',
          customTokens: {},
        },
      });
    }
  };

  const updateCustomToken = (key: string, value: string) => {
    const current = themeConfig.customTokens || {};
    updateThemeConfig({
      customTokens: { ...current, [key]: value },
    });
  };

  const removeCustomToken = (key: string) => {
    const current = { ...(themeConfig.customTokens || {}) };
    delete current[key];
    updateThemeConfig({ customTokens: current });
  };

  const selectedNamedTheme = currentMode === 'named'
    ? themes.find(t => t.slug === themeConfig.themeRef)
    : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
          <Palette className="w-4 h-4" />
          Theme du widget
        </h3>
        {currentMode !== 'inherit' && (
          <button
            onClick={() => handleModeChange('inherit')}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            title="Revenir au theme global"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-lg">
        {([
          { value: 'inherit', label: 'Global' },
          { value: 'named', label: 'Theme' },
          { value: 'custom', label: 'Custom' },
        ] as const).map(({ value, label }) => (
          <button
            key={value}
            onClick={() => handleModeChange(value)}
            className={`px-2 py-1.5 text-xs font-medium rounded-md transition-all ${
              currentMode === value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {currentMode === 'inherit' && (
        <p className="text-xs text-gray-500">
          Utilise le theme global{activeTheme ? ` (${activeTheme.name})` : ''}.
        </p>
      )}

      {currentMode === 'named' && (
        <div className="space-y-2">
          <select
            value={themeConfig.themeRef || ''}
            onChange={(e) => updateThemeConfig({ themeRef: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-black focus:border-transparent"
          >
            {themes.map(t => (
              <option key={t.id} value={t.slug}>
                {t.name} {t.source === 'custom' ? '(personnalise)' : ''}
              </option>
            ))}
          </select>

          {selectedNamedTheme && (
            <div className="flex gap-1 flex-wrap p-2 bg-gray-50 rounded-lg">
              {[
                selectedNamedTheme.tokens.primary,
                selectedNamedTheme.tokens.secondary,
                selectedNamedTheme.tokens.accent,
                selectedNamedTheme.tokens.neutral,
                selectedNamedTheme.tokens['base-100'],
                selectedNamedTheme.tokens['base-content'],
              ].map((color, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded border border-gray-200"
                  style={{ backgroundColor: color }}
                  title={['primary', 'secondary', 'accent', 'neutral', 'base-100', 'base-content'][i]}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {currentMode === 'custom' && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">
            Surcharge les couleurs pour ce widget uniquement.
          </p>

          <button
            onClick={() => setShowCustomTokens(!showCustomTokens)}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition-colors"
          >
            <span>
              Couleurs ({Object.keys(themeConfig.customTokens || {}).length} modifiees)
            </span>
            {showCustomTokens
              ? <ChevronUp className="w-4 h-4" />
              : <ChevronDown className="w-4 h-4" />
            }
          </button>

          {showCustomTokens && (
            <div className="space-y-2 pt-1">
              {EDITABLE_TOKENS.map(token => {
                const currentValue = themeConfig.customTokens?.[token];
                const hasOverride = currentValue !== undefined;

                return (
                  <div key={token} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentValue || '#000000'}
                      onChange={(e) => updateCustomToken(token, e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs block truncate ${hasOverride ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                        {TOKEN_SHORT_LABELS[token] || token}
                      </span>
                    </div>
                    {hasOverride && (
                      <button
                        onClick={() => removeCustomToken(token)}
                        className="text-xs text-gray-400 hover:text-red-500 flex-shrink-0"
                        title="Supprimer la surcharge"
                      >
                        x
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

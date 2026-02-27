import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface GradientPreset {
  label: string;
  value: string;
}

const PRESETS: GradientPreset[] = [
  { label: 'Nuit', value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { label: 'Aurore', value: 'linear-gradient(135deg, #f8cdda 0%, #1d2b64 100%)' },
  { label: 'Soleil', value: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' },
  { label: 'Océan', value: 'linear-gradient(135deg, #2980b9 0%, #6dd5fa 50%, #ffffff 100%)' },
  { label: 'Forêt', value: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
  { label: 'Flamme', value: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
  { label: 'Lavande', value: 'linear-gradient(135deg, #c3cfe2 0%, #f5f7fa 100%)' },
  { label: 'Minuit', value: 'linear-gradient(135deg, #141e30 0%, #243b55 100%)' },
  { label: 'Pêche', value: 'linear-gradient(135deg, #f5a7a7 0%, #f5e4a7 100%)' },
  { label: 'Menthe', value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { label: 'Carbone', value: 'linear-gradient(135deg, #373b44 0%, #4286f4 100%)' },
  { label: 'Rose', value: 'linear-gradient(135deg, #fc5c7d 0%, #6a3093 100%)' },
  { label: 'Ébène', value: 'linear-gradient(180deg, #232526 0%, #414345 100%)' },
  { label: 'Ciel', value: 'linear-gradient(180deg, #e0eafc 0%, #cfdef3 100%)' },
  { label: 'Citron', value: 'linear-gradient(135deg, #f9f047 0%, #0fd850 100%)' },
  { label: 'Corail', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { label: 'Sable', value: 'linear-gradient(135deg, #f5f0e8 0%, #d4b896 100%)' },
  { label: 'Bleuet', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
];

const DIRECTIONS = [
  { label: '↘', value: '135deg', title: 'Diagonal haut-gauche → bas-droite' },
  { label: '→', value: '90deg', title: 'Gauche → droite' },
  { label: '↓', value: '180deg', title: 'Haut → bas' },
  { label: '↗', value: '45deg', title: 'Diagonal bas-gauche → haut-droite' },
  { label: '←', value: '270deg', title: 'Droite → gauche' },
  { label: '↑', value: '0deg', title: 'Bas → haut' },
];

function parseGradient(css: string): { dir: string; color1: string; color2: string; color3?: string } {
  const dirMatch = css.match(/(\d+deg)/);
  const colorMatches = [...css.matchAll(/#[0-9a-fA-F]{3,6}|rgba?\([^)]+\)/g)];
  return {
    dir: dirMatch ? dirMatch[1] : '135deg',
    color1: colorMatches[0]?.[0] || '#667eea',
    color2: colorMatches[1]?.[0] || '#764ba2',
    color3: colorMatches[2]?.[0],
  };
}

function buildGradient(dir: string, color1: string, color2: string, color3?: string): string {
  if (color3) {
    return `linear-gradient(${dir}, ${color1} 0%, ${color3} 50%, ${color2} 100%)`;
  }
  return `linear-gradient(${dir}, ${color1} 0%, ${color2} 100%)`;
}

interface GradientPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function GradientPicker({ value, onChange }: GradientPickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [useThreeColors, setUseThreeColors] = useState(() => {
    const parsed = parseGradient(value || '');
    return !!parsed.color3;
  });

  const parsed = parseGradient(value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');

  const updateCustom = (overrides: Partial<{ dir: string; color1: string; color2: string; color3: string }>) => {
    const next = { ...parsed, ...overrides };
    onChange(buildGradient(next.dir, next.color1, next.color2, useThreeColors ? next.color3 : undefined));
  };

  const toggleThreeColors = () => {
    const next = !useThreeColors;
    setUseThreeColors(next);
    if (!next) {
      onChange(buildGradient(parsed.dir, parsed.color1, parsed.color2));
    } else {
      const mid = blendHex(parsed.color1, parsed.color2);
      onChange(buildGradient(parsed.dir, parsed.color1, mid, parsed.color2));
    }
  };

  const previewStyle: React.CSSProperties = {
    background: value || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  };

  return (
    <div className="space-y-3">
      <div
        className="w-full h-12 rounded-lg border border-gray-200"
        style={previewStyle}
      />

      <div>
        <p className="text-xs text-gray-500 mb-2">Presets</p>
        <div className="grid grid-cols-6 gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.value}
              title={preset.label}
              onClick={() => onChange(preset.value)}
              className={`h-7 rounded cursor-pointer border-2 transition-all ${
                value === preset.value ? 'border-black scale-105' : 'border-transparent hover:border-gray-400'
              }`}
              style={{ background: preset.value }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowCustom((v) => !v)}
        className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors"
      >
        {showCustom ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        Personnaliser
      </button>

      {showCustom && (
        <div className="space-y-3 pt-1 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Direction</p>
            <div className="flex gap-1.5 flex-wrap">
              {DIRECTIONS.map((d) => (
                <button
                  key={d.value}
                  title={d.title}
                  onClick={() => updateCustom({ dir: d.value })}
                  className={`w-8 h-8 rounded text-sm font-medium border transition-all ${
                    parsed.dir === d.value
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Couleur 1</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={parsed.color1.startsWith('#') ? parsed.color1 : '#667eea'}
                  onChange={(e) => updateCustom({ color1: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5 bg-white"
                />
                <span className="text-xs text-gray-500 font-mono">{parsed.color1}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Couleur 2</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={parsed.color2.startsWith('#') ? parsed.color2 : '#764ba2'}
                  onChange={(e) => updateCustom({ color2: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5 bg-white"
                />
                <span className="text-xs text-gray-500 font-mono">{parsed.color2}</span>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
            <input
              type="checkbox"
              checked={useThreeColors}
              onChange={toggleThreeColors}
              className="w-3.5 h-3.5 rounded border-gray-300"
            />
            Couleur intermédiaire
          </label>

          {useThreeColors && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Couleur intermédiaire</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={parsed.color3?.startsWith('#') ? parsed.color3 : '#a855f7'}
                  onChange={(e) => updateCustom({ color3: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5 bg-white"
                />
                <span className="text-xs text-gray-500 font-mono">{parsed.color3 || '#a855f7'}</span>
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 mb-1">CSS brut</p>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-mono bg-gray-50"
              placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function blendHex(hex1: string, hex2: string): string {
  if (!hex1.startsWith('#') || !hex2.startsWith('#')) return '#a855f7';
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round((r1 + r2) / 2).toString(16).padStart(2, '0');
  const g = Math.round((g1 + g2) / 2).toString(16).padStart(2, '0');
  const b = Math.round((b1 + b2) / 2).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

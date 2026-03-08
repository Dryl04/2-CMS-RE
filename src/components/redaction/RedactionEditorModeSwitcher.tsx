import { FileText, AlignLeft, LayoutList } from 'lucide-react';
import type { EditorMode } from '@/lib/redactionTypes';

interface RedactionEditorModeSwitcherProps {
  currentMode: EditorMode;
  onChange: (mode: EditorMode) => void;
  disabled?: boolean;
}

const MODES: { mode: EditorMode; label: string; description: string; icon: typeof FileText }[] = [
  {
    mode: 'plain',
    label: 'Texte brut',
    description: 'Texte libre, sans mise en forme',
    icon: AlignLeft,
  },
  {
    mode: 'rich',
    label: 'Éditeur riche',
    description: 'Gras, listes, titres, liens',
    icon: FileText,
  },
  {
    mode: 'structured',
    label: 'Structuré SEO',
    description: 'Champs guidés pour le SEO',
    icon: LayoutList,
  },
];

export default function RedactionEditorModeSwitcher({
  currentMode,
  onChange,
  disabled = false,
}: RedactionEditorModeSwitcherProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      {MODES.map(({ mode, label, icon: Icon }) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          disabled={disabled || currentMode === mode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            currentMode === mode
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          } disabled:cursor-not-allowed`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}

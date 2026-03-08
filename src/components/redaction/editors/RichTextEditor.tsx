import { useState, useRef, useCallback } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Link,
  Undo2,
  Redo2,
  Quote,
} from 'lucide-react';

interface RichTextEditorProps {
  value: Record<string, unknown> | null;
  onChange: (value: Record<string, unknown>) => void;
  disabled?: boolean;
}

/**
 * Éditeur riche léger basé sur contentEditable.
 * Stocke le HTML sous forme { type:'doc', html:'...' } dans rich_content.
 * Limité volontairement aux fonctionnalités légères (gras, italique, listes, titres, liens, citations).
 */
export default function RichTextEditor({
  value,
  onChange,
  disabled = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const html = (value?.html as string) ?? '';

  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    onChange({ type: 'doc', html: el.innerHTML });
  }, [onChange]);

  const exec = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    handleInput();
  };

  const handleInsertLink = () => {
    if (linkUrl.trim()) {
      exec('createLink', linkUrl.trim());
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const ToolButton = ({
    onClick,
    icon: Icon,
    title,
    active,
  }: {
    onClick: () => void;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    active?: boolean;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? 'bg-emerald-100 text-emerald-700'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Éditeur riche
      </label>

      <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-colors">
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200 flex-wrap">
          <ToolButton onClick={() => exec('bold')} icon={Bold} title="Gras" />
          <ToolButton onClick={() => exec('italic')} icon={Italic} title="Italique" />
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <ToolButton onClick={() => exec('formatBlock', 'H2')} icon={Heading2} title="Titre H2" />
          <ToolButton onClick={() => exec('formatBlock', 'BLOCKQUOTE')} icon={Quote} title="Citation" />
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <ToolButton onClick={() => exec('insertUnorderedList')} icon={List} title="Liste à puces" />
          <ToolButton onClick={() => exec('insertOrderedList')} icon={ListOrdered} title="Liste numérotée" />
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <ToolButton onClick={() => setShowLinkInput(!showLinkInput)} icon={Link} title="Lien" />
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <ToolButton onClick={() => exec('undo')} icon={Undo2} title="Annuler" />
          <ToolButton onClick={() => exec('redo')} icon={Redo2} title="Rétablir" />
        </div>

        {/* Barre lien */}
        {showLinkInput && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-gray-200">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://exemple.com"
              className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-md focus:border-blue-500 outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleInsertLink();
                }
              }}
            />
            <button
              onClick={handleInsertLink}
              className="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Insérer
            </button>
            <button
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl('');
              }}
              className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
            >
              Annuler
            </button>
          </div>
        )}

        {/* Zone d'édition */}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          dangerouslySetInnerHTML={{ __html: html }}
          className={`min-h-[320px] px-4 py-3 text-sm leading-relaxed outline-none
            prose prose-sm max-w-none
            prose-headings:text-gray-900 prose-headings:font-semibold
            prose-p:text-gray-700 prose-a:text-blue-600
            ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
          data-placeholder="Rédigez votre contenu riche ici…"
        />
      </div>
    </div>
  );
}

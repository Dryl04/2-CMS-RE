/**
 * RichTextArea — Mini rich-text textarea with Bold / Italic / Underline / Link toolbar.
 * Shared component used across all ContentEditors and PropertiesPanel.
 *
 * Supports HTML inline formatting: <b>, <i>, <u>, <a>.
 */

import { useState, useRef, useCallback } from 'react';
import { Bold, Italic, Link2, Underline } from 'lucide-react';
import { LinkEditorModal, buildRelAttribute } from '@/components/common/LinkEditorModal';
import type { LinkEditorResult } from '@/components/common/LinkEditorModal';

export interface RichTextAreaProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  rows?: number;
  /** Render as a single-line input (no textarea resize) */
  singleLine?: boolean;
  className?: string;
}

export function RichTextArea({
  label,
  value,
  onChange,
  rows = 2,
  singleLine = false,
  className = '',
}: RichTextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  // Track selection changes so we always have the latest selection even if focus is lost
  const handleSelect = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    selectionRef.current = { start: ta.selectionStart, end: ta.selectionEnd };
  }, []);

  const wrapSelection = useCallback(
    (before: string, after: string) => {
      const ta = textareaRef.current;
      if (!ta) return;
      const start = selectionRef.current.start;
      const end = selectionRef.current.end;
      const selected = value.substring(start, end);

      // Toggle OFF: check if selection is already wrapped with the tag
      if (selected.startsWith(before) && selected.endsWith(after)) {
        const inner = selected.slice(before.length, selected.length - after.length);
        const newValue = value.substring(0, start) + inner + value.substring(end);
        onChange(newValue);
        requestAnimationFrame(() => {
          ta.focus();
          ta.selectionStart = start;
          ta.selectionEnd = start + inner.length;
        });
        return;
      }

      // Toggle OFF: check if surrounding text wraps the selection
      const beforeStart = start - before.length;
      const afterEnd = end + after.length;
      if (
        beforeStart >= 0 &&
        afterEnd <= value.length &&
        value.substring(beforeStart, start) === before &&
        value.substring(end, afterEnd) === after
      ) {
        const newValue = value.substring(0, beforeStart) + selected + value.substring(afterEnd);
        onChange(newValue);
        requestAnimationFrame(() => {
          ta.focus();
          ta.selectionStart = beforeStart;
          ta.selectionEnd = beforeStart + selected.length;
        });
        return;
      }

      // Toggle ON: wrap selection
      const newValue =
        value.substring(0, start) + before + selected + after + value.substring(end);
      onChange(newValue);
      requestAnimationFrame(() => {
        ta.focus();
        ta.selectionStart = start + before.length;
        ta.selectionEnd = end + before.length;
      });
    },
    [value, onChange],
  );

  // State for the link editor modal
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const pendingSelectionRef = useRef<{ start: number; end: number; selected: string }>({
    start: 0,
    end: 0,
    selected: '',
  });

  const handleBold = () => wrapSelection('<b>', '</b>');
  const handleItalic = () => wrapSelection('<i>', '</i>');
  const handleUnderline = () => wrapSelection('<u>', '</u>');

  const handleLinkButtonClick = () => {
    const start = selectionRef.current.start;
    const end = selectionRef.current.end;
    const selected = value.substring(start, end);
    pendingSelectionRef.current = { start, end, selected };
    setLinkModalOpen(true);
  };

  const handleLinkSubmit = (result: LinkEditorResult) => {
    const { start, end, selected } = pendingSelectionRef.current;
    const ta = textareaRef.current;

    const rel = buildRelAttribute(result.relNoopener, result.relNofollow, result.relSponsored);
    const targetAttr = result.targetBlank ? ' target="_blank"' : '';
    const relAttr = rel ? ` rel="${rel}"` : '';
    const anchorLabel = result.anchorText || selected || result.url;
    const linkHTML = `<a href="${result.url}"${targetAttr}${relAttr}>${anchorLabel}</a>`;

    const newValue = value.substring(0, start) + linkHTML + value.substring(end);
    onChange(newValue);
    setLinkModalOpen(false);

    requestAnimationFrame(() => {
      if (!ta) return;
      ta.focus();
      ta.selectionStart = start + linkHTML.length;
      ta.selectionEnd = start + linkHTML.length;
    });
  };

  const btnClass =
    'p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors';
  const preventFocusLoss = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div className={className}>
      <label className="block text-xs text-gray-600 mb-1">{label}</label>
      <div className="flex gap-0.5 mb-1">
        <button type="button" className={btnClass} onClick={handleBold} onMouseDown={preventFocusLoss} title="Gras (HTML)">
          <Bold size={13} />
        </button>
        <button type="button" className={btnClass} onClick={handleItalic} onMouseDown={preventFocusLoss} title="Italique (HTML)">
          <Italic size={13} />
        </button>
        <button type="button" className={btnClass} onClick={handleUnderline} onMouseDown={preventFocusLoss} title="Souligné (HTML)">
          <Underline size={13} />
        </button>
        <button
          type="button"
          className={btnClass}
          onClick={handleLinkButtonClick}
          onMouseDown={preventFocusLoss}
          title="Insérer un lien (HTML)"
        >
          <Link2 size={13} />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleSelect}
        onKeyUp={handleSelect}
        onClick={handleSelect}
        rows={singleLine ? 1 : rows}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono${singleLine ? ' resize-none overflow-hidden' : ''}`}
      />
      <LinkEditorModal
        isOpen={linkModalOpen}
        title="Insérer un lien"
        initialUrl=""
        initialAnchorText={pendingSelectionRef.current.selected}
        showAnchorText
        allowOpenInNewTab
        allowNofollow
        allowNoopener
        allowSponsored={false}
        defaultTargetBlank={false}
        onCancel={() => setLinkModalOpen(false)}
        onSubmit={handleLinkSubmit}
      />
    </div>
  );
}

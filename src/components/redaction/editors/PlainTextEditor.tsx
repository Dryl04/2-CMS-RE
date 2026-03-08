import { useRef, useEffect } from 'react';

interface PlainTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function PlainTextEditor({
  value,
  onChange,
  disabled = false,
  placeholder = 'Saisissez ou collez votre texte SEO ici…',
}: PlainTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 320)}px`;
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Texte brut
        </label>
        <span className="text-xs text-gray-400">
          {value.length.toLocaleString('fr-FR')} caractères
        </span>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full min-h-[320px] px-4 py-3 text-sm font-mono leading-relaxed border border-gray-200 rounded-xl
          focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-y
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
          placeholder:text-gray-300 transition-colors"
      />
    </div>
  );
}

import type { StructuredContent } from '@/lib/redactionTypes';
import { STRUCTURED_FIELDS } from '@/lib/redactionTypes';

interface StructuredSeoEditorProps {
  value: StructuredContent;
  onChange: (value: StructuredContent) => void;
  disabled?: boolean;
}

export default function StructuredSeoEditor({
  value,
  onChange,
  disabled = false,
}: StructuredSeoEditorProps) {
  const handleFieldChange = (key: string, fieldValue: string) => {
    onChange({ ...value, [key]: fieldValue });
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Contenu structuré SEO
      </label>

      <div className="space-y-4">
        {STRUCTURED_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              {field.label}
            </label>
            {field.multiline ? (
              <textarea
                value={(value[field.key] as string) ?? ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                disabled={disabled}
                rows={field.key === 'body' ? 8 : 3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-y
                  disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
                  placeholder:text-gray-300 transition-colors"
                placeholder={`Entrez ${field.label.toLowerCase()}…`}
              />
            ) : (
              <input
                type="text"
                value={(value[field.key] as string) ?? ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none
                  disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
                  placeholder:text-gray-300 transition-colors"
                placeholder={`Entrez ${field.label.toLowerCase()}…`}
              />
            )}
            {/* Compteur pour les champs importants */}
            {(field.key === 'seo_title' || field.key === 'meta_description') && (
              <div className="flex justify-end mt-1">
                <span
                  className={`text-xs ${
                    field.key === 'seo_title'
                      ? (value[field.key]?.length ?? 0) > 60
                        ? 'text-amber-600'
                        : 'text-gray-400'
                      : (value[field.key]?.length ?? 0) > 160
                      ? 'text-amber-600'
                      : 'text-gray-400'
                  }`}
                >
                  {(value[field.key] as string)?.length ?? 0}
                  {field.key === 'seo_title' ? ' / 60' : ' / 160'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

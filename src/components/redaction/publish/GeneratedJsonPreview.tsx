import { useState, useMemo } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { validateGeneratedJson, extractJsonFromText } from '@/lib/redactionJsonValidation';

interface GeneratedJsonPreviewProps {
  jsonText: string;
  onCopy: () => void;
}

export default function GeneratedJsonPreview({ jsonText, onCopy }: GeneratedJsonPreviewProps) {
  const [expanded, setExpanded] = useState(false);

  const result = useMemo(() => {
    const extracted = extractJsonFromText(jsonText);
    if (!extracted) {
      return { json: null, raw: jsonText, validation: null };
    }
    const validation = validateGeneratedJson(extracted.json);
    return { json: extracted.json, raw: extracted.raw, validation };
  }, [jsonText]);

  const isValid = result.validation?.valid ?? false;
  const errors = result.validation?.errors ?? [];
  const warnings = result.validation?.warnings ?? [];

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Status bar */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 cursor-pointer
          ${isValid ? 'bg-emerald-50' : result.json ? 'bg-amber-50' : 'bg-red-50'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          ) : result.json ? (
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span className={`text-xs font-medium
            ${isValid ? 'text-emerald-800' : result.json ? 'text-amber-800' : 'text-red-800'}`}>
            {isValid
              ? 'JSON valide — prêt pour publication'
              : result.json
              ? `JSON parsé avec ${errors.length} erreur(s)`
              : 'JSON invalide — impossible de parser'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {result.json != null ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              className="p-1 rounded hover:bg-white/50 transition-colors"
              title="Copier le JSON"
            >
              <Copy className="w-3.5 h-3.5 text-gray-500" />
            </button>
          ) : null}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Errors / Warnings */}
      {(errors.length > 0 || warnings.length > 0) && expanded && (
        <div className="px-4 py-2 border-t border-gray-100 space-y-1">
          {errors.map((e, i) => (
            <p key={`e-${i}`} className="text-xs text-red-700 flex items-start gap-1.5">
              <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {e}
            </p>
          ))}
          {warnings.map((w, i) => (
            <p key={`w-${i}`} className="text-xs text-amber-700 flex items-start gap-1.5">
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {w}
            </p>
          ))}
        </div>
      )}

      {/* JSON Preview */}
      {expanded && (
        <div className="border-t border-gray-100">
          <pre className="text-xs font-mono text-gray-700 p-4 bg-gray-50 overflow-auto max-h-64 whitespace-pre-wrap">
            {result.json
              ? JSON.stringify(result.json, null, 2)
              : result.raw}
          </pre>
        </div>
      )}
    </div>
  );
}

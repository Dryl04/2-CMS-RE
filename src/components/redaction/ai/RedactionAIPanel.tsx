import { useState } from 'react';
import { X, Settings, Wand2 } from 'lucide-react';
import type { SEODocumentWithAuthor } from '@/lib/redactionTypes';
import type { PageTemplate } from '@/lib/supabase';
import RedactionConversation from './RedactionConversation';
import AIConfigModal from './AIConfigModal';

interface RedactionAIPanelProps {
  document: SEODocumentWithAuthor;
  userId: string;
  userRole: string;
  template: PageTemplate | null;
  templateExport: Record<string, unknown> | null;
  onClose: () => void;
  onJsonDetected: (jsonText: string) => void;
  onGenerateJson: () => void;
  generatingJson: boolean;
}

export default function RedactionAIPanel({
  document: doc,
  userId,
  userRole,
  template,
  templateExport,
  onClose,
  onJsonDetected,
  onGenerateJson,
  generatingJson,
}: RedactionAIPanelProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [configVersion, setConfigVersion] = useState(0);

  return (
    <>
      <div className="flex flex-col h-full bg-gray-50 border-l border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-emerald-600" />
            Assistant IA
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowConfig(true)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Configuration IA"
            >
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Bouton générer JSON */}
        <div className="px-3 py-2 bg-white border-b border-gray-100">
          <p className="mb-2 text-[11px] text-gray-500 text-center">
            Le prompt système global par défaut est appliqué automatiquement.
          </p>
          <button
            onClick={onGenerateJson}
            disabled={generatingJson || !template}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium
              bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl
              hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 transition-all"
          >
            <Wand2 className="w-3.5 h-3.5" />
            {generatingJson
              ? 'Génération en cours…'
              : template
              ? 'Générer le JSON de la page'
              : 'Choisissez un modèle cible'}
          </button>
          {template && (
            <p className="text-[10px] text-gray-400 mt-1 text-center">
              Template : {template.name}
            </p>
          )}
        </div>

        {/* Conversation */}
        <div className="flex-1 min-h-0">
          <RedactionConversation
            key={configVersion}
            documentId={doc.id}
            userId={userId}
            onJsonDetected={onJsonDetected}
          />
        </div>
      </div>

      {/* Modal config */}
      {showConfig && (
        <AIConfigModal
          userId={userId}
          userRole={userRole}
          onClose={() => setShowConfig(false)}
          onConfigsChanged={() => setConfigVersion((v) => v + 1)}
        />
      )}
    </>
  );
}

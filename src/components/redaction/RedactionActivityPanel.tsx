import { useState, useEffect } from 'react';
import { X, Clock, Filter } from 'lucide-react';
import type { SEODocumentActivityLog, ActivityEventType } from '@/lib/redactionTypes';
import { fetchDocumentLogs } from '@/lib/redactionActivity';
import { EVENT_LABELS, EVENT_COLORS } from '@/lib/redactionLogLabels';

interface RedactionActivityPanelProps {
  documentId: string;
  onClose: () => void;
}

export default function RedactionActivityPanel({
  documentId,
  onClose,
}: RedactionActivityPanelProps) {
  const [logs, setLogs] = useState<(SEODocumentActivityLog & { actor_profile?: { id: string; email: string; full_name?: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<ActivityEventType | 'all'>('all');

  useEffect(() => {
    setLoading(true);
    fetchDocumentLogs(documentId, 100)
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [documentId]);

  const filteredLogs = filterType === 'all' ? logs : logs.filter((l) => l.event_type === filterType);

  // Unique event types present in logs for filter
  const eventTypes = [...new Set(logs.map((l) => l.event_type))];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Historique d'activité</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filtre */}
        {eventTypes.length > 1 && (
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ActivityEventType | 'all')}
              className="text-xs px-2 py-1 border border-gray-200 rounded-md bg-white focus:border-emerald-500 outline-none"
            >
              <option value="all">Tous les événements</option>
              {eventTypes.map((t) => (
                <option key={t} value={t}>
                  {EVENT_LABELS[t as ActivityEventType] ?? t}
                </option>
              ))}
            </select>
            <span className="text-xs text-gray-400 ml-auto">
              {filteredLogs.length} événement{filteredLogs.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse flex gap-3">
                  <div className="w-2.5 h-2.5 bg-gray-200 rounded-full mt-1.5" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">
              Aucune activité enregistrée
            </p>
          ) : (
            <div className="space-y-0">
              {filteredLogs.map((log, i) => {
                const colorClass = EVENT_COLORS[log.event_type as ActivityEventType] ?? 'text-gray-500';
                const label = EVENT_LABELS[log.event_type as ActivityEventType];
                const actorName = log.actor_profile?.full_name || log.actor_profile?.email || 'Système';
                const date = new Date(log.created_at);

                return (
                  <div key={log.id} className="flex gap-3 relative group">
                    {/* Ligne verticale */}
                    {i < filteredLogs.length - 1 && (
                      <div className="absolute left-[5px] top-5 bottom-0 w-px bg-gray-200" />
                    )}

                    {/* Point */}
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 border-2 border-white relative z-10 ${
                        colorClass.replace('text-', 'bg-')
                      }`}
                    />

                    {/* Contenu */}
                    <div className="pb-5 min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {label && (
                            <span className={`text-xs font-medium ${colorClass}`}>
                              {label}
                            </span>
                          )}
                          <p className="text-sm text-gray-700 mt-0.5">{log.event_summary}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {actorName}
                        {' · '}
                        {date.toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                        })}
                        {' à '}
                        {date.toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>

                      {/* Détails payload (optionnel, collapsible) */}
                      {log.event_payload && Object.keys(log.event_payload).length > 0 && (
                        <details className="mt-1.5">
                          <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                            Détails
                          </summary>
                          <pre className="mt-1 text-xs text-gray-500 bg-gray-50 rounded-md p-2 overflow-x-auto">
                            {JSON.stringify(log.event_payload, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

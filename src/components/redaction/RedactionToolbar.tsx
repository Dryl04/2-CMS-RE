import {
  Search,
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeft,
  RefreshCw,
  SortAsc,
  SortDesc,
} from 'lucide-react';
import type { DocumentFilters, DocumentStatus } from '@/lib/redactionTypes';
import { STATUS_LABELS } from '@/lib/redactionTypes';

interface RedactionToolbarProps {
  filters: DocumentFilters;
  onFiltersChange: (filters: DocumentFilters) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function RedactionToolbar({
  filters,
  onFiltersChange,
  sidebarOpen,
  onToggleSidebar,
  onRefresh,
  loading,
}: RedactionToolbarProps) {
  const statusOptions: { value: DocumentStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'draft', label: STATUS_LABELS.draft },
    { value: 'ready_for_ai', label: STATUS_LABELS.ready_for_ai },
    { value: 'json_generated', label: STATUS_LABELS.json_generated },
    { value: 'published', label: STATUS_LABELS.published },
    { value: 'archived', label: STATUS_LABELS.archived },
  ];

  const sortOptions: { value: DocumentFilters['sortBy']; label: string }[] = [
    { value: 'updated_at', label: 'Dernière modification' },
    { value: 'created_at', label: 'Date de création' },
    { value: 'name', label: 'Nom' },
    { value: 'author', label: 'Auteur' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {/* Toggle sidebar */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        title={sidebarOpen ? 'Masquer les dossiers' : 'Afficher les dossiers'}
      >
        {sidebarOpen ? (
          <PanelLeftClose className="w-4 h-4 text-gray-500" />
        ) : (
          <PanelLeft className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Recherche */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          placeholder="Rechercher un document..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all bg-white"
        />
      </div>

      {/* Filtre statut */}
      <select
        value={filters.status}
        onChange={(e) =>
          onFiltersChange({ ...filters, status: e.target.value as DocumentStatus | 'all' })
        }
        className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Tri */}
      <select
        value={filters.sortBy}
        onChange={(e) =>
          onFiltersChange({ ...filters, sortBy: e.target.value as DocumentFilters['sortBy'] })
        }
        className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Ordre */}
      <button
        onClick={() =>
          onFiltersChange({
            ...filters,
            sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
          })
        }
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        title={filters.sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
      >
        {filters.sortOrder === 'asc' ? (
          <SortAsc className="w-4 h-4 text-gray-500" />
        ) : (
          <SortDesc className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* Refresh */}
      <button
        onClick={onRefresh}
        disabled={loading}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
        title="Rafraîchir"
      >
        <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}

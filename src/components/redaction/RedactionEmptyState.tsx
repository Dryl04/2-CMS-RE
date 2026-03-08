import { PenLine, Search, FilterX } from 'lucide-react';

interface RedactionEmptyStateProps {
  hasFilters: boolean;
  currentFolderName: string;
  onCreateDocument: () => void;
  onClearFilters: () => void;
}

export default function RedactionEmptyState({
  hasFilters,
  currentFolderName,
  onCreateDocument,
  onClearFilters,
}: RedactionEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Aucun résultat
        </h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Aucun document ne correspond à vos critères de recherche dans « {currentFolderName} ».
        </p>
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          <FilterX className="w-4 h-4" />
          Réinitialiser les filtres
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
      <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <PenLine className="w-10 h-10 text-emerald-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        Bienvenue dans la Rédaction
      </h3>
      <p className="text-gray-500 mb-8 max-w-lg mx-auto leading-relaxed">
        Cet espace vous permet de produire, organiser et collaborer sur vos textes SEO
        avant de les transformer en pages via l'IA.
      </p>
      <button
        onClick={onCreateDocument}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-medium"
      >
        <PenLine className="w-4 h-4" />
        Créer mon premier document
      </button>
    </div>
  );
}

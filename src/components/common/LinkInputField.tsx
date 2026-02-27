/**
 * LinkInputField — Champ de saisie de lien avec ouverture de LinkEditorModal.
 *
 * Remplace un simple <input type="text"> pour les champs link/href
 * dans les ContentEditors. Affiche la valeur actuelle avec un bouton
 * "Modifier" who ouvre la modale complète (autosuggestion + SEO).
 *
 * Usage:
 *   <LinkInputField
 *     label="Lien bouton"
 *     value={section.content.ctaLink || ''}
 *     onChange={(url) => updateContent('ctaLink', url)}
 *   />
 */

import { useState } from 'react';
import { Link2, Pencil, X } from 'lucide-react';
import { LinkEditorModal, LinkEditorResult } from './LinkEditorModal';

interface LinkInputFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  /** Classes CSS additionnelles pour le conteneur */
  className?: string;
  /** Afficher options SEO dans la modale */
  allowSeoOptions?: boolean;
}

export function LinkInputField({
  label,
  value,
  onChange,
  className = '',
  allowSeoOptions = false,
}: LinkInputFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = (result: LinkEditorResult) => {
    onChange(result.url);
    setModalOpen(false);
  };

  const handleClear = () => {
    onChange('');
  };

  const isEmpty = !value;
  const isInternal = value.startsWith('/');

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      )}

      <div className="flex items-center gap-1">
        {/* Affichage de la valeur */}
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-0 bg-white cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => setModalOpen(true)}
          title="Cliquer pour modifier le lien"
        >
          <Link2
            size={12}
            className={isEmpty ? 'text-gray-300 flex-shrink-0' : 'text-blue-500 flex-shrink-0'}
          />
          {isEmpty ? (
            <span className="text-gray-400 truncate select-none">Aucun lien</span>
          ) : (
            <span className="text-gray-800 truncate select-none">
              {isInternal && (
                <span className="text-blue-500 mr-1 text-xs font-medium">interne</span>
              )}
              {value}
            </span>
          )}
        </div>

        {/* Bouton modifier */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex-shrink-0 p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          title="Modifier le lien"
        >
          <Pencil size={13} />
        </button>

        {/* Bouton effacer (visible si valeur) */}
        {!isEmpty && (
          <button
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 p-2 rounded-lg border border-gray-300 text-gray-400 hover:text-red-500 hover:border-red-300 hover:bg-red-50 transition-colors"
            title="Supprimer le lien"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <LinkEditorModal
        isOpen={modalOpen}
        title={label ? `Modifier : ${label}` : 'Modifier le lien'}
        initialUrl={value}
        showAnchorText={false}
        allowOpenInNewTab
        allowNofollow={allowSeoOptions}
        allowNoopener={allowSeoOptions}
        allowSponsored={false}
        defaultTargetBlank={false}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

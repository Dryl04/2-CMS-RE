import { AI_PROVIDERS } from '@/lib/redactionTypes';
import type { AIProviderConfig } from '@/lib/redactionTypes';

interface AIProviderSelectorProps {
  configs: AIProviderConfig[];
  selectedConfigId: string | null;
  onSelect: (configId: string | null) => void;
}

export default function AIProviderSelector({
  configs,
  selectedConfigId,
  onSelect,
}: AIProviderSelectorProps) {
  if (configs.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic">
        Aucune configuration IA disponible.
      </p>
    );
  }

  return (
    <select
      value={selectedConfigId ?? ''}
      onChange={(e) => onSelect(e.target.value || null)}
      className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white focus:border-emerald-500 outline-none"
    >
      <option value="">— Choisir un fournisseur —</option>
      {configs.map((c) => {
        const provider = AI_PROVIDERS.find((p) => p.key === c.provider_key);
        const label = provider?.label ?? c.provider_label;
        const scope = c.scope === 'global' ? '🌐' : '👤';
        return (
          <option key={c.id} value={c.id}>
            {scope} {label} {c.default_model ? `(${c.default_model})` : ''}
          </option>
        );
      })}
    </select>
  );
}

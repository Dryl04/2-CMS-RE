import { AI_PROVIDERS } from '@/lib/redactionTypes';

interface AIModelSelectorProps {
  providerKey: string | null;
  selectedModel: string;
  onSelect: (model: string) => void;
}

export default function AIModelSelector({
  providerKey,
  selectedModel,
  onSelect,
}: AIModelSelectorProps) {
  const provider = AI_PROVIDERS.find((p) => p.key === providerKey);
  const models = provider?.models ?? [];

  if (!providerKey || models.length === 0) {
    return (
      <select
        disabled
        className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-400"
      >
        <option>Sélectionner un fournisseur d'abord</option>
      </select>
    );
  }

  return (
    <select
      value={selectedModel}
      onChange={(e) => onSelect(e.target.value)}
      className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white focus:border-emerald-500 outline-none"
    >
      {models.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  );
}

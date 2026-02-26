import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { ICON_LIST, ICON_MAP } from '@/lib/iconLibrary';

interface IconPickerProps {
    value: string;
    onChange: (iconKey: string) => void;
}

/**
 * Visual icon picker grid with search.
 * Shows all available Lucide icons plus supports custom URL/emoji input.
 */
export default function IconPicker({ value, onChange }: IconPickerProps) {
    const [search, setSearch] = useState('');
    const [showPicker, setShowPicker] = useState(false);

    const filtered = useMemo(() => {
        if (!search.trim()) return ICON_LIST.slice(0, 60);
        const q = search.toLowerCase();
        return ICON_LIST.filter(
            (icon) => icon.id.includes(q) || icon.label.toLowerCase().includes(q),
        );
    }, [search]);

    const SelectedIcon = ICON_MAP[value];

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 w-full"
            >
                {SelectedIcon ? (
                    <SelectedIcon size={16} className="text-gray-700" />
                ) : (
                    <span className="text-sm">{value || '—'}</span>
                )}
                <span className="text-gray-600 text-xs truncate flex-1 text-left">
                    {value || 'Choisir une icône'}
                </span>
            </button>

            {showPicker && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-3 max-h-72 overflow-hidden flex flex-col">
                    <div className="relative mb-2">
                        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher icône…"
                            className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded text-xs"
                            autoFocus
                        />
                    </div>
                    <div className="relative mb-2">
                        <input
                            type="text"
                            placeholder="URL image ou emoji perso"
                            className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    onChange((e.target as HTMLInputElement).value);
                                    setShowPicker(false);
                                }
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-8 gap-1 overflow-y-auto flex-1">
                        {filtered.map((icon) => {
                            const Icon = ICON_MAP[icon.id];
                            if (!Icon) return null;
                            return (
                                <button
                                    key={icon.id}
                                    type="button"
                                    title={icon.label}
                                    className={`p-1.5 rounded hover:bg-blue-50 transition-colors ${value === icon.id ? 'bg-blue-100 ring-1 ring-blue-400' : ''
                                        }`}
                                    onClick={() => {
                                        onChange(icon.id);
                                        setShowPicker(false);
                                    }}
                                >
                                    <Icon size={16} className="text-gray-700 mx-auto" />
                                </button>
                            );
                        })}
                    </div>
                    {filtered.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4">Aucune icône trouvée</p>
                    )}
                </div>
            )}
        </div>
    );
}

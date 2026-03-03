import { useState, useMemo, useRef } from 'react';
import { Search, Link as LinkIcon, Code, X, Upload } from 'lucide-react';
import { ICON_LIST, ICON_MAP, renderIcon } from '@/lib/iconLibrary';

interface IconPickerProps {
    value: string;
    onChange: (iconKey: string) => void;
    size?: number;
}

type PickerTab = 'library' | 'url' | 'code';

const URL_REGEX = /^https?:\/\//i;
const SVG_REGEX = /^<svg[\s>]/i;
const DATA_URI_REGEX = /^data:/i;

function isCustomIcon(val: string) {
    return URL_REGEX.test(val) || SVG_REGEX.test(val) || DATA_URI_REGEX.test(val);
}

export default function IconPicker({ value, onChange, size }: IconPickerProps) {
    const [search, setSearch] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [tab, setTab] = useState<PickerTab>('library');
    const [urlInput, setUrlInput] = useState('');
    const [codeInput, setCodeInput] = useState('');
    const pickerRef = useRef<HTMLDivElement>(null);

    const filtered = useMemo(() => {
        if (!search.trim()) return ICON_LIST.slice(0, 60);
        const q = search.toLowerCase();
        return ICON_LIST.filter(
            (icon) => icon.id.includes(q) || icon.label.toLowerCase().includes(q),
        );
    }, [search]);

    const SelectedIcon = ICON_MAP[value];
    const isCustom = value && isCustomIcon(value);

    const handleOpen = () => {
        setShowPicker(!showPicker);
        if (!showPicker) {
            if (URL_REGEX.test(value) || DATA_URI_REGEX.test(value)) {
                setUrlInput(value);
                setTab('url');
            } else if (SVG_REGEX.test(value)) {
                setCodeInput(value);
                setTab('code');
            } else {
                setTab('library');
            }
        }
    };

    const submitUrl = () => {
        const val = urlInput.trim();
        if (val) {
            onChange(val);
            setShowPicker(false);
        }
    };

    const submitCode = () => {
        const val = codeInput.trim();
        if (val && SVG_REGEX.test(val)) {
            onChange(val);
            setShowPicker(false);
        }
    };

    const handleClear = () => {
        onChange('');
        setUrlInput('');
        setCodeInput('');
    };

    const displaySize = size || 16;

    return (
        <div className="relative" ref={pickerRef}>
            <button
                type="button"
                onClick={handleOpen}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 w-full transition-colors"
            >
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {SelectedIcon ? (
                        <SelectedIcon size={displaySize} className="text-gray-700" />
                    ) : isCustom ? (
                        renderIcon(value, 'text-gray-700', displaySize)
                    ) : (
                        <span className="text-xs text-gray-400">--</span>
                    )}
                </span>
                <span className="text-gray-600 text-xs truncate flex-1 text-left">
                    {value ? (isCustom ? 'Icone personnalisee' : value) : 'Choisir une icone'}
                </span>
                {value && (
                    <span
                        onClick={(e) => { e.stopPropagation(); handleClear(); }}
                        className="p-0.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <X size={12} />
                    </span>
                )}
            </button>

            {showPicker && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden flex flex-col" style={{ maxHeight: 340 }}>
                    <div className="flex border-b border-gray-100">
                        {([
                            { key: 'library' as PickerTab, label: 'Bibliotheque', icon: Search },
                            { key: 'url' as PickerTab, label: 'URL / Image', icon: LinkIcon },
                            { key: 'code' as PickerTab, label: 'Code SVG', icon: Code },
                        ]).map((t) => (
                            <button
                                key={t.key}
                                type="button"
                                onClick={() => setTab(t.key)}
                                className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition-colors ${
                                    tab === t.key
                                        ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <t.icon size={12} />
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {tab === 'library' && (
                        <div className="flex flex-col overflow-hidden">
                            <div className="relative p-2 pb-1">
                                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Rechercher icone..."
                                    className="w-full pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                                    autoFocus
                                />
                            </div>
                            <div className="grid grid-cols-8 gap-1 overflow-y-auto flex-1 p-2 pt-1" style={{ maxHeight: 230 }}>
                                {filtered.map((icon) => {
                                    const Icon = ICON_MAP[icon.id];
                                    if (!Icon) return null;
                                    return (
                                        <button
                                            key={icon.id}
                                            type="button"
                                            title={icon.label}
                                            className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${
                                                value === icon.id ? 'bg-gray-900 text-white ring-1 ring-gray-900' : ''
                                            }`}
                                            onClick={() => {
                                                onChange(icon.id);
                                                setShowPicker(false);
                                            }}
                                        >
                                            <Icon size={16} className={`mx-auto ${value === icon.id ? 'text-white' : 'text-gray-700'}`} />
                                        </button>
                                    );
                                })}
                            </div>
                            {filtered.length === 0 && (
                                <p className="text-xs text-gray-400 text-center py-6">Aucune icone trouvee</p>
                            )}
                        </div>
                    )}

                    {tab === 'url' && (
                        <div className="p-3 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    URL de l'image (PNG, SVG, GIF, WebP)
                                </label>
                                <input
                                    type="text"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') submitUrl(); }}
                                    placeholder="https://example.com/icon.svg"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                                    autoFocus
                                />
                            </div>
                            {urlInput && (URL_REGEX.test(urlInput) || DATA_URI_REGEX.test(urlInput)) && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <img
                                        src={urlInput}
                                        alt="Preview"
                                        className="w-10 h-10 object-contain rounded border border-gray-200 bg-white p-1"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                    <span className="text-xs text-gray-500 flex-1 truncate">{urlInput}</span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={submitUrl}
                                disabled={!urlInput.trim()}
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <Upload size={12} />
                                Appliquer l'URL
                            </button>
                        </div>
                    )}

                    {tab === 'code' && (
                        <div className="p-3 space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Coller le code SVG
                                </label>
                                <textarea
                                    value={codeInput}
                                    onChange={(e) => setCodeInput(e.target.value)}
                                    placeholder={'<svg xmlns="http://www.w3.org/2000/svg" ...>...</svg>'}
                                    rows={5}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none"
                                    autoFocus
                                />
                            </div>
                            {codeInput && SVG_REGEX.test(codeInput) && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span
                                        className="w-10 h-10 flex items-center justify-center rounded border border-gray-200 bg-white p-1"
                                        dangerouslySetInnerHTML={{ __html: codeInput.replace(/<svg/, '<svg width="32" height="32"') }}
                                    />
                                    <span className="text-xs text-green-600 font-medium">SVG valide</span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={submitCode}
                                disabled={!codeInput.trim() || !SVG_REGEX.test(codeInput)}
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <Code size={12} />
                                Appliquer le SVG
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

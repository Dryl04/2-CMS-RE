import { useState } from 'react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { renderRichText } from '@/lib/htmlSanitizer';

interface CodeInsertWidgetProps {
    section: PageBuilderSection;
    onUpdate?: (updates: Partial<PageBuilderSection>) => void;
}

export default function CodeInsertWidget({ section }: CodeInsertWidgetProps) {
    const {
        code = '',
        language = 'html',
        title = '',
        showLineNumbers = true,
    } = section.content || {};
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (!code) {
        return (
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-base-200 rounded-2xl p-12 border-2 border-dashed border-base-300">
                        <p className="text-base-content/50 text-lg">
                            Aucun code à afficher. Ajoutez du code dans les propriétés du widget.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    const lines = code.split('\n');

    return (
        <section className="py-12 px-6">
            <div className="max-w-4xl mx-auto">
                {title && (
                    <h2 className="text-2xl font-bold text-base-content mb-4">{renderRichText(title)}</h2>
                )}
                <div className="relative rounded-xl overflow-hidden bg-gray-900 shadow-lg">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                        <span className="text-xs text-gray-400 font-mono uppercase">{language}</span>
                        <button
                            onClick={handleCopy}
                            className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded"
                        >
                            {copied ? '✓ Copié' : 'Copier'}
                        </button>
                    </div>
                    <div className="overflow-x-auto p-4">
                        <pre className="text-sm leading-relaxed">
                            <code className="text-gray-100 font-mono">
                                {lines.map((line: string, i: number) => (
                                    <div key={i} className="flex">
                                        {showLineNumbers && (
                                            <span className="select-none text-gray-500 pr-4 text-right inline-block" style={{ minWidth: '2.5rem' }}>
                                                {i + 1}
                                            </span>
                                        )}
                                        <span className="flex-1 whitespace-pre">{line}</span>
                                    </div>
                                ))}
                            </code>
                        </pre>
                    </div>
                </div>
            </div>
        </section>
    );
}

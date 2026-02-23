import { PageBuilderSection } from '../../../lib/pageBuilderTypes';

interface EmbedWidgetProps {
    section: PageBuilderSection;
    onUpdate?: (updates: Partial<PageBuilderSection>) => void;
}

export default function EmbedWidget({ section }: EmbedWidgetProps) {
    const { embedCode = '', title = '', maxWidth = '800px' } = section.content || {};

    if (!embedCode) {
        return (
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-base-200 rounded-2xl p-12 border-2 border-dashed border-base-300">
                        <p className="text-base-content/50 text-lg">
                            Aucun contenu intégré. Ajoutez un code d'intégration (iframe, script, etc.) dans les propriétés.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 px-6">
            <div className="mx-auto" style={{ maxWidth }}>
                {title && (
                    <h2 className="text-2xl font-bold text-base-content mb-6 text-center">{title}</h2>
                )}
                <div
                    className="embed-container w-full overflow-hidden rounded-xl"
                    dangerouslySetInnerHTML={{ __html: embedCode }}
                />
            </div>
        </section>
    );
}

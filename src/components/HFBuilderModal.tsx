import { useState, useCallback } from 'react';
import { X, Save, ChevronRight } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { widgetLibrary } from '@/lib/widgetLibrary';
import { isHeaderType, isFooterType } from '@/lib/globalHFSettings';
import Canvas from '@/components/PageBuilder/Canvas';
import PropertiesPanel from '@/components/PageBuilder/PropertiesPanel';

interface HFBuilderModalProps {
  type: 'header' | 'footer';
  initialSection: PageBuilderSection | null;
  onDone: (section: PageBuilderSection | null) => void;
  onClose: () => void;
}

export default function HFBuilderModal({ type, initialSection, onDone, onClose }: HFBuilderModalProps) {
  const [section, setSection] = useState<PageBuilderSection | null>(initialSection);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(initialSection?.id || null);
  const [step, setStep] = useState<'pick' | 'edit'>(initialSection ? 'edit' : 'pick');

  const widgetDefs = widgetLibrary.filter(w => {
    if (type === 'header') return isHeaderType(w.type);
    return isFooterType(w.type);
  });

  const pickWidget = (widgetType: string, variantId: string) => {
    const def = widgetLibrary.find(w => w.type === widgetType);
    if (!def) return;
    const variant = def.variants.find(v => v.id === variantId) || def.variants[0];
    const v = variant as Record<string, any>;
    const newSection: PageBuilderSection = {
      id: `global-${type}-${Date.now()}`,
      type: def.type,
      variant: variant.id,
      order: 0,
      content: { ...def.defaultContent, ...(v.defaultContent || {}) },
      design: JSON.parse(JSON.stringify({
        ...def.defaultDesign,
        ...(v.defaultDesign || {}),
      })),
      advanced: {},
    };
    setSection(newSection);
    setSelectedSectionId(newSection.id);
    setStep('edit');
  };

  const updateSection = useCallback((_id: string, updates: Partial<PageBuilderSection>) => {
    setSection(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const handleDone = () => {
    onDone(section);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {type === 'header' ? 'Configurer le Header global' : 'Configurer le Footer global'}
            </h2>
            <p className="text-sm text-gray-500">
              {step === 'pick'
                ? 'Choisissez un type de widget'
                : 'Personnalisez le contenu et le design'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {step === 'edit' && (
              <button
                onClick={handleDone}
                className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Valider</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {step === 'pick' ? (
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {widgetDefs.map(def => (
                  <div key={def.type} className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-800">{def.label}</h3>
                    <p className="text-xs text-gray-500 mb-2">{def.description}</p>
                    <div className="space-y-1.5">
                      {def.variants.map(v => {
                        const vAny = v as Record<string, any>;
                        return (
                          <button
                            key={`${def.type}-${v.id}`}
                            onClick={() => pickWidget(def.type, v.id)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-left transition-colors group"
                          >
                            <div>
                              <span className="text-sm font-medium text-gray-900">{v.label}</span>
                              {vAny.description && (
                                <p className="text-xs text-gray-500 mt-0.5">{vAny.description}</p>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : section ? (
            <div className="flex flex-1 overflow-hidden h-[calc(90vh-80px)]">
              <div className="flex-1 overflow-auto bg-gray-100 p-6">
                <Canvas
                  sections={[section]}
                  selectedSectionId={selectedSectionId}
                  onSelectSection={setSelectedSectionId}
                  onUpdateSection={updateSection}
                  onDeleteSection={() => {
                    setSection(null);
                    setStep('pick');
                  }}
                  onDuplicateSection={() => {}}
                  onReorder={() => {}}
                />
              </div>
              <div className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
                <PropertiesPanel
                  section={section}
                  onUpdateSection={(updates) => {
                    setSection(prev => prev ? { ...prev, ...updates } : null);
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

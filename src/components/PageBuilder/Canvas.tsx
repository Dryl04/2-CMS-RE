import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PageBuilderSection } from '../../lib/pageBuilderTypes';
import SectionRenderer from './SectionRenderer';

interface CanvasProps {
  sections: PageBuilderSection[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onUpdateSection: (id: string, updates: Partial<PageBuilderSection>) => void;
  onDeleteSection: (id: string) => void;
  onDuplicateSection: (id: string) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
}

export default function Canvas({
  sections,
  selectedSectionId,
  onSelectSection,
  onUpdateSection,
  onDeleteSection,
  onDuplicateSection,
  onReorder,
}: CanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  if (sections.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Commencez à construire
          </h3>
          <p className="text-gray-600">
            Sélectionnez un widget dans la bibliothèque de gauche pour commencer à créer votre page
          </p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {sections.map((section) => (
            <SectionRenderer
              key={section.id}
              section={section}
              isSelected={section.id === selectedSectionId}
              onSelect={() => onSelectSection(section.id)}
              onDelete={() => onDeleteSection(section.id)}
              onDuplicate={() => onDuplicateSection(section.id)}
              onUpdate={(updates) => onUpdateSection(section.id, updates)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

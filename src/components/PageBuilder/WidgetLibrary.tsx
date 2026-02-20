import { useState } from 'react';
import { Plus, Search, Monitor, Grid, MousePointer, Layout, Mail, MessageSquare, DollarSign, TrendingUp, Users, HelpCircle, Award, Video, Image, Clock, ListOrdered, Columns, AlignCenter, Minus, Layers, LayoutGrid, Phone, Zap, Shield, Heart, MessageCircle, Box, Umbrella, CreditCard, Paintbrush, Plug, Calendar, Share2, Sparkles, CheckSquare, Type, Quote, PlayCircle, Workflow, Facebook, Twitter, Youtube, Lock } from 'lucide-react';
import { widgetLibrary } from '../../lib/widgetLibrary';
import { PageBuilderSection, WidgetDefinition } from '../../lib/pageBuilderTypes';


interface WidgetLibraryProps {
  onAddSection: (section: PageBuilderSection) => void;
  existingSections: PageBuilderSection[];
}

interface WidgetFamily {
  id: string;
  label: string;
  description: string;
  icon: string;
  types: string[];
}

interface GroupedVariant {
  id: string;
  label: string;
  sourceWidget: WidgetDefinition;
  variantId: string;
}

interface GroupedWidget {
  id: string;
  label: string;
  description: string;
  icon: string;
  variants: GroupedVariant[];
}

const WIDGET_FAMILIES: WidgetFamily[] = [
  {
    id: 'header-family',
    label: 'Header',
    description: 'En-têtes et navigation',
    icon: 'layout',
    types: ['header', 'simple-header-divider', 'header-top-info', 'header-with-icons', 'header-account-bar', 'header-full-contact', 'header-clickfunnel'],
  },
  {
    id: 'hero-family',
    label: 'Hero',
    description: 'Sections d’accroche et variantes héro',
    icon: 'monitor',
    types: ['hero', 'clickfunnels-hero', 'clickfunnel-center-card', 'hero-with-services', 'hero-with-testimonials', 'brand-identity-hero', 'simple-centered-hero', 'creative-network-hero', 'videohero'],
  },
  {
    id: 'features-family',
    label: 'Features',
    description: 'Blocs fonctionnalités et services',
    icon: 'grid',
    types: ['features', 'services-grid', 'services-cards', 'services-carousel', 'bento-features', 'features-carousel', 'content-with-services', 'dropcap-services', 'integrations-grid'],
  },
  {
    id: 'process-family',
    label: 'Process',
    description: 'Process, timelines et déroulés',
    icon: 'workflow',
    types: ['process', 'process-alternating', 'process-steps-cards', 'timeline', 'timeline-grid'],
  },
  {
    id: 'proof-family',
    label: 'Preuves sociales',
    description: 'Témoignages, stats, équipe, logos',
    icon: 'users',
    types: ['testimonials', 'centered-testimonial', 'stats', 'team', 'logocloud'],
  },
];

const iconMap: Record<string, any> = {
  monitor: Monitor,
  grid: Grid,
  'mouse-pointer': MousePointer,
  layout: Layout,
  mail: Mail,
  'message-square': MessageSquare,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  users: Users,
  'help-circle': HelpCircle,
  award: Award,
  video: Video,
  image: Image,
  clock: Clock,
  'list-ordered': ListOrdered,
  columns: Columns,
  'align-center': AlignCenter,
  minus: Minus,
  layers: Layers,
  'layout-grid': LayoutGrid,
  phone: Phone,
  zap: Zap,
  shield: Shield,
  heart: Heart,
  'message-circle': MessageCircle,
  box: Box,
  umbrella: Umbrella,
  creditcard: CreditCard,
  'credit-card': CreditCard,
  paintbucket: Paintbrush,
  plug: Plug,
  calendar: Calendar,
  'share-2': Share2,
  sparkles: Sparkles,
  'check-square': CheckSquare,
  type: Type,
  quote: Quote,
  'play-circle': PlayCircle,
  workflow: Workflow,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  lock: Lock,
};

export default function WidgetLibrary({ onAddSection, existingSections }: WidgetLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);

  const existingTypes = new Set(existingSections.map(s => s.type));

  const isWidgetDisabled = (widget: WidgetDefinition) => {
    return widget.unique && existingTypes.has(widget.type);
  };

  const groupedWidgets: GroupedWidget[] = (() => {
    const consumedTypes = new Set<string>();

    const fromFamilies = WIDGET_FAMILIES.map((family) => {
      const matchedWidgets = family.types
        .map((type) => widgetLibrary.find((widget) => widget.type === type))
        .filter((widget): widget is WidgetDefinition => Boolean(widget));

      matchedWidgets.forEach((widget) => consumedTypes.add(widget.type));

      const variants = matchedWidgets.flatMap((widget) =>
        widget.variants.map((variant) => ({
          id: `${widget.type}::${variant.id}`,
          label: matchedWidgets.length > 1 ? `${widget.label} — ${variant.label}` : variant.label,
          sourceWidget: widget,
          variantId: variant.id,
        })),
      );

      return {
        id: family.id,
        label: family.label,
        description: family.description,
        icon: family.icon,
        variants,
      };
    }).filter((group) => group.variants.length > 0);

    const standalone = widgetLibrary
      .filter((widget) => !consumedTypes.has(widget.type))
      .map((widget) => ({
        id: widget.type,
        label: widget.label,
        description: widget.description,
        icon: widget.icon,
        variants: widget.variants.map((variant) => ({
          id: `${widget.type}::${variant.id}`,
          label: variant.label,
          sourceWidget: widget,
          variantId: variant.id,
        })),
      }));

    return [...fromFamilies, ...standalone];
  })();

  const filteredWidgets = groupedWidgets.filter((widget) => {
    const normalizedSearch = searchTerm.toLowerCase();
    if (!normalizedSearch) return true;

    return (
      widget.label.toLowerCase().includes(normalizedSearch) ||
      widget.description.toLowerCase().includes(normalizedSearch) ||
      widget.variants.some((variant) => variant.label.toLowerCase().includes(normalizedSearch))
    );
  });

  const createSection = (widget: WidgetDefinition, variantId: string) => {
    const section: PageBuilderSection = {
      id: `section-${Date.now()}`,
      type: widget.type,
      variant: variantId,
      order: 0,
      content: { ...widget.defaultContent },
      design: {
        ...widget.defaultDesign,
        typography: {
          ...(widget.defaultDesign.typography || {}),
        },
        colors: {
          ...(widget.defaultDesign.colors || {}),
        },
      },
      advanced: {
        cssClasses: [],
        customCSS: '',
        animations: {},
        visibility: {
          desktop: true,
          tablet: true,
          mobile: true,
        },
      },
    };

    onAddSection(section);
  };

  return (
    <>
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-bold mb-3">Widgets</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredWidgets.map((widget) => {
            const Icon = iconMap[widget.icon] || Layout;
            const isExpanded = expandedWidget === widget.id;
            const selectableVariants = widget.variants.filter((variant) => !isWidgetDisabled(variant.sourceWidget));
            const isDisabled = selectableVariants.length === 0;

            return (
              <div key={widget.id} className={`border border-gray-200 rounded-lg overflow-hidden ${isDisabled ? 'opacity-50' : ''}`}>
                <button
                  onClick={() => !isDisabled && setExpandedWidget(isExpanded ? null : widget.id)}
                  disabled={isDisabled}
                  className={`w-full flex items-start space-x-3 p-3 transition-colors text-left ${isDisabled ? 'cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-sm text-gray-900">{widget.label}</h3>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {isDisabled ? 'Toutes les variantes disponibles sont déjà ajoutées' : widget.description}
                    </p>
                  </div>
                  {!isDisabled && <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-2">
                    <p className="text-xs text-gray-600 mb-2 px-2">Choisir une variante:</p>
                    <div className="space-y-1">
                      {widget.variants.map((variant) => {
                        const variantDisabled = isWidgetDisabled(variant.sourceWidget);
                        return (
                          <button
                            key={variant.id}
                            onClick={() => !variantDisabled && createSection(variant.sourceWidget, variant.variantId)}
                            disabled={variantDisabled}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${variantDisabled ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'hover:bg-white text-gray-700 hover:text-gray-900'}`}
                          >
                            {variant.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredWidgets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Aucun widget trouvé</p>
          </div>
        )}
      </div>
    </>
  );
}



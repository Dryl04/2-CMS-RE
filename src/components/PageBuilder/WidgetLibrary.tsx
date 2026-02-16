import { useState } from 'react';
import { Plus, Search, Monitor, Grid, MousePointer, Layout, Mail, MessageSquare, DollarSign, TrendingUp, Users, HelpCircle, Award, Video, Image, Clock, ListOrdered, Columns, AlignCenter, Minus, Layers, LayoutGrid, Phone, Zap, Shield, Heart, MessageCircle, Box, Umbrella, CreditCard, Paintbrush, Plug, Calendar, Share2, Sparkles, CheckSquare, Type, Quote, PlayCircle, Workflow, Facebook, Twitter, Youtube, Lock } from 'lucide-react';
import { widgetLibrary } from '../../lib/widgetLibrary';
import { PageBuilderSection, WidgetDefinition } from '../../lib/pageBuilderTypes';


interface WidgetLibraryProps {
  onAddSection: (section: PageBuilderSection) => void;
  existingSections: PageBuilderSection[];
}

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

  const filteredWidgets = widgetLibrary.filter(widget =>
    widget.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    widget.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          fontFamily: 'inherit',
          fontSize: '1rem',
          lineHeight: '1.5',
          headingColor: '#111827',
          textColor: '#4B5563',
          ...(widget.defaultDesign.typography || {}),
        },
        colors: {
          primary: '#000000',
          secondary: '#ffffff',
          buttonBackground: '#000000',
          buttonText: '#ffffff',
          buttonBackgroundHover: '#1F2937',
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
            const Icon = iconMap[widget.icon];
            const isExpanded = expandedWidget === widget.type;
            const isDisabled = isWidgetDisabled(widget);

            return (
              <div key={widget.type} className={`border border-gray-200 rounded-lg overflow-hidden ${isDisabled ? 'opacity-50' : ''}`}>
                <button
                  onClick={() => !isDisabled && setExpandedWidget(isExpanded ? null : widget.type)}
                  disabled={isDisabled}
                  className={`w-full flex items-start space-x-3 p-3 transition-colors text-left ${
                    isDisabled ? 'cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-sm text-gray-900">{widget.label}</h3>
                      {widget.unique && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          Unique
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {isDisabled ? 'Deja ajoute a la page' : widget.description}
                    </p>
                  </div>
                  {!isDisabled && <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-2">
                    <p className="text-xs text-gray-600 mb-2 px-2">Choisir une variante:</p>
                    <div className="space-y-1">
                      {widget.variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => createSection(widget, variant.id)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-white rounded-lg transition-colors text-gray-700 hover:text-gray-900"
                        >
                          {variant.label}
                        </button>
                      ))}
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



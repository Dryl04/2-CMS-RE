import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { getWidgetFieldLabel } from '@/lib/widgetFieldLabels';
import ImageUploadField from './ImageUploadField';
import IconPicker from './IconPicker';

const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent';
const labelClass = 'block text-sm font-medium text-gray-700 mb-2';
const LABELS = {
  headline: getWidgetFieldLabel('headline') || 'Titre principal',
  subheadline: getWidgetFieldLabel('subheadline') || 'Sous-titre',
  title: getWidgetFieldLabel('title') || 'Titre principal',
  ctaText: getWidgetFieldLabel('ctaText') || 'Texte bouton principal',
  ctaLink: getWidgetFieldLabel('ctaLink') || 'Lien bouton principal',
  primaryCta: getWidgetFieldLabel('primaryCta') || 'Texte bouton principal',
  primaryLink: getWidgetFieldLabel('primaryLink') || 'Lien bouton principal',
  secondaryCta: getWidgetFieldLabel('secondaryCta') || 'Texte bouton secondaire',
  secondaryLink: getWidgetFieldLabel('secondaryLink') || 'Lien bouton secondaire',
};

interface ContentEditorProps {
  section: PageBuilderSection;
  updateContent: (key: string, value: any) => void;
}

export const FEATURE_ICONS = [
  { id: 'zap', label: 'Eclair' },
  { id: 'shield', label: 'Bouclier' },
  { id: 'heart', label: 'Coeur' },
  { id: 'star', label: 'Etoile' },
  { id: 'globe', label: 'Globe' },
  { id: 'lock', label: 'Cadenas' },
  { id: 'clock', label: 'Horloge' },
  { id: 'layers', label: 'Calques' },
  { id: 'users', label: 'Utilisateurs' },
  { id: 'code', label: 'Code' },
  { id: 'eye', label: 'Oeil' },
  { id: 'award', label: 'Recompense' },
  { id: 'target', label: 'Cible' },
  { id: 'settings', label: 'Parametres' },
  { id: 'trending-up', label: 'Croissance' },
  { id: 'check-circle', label: 'Validation' },
  { id: 'cpu', label: 'Processeur' },
  { id: 'database', label: 'Base de donnees' },
];

const SOCIAL_PLATFORMS = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'twitter', label: 'Twitter / X' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'youtube', label: 'YouTube' },
];

export function HeroContentEditor({ section, updateContent }: ContentEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{LABELS.headline}</label>
        <input
          type="text"
          value={section.content.headline || ''}
          onChange={(e) => updateContent('headline', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>{LABELS.subheadline}</label>
        <textarea
          value={section.content.subheadline || ''}
          onChange={(e) => updateContent('subheadline', e.target.value)}
          rows={3}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>{LABELS.ctaText}</label>
        <input
          type="text"
          value={section.content.ctaText || ''}
          onChange={(e) => updateContent('ctaText', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>{LABELS.ctaLink}</label>
        <input
          type="text"
          value={section.content.ctaLink || ''}
          onChange={(e) => updateContent('ctaLink', e.target.value)}
          className={inputClass}
        />
      </div>
      <ImageUploadField
        label="Image"
        value={section.content.image || ''}
        onChange={(url) => updateContent('image', url)}
        placeholder="URL de l'image"
      />
    </div>
  );
}

export function CTAContentEditor({ section, updateContent }: ContentEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>{LABELS.headline}</label>
        <input
          type="text"
          value={section.content.headline || ''}
          onChange={(e) => updateContent('headline', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Description (H2)</label>
        <textarea
          value={section.content.description || ''}
          onChange={(e) => updateContent('description', e.target.value)}
          rows={3}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Bouton principal</label>
        <input
          type="text"
          value={section.content.primaryCta || ''}
          onChange={(e) => updateContent('primaryCta', e.target.value)}
          className={`${inputClass} mb-2`}
          placeholder={LABELS.primaryCta}
        />
        <input
          type="text"
          value={section.content.primaryLink || ''}
          onChange={(e) => updateContent('primaryLink', e.target.value)}
          className={inputClass}
          placeholder={LABELS.primaryLink}
        />
      </div>
      <div>
        <label className={labelClass}>Bouton secondaire</label>
        <input
          type="text"
          value={section.content.secondaryCta || ''}
          onChange={(e) => updateContent('secondaryCta', e.target.value)}
          className={`${inputClass} mb-2`}
          placeholder={LABELS.secondaryCta}
        />
        <input
          type="text"
          value={section.content.secondaryLink || ''}
          onChange={(e) => updateContent('secondaryLink', e.target.value)}
          className={inputClass}
          placeholder={LABELS.secondaryLink}
        />
      </div>
      <ImageUploadField
        label="Image (variante split)"
        value={section.content.image || ''}
        onChange={(url) => updateContent('image', url)}
        placeholder="URL de l'image"
        mediaType="image"
      />
    </div>
  );
}

export function HeaderContentEditor({ section, updateContent }: ContentEditorProps) {
  const navItems = section.content.navItems || [];

  const updateNavItem = (index: number, field: string, value: string) => {
    const updated = [...navItems];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('navItems', updated);
  };

  const addNavItem = () => {
    updateContent('navItems', [...navItems, { label: 'Nouveau lien', link: '#' }]);
  };

  const removeNavItem = (index: number) => {
    updateContent('navItems', navItems.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <ImageUploadField
        label="Logo"
        value={section.content.logo || ''}
        onChange={(url) => updateContent('logo', url)}
        placeholder="URL du logo"
      />
      <div>
        <label className={labelClass}>Texte du logo</label>
        <input
          type="text"
          value={section.content.logoText || ''}
          onChange={(e) => updateContent('logoText', e.target.value)}
          className={inputClass}
          placeholder="Nom de la marque"
        />
      </div>

      <div>
        <label className={labelClass}>Navigation</label>
        <div className="space-y-2">
          {navItems.map((item: any, index: number) => (
            <div key={index} className="flex items-start gap-1.5 bg-gray-50 p-2 rounded-lg">
              <GripVertical className="w-4 h-4 text-gray-300 mt-2.5 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={item.label || ''}
                  onChange={(e) => updateNavItem(index, 'label', e.target.value)}
                  className={inputClass}
                  placeholder="Label"
                />
                <input
                  type="text"
                  value={item.link || ''}
                  onChange={(e) => updateNavItem(index, 'link', e.target.value)}
                  className={inputClass}
                  placeholder="Lien (ex: /about)"
                />
              </div>
              <button
                onClick={() => removeNavItem(index)}
                className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded mt-1.5 flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addNavItem}
          className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un lien</span>
        </button>
      </div>

      <div>
        <label className={labelClass}>Bouton CTA</label>
        <input
          type="text"
          value={section.content.ctaText || ''}
          onChange={(e) => updateContent('ctaText', e.target.value)}
          className={`${inputClass} mb-2`}
          placeholder={LABELS.ctaText}
        />
        <input
          type="text"
          value={section.content.ctaLink || ''}
          onChange={(e) => updateContent('ctaLink', e.target.value)}
          className={inputClass}
          placeholder={LABELS.ctaLink}
        />
      </div>

      <div>
        <label className={labelClass}>Bouton secondaire</label>
        <input
          type="text"
          value={section.content.secondaryCtaText || ''}
          onChange={(e) => updateContent('secondaryCtaText', e.target.value)}
          className={`${inputClass} mb-2`}
          placeholder={LABELS.secondaryCta}
        />
        <input
          type="text"
          value={section.content.secondaryCtaLink || ''}
          onChange={(e) => updateContent('secondaryCtaLink', e.target.value)}
          className={inputClass}
          placeholder={LABELS.secondaryLink}
        />
      </div>

      <div>
        <label className={labelClass}>Lien compte</label>
        <input
          type="text"
          value={section.content.accountText || ''}
          onChange={(e) => updateContent('accountText', e.target.value)}
          className={`${inputClass} mb-2`}
          placeholder="Texte compte (ex: Log in)"
        />
        <input
          type="text"
          value={section.content.accountLink || ''}
          onChange={(e) => updateContent('accountLink', e.target.value)}
          className={inputClass}
          placeholder="Lien compte"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={section.content.showSearch !== false}
            onChange={(e) => updateContent('showSearch', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <span>Afficher recherche</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={section.content.showCart === true}
            onChange={(e) => updateContent('showCart', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <span>Afficher panier</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Lien recherche</label>
          <input
            type="text"
            value={section.content.searchLink || ''}
            onChange={(e) => updateContent('searchLink', e.target.value)}
            className={inputClass}
            placeholder="Lien recherche"
          />
        </div>
        <div>
          <label className={labelClass}>Lien panier</label>
          <input
            type="text"
            value={section.content.cartLink || ''}
            onChange={(e) => updateContent('cartLink', e.target.value)}
            className={inputClass}
            placeholder="Lien panier"
          />
        </div>
      </div>
    </div>
  );
}

export function ContactContentEditor({ section, updateContent }: ContentEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Titre</label>
        <input
          type="text"
          value={section.content.title || ''}
          onChange={(e) => updateContent('title', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Sous-titre (H2)</label>
        <input
          type="text"
          value={section.content.subtitle || ''}
          onChange={(e) => updateContent('subtitle', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          value={section.content.email || ''}
          onChange={(e) => updateContent('email', e.target.value)}
          className={inputClass}
          placeholder="contact@example.com"
        />
      </div>
      <div>
        <label className={labelClass}>Telephone</label>
        <input
          type="text"
          value={section.content.phone || ''}
          onChange={(e) => updateContent('phone', e.target.value)}
          className={inputClass}
          placeholder="+33 1 23 45 67 89"
        />
      </div>
      <div>
        <label className={labelClass}>Adresse</label>
        <textarea
          value={section.content.address || ''}
          onChange={(e) => updateContent('address', e.target.value)}
          rows={2}
          className={inputClass}
          placeholder="123 Rue Example, 75001 Paris"
        />
      </div>
      <label className="flex items-center space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={section.content.showForm !== false}
          onChange={(e) => updateContent('showForm', e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
        />
        <span className="text-sm font-medium text-gray-700">Afficher le formulaire de contact</span>
      </label>
    </div>
  );
}

export function FeaturesContentEditor({ section, updateContent }: ContentEditorProps) {
  const features = section.content.features || [];

  const updateFeature = (index: number, field: string, value: string) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('features', updated);
  };

  const addFeature = () => {
    updateContent('features', [
      ...features,
      { icon: 'zap', title: 'Nouvelle fonctionnalite', description: 'Description de la fonctionnalite' },
    ]);
  };

  const removeFeature = (index: number) => {
    updateContent('features', features.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Titre</label>
        <input
          type="text"
          value={section.content.title || ''}
          onChange={(e) => updateContent('title', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Sous-titre (H2)</label>
        <input
          type="text"
          value={section.content.subtitle || ''}
          onChange={(e) => updateContent('subtitle', e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Fonctionnalites</label>
        <div className="space-y-3">
          {features.map((feature: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">#{index + 1}</span>
                <button
                  onClick={() => removeFeature(index)}
                  className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <IconPicker
                value={feature.icon || 'zap'}
                onChange={(val) => updateFeature(index, 'icon', val)}
              />
              <input
                type="text"
                value={feature.title || ''}
                onChange={(e) => updateFeature(index, 'title', e.target.value)}
                className={inputClass}
                placeholder="Titre"
              />
              <textarea
                value={feature.description || ''}
                onChange={(e) => updateFeature(index, 'description', e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="Description"
              />
            </div>
          ))}
        </div>
        <button
          onClick={addFeature}
          className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une fonctionnalite</span>
        </button>
      </div>
    </div>
  );
}

export function TestimonialsContentEditor({ section, updateContent }: ContentEditorProps) {
  const testimonials = section.content.testimonials || [];

  const updateTestimonial = (index: number, field: string, value: any) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('testimonials', updated);
  };

  const addTestimonial = () => {
    updateContent('testimonials', [
      ...testimonials,
      {
        quote: 'Un excellent produit !',
        name: 'Nom',
        title: 'Titre',
        avatar: '',
        rating: 5,
      },
    ]);
  };

  const removeTestimonial = (index: number) => {
    updateContent('testimonials', testimonials.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Titre</label>
        <input
          type="text"
          value={section.content.title || ''}
          onChange={(e) => updateContent('title', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Sous-titre (H2)</label>
        <input
          type="text"
          value={section.content.subtitle || ''}
          onChange={(e) => updateContent('subtitle', e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Temoignages</label>
        <div className="space-y-3">
          {testimonials.map((t: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">#{index + 1}</span>
                <button
                  onClick={() => removeTestimonial(index)}
                  className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                value={t.quote || ''}
                onChange={(e) => updateTestimonial(index, 'quote', e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="Citation"
              />
              <input
                type="text"
                value={t.name || ''}
                onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                className={inputClass}
                placeholder="Nom"
              />
              <input
                type="text"
                value={t.title || ''}
                onChange={(e) => updateTestimonial(index, 'title', e.target.value)}
                className={inputClass}
                placeholder="Titre / Poste"
              />
              <ImageUploadField
                label="Avatar"
                value={t.avatar || ''}
                onChange={(url) => updateTestimonial(index, 'avatar', url)}
                placeholder="URL de l'avatar"
              />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Note</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => updateTestimonial(index, 'rating', star)}
                      className={`w-7 h-7 rounded text-sm font-medium transition-colors ${star <= (t.rating || 0)
                        ? 'bg-yellow-400 text-white'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                        }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addTestimonial}
          className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un temoignage</span>
        </button>
      </div>
    </div>
  );
}

export function FooterContentEditor({ section, updateContent }: ContentEditorProps) {
  const columns = section.content.columns || [];
  const socialLinks = section.content.socialLinks || [];

  const updateColumn = (colIndex: number, field: string, value: any) => {
    const updated = [...columns];
    updated[colIndex] = { ...updated[colIndex], [field]: value };
    updateContent('columns', updated);
  };

  const addColumn = () => {
    updateContent('columns', [
      ...columns,
      { title: 'Nouvelle colonne', links: [{ label: 'Lien', url: '#' }] },
    ]);
  };

  const removeColumn = (colIndex: number) => {
    updateContent('columns', columns.filter((_: any, i: number) => i !== colIndex));
  };

  const updateColumnLink = (colIndex: number, linkIndex: number, field: string, value: string) => {
    const updated = [...columns];
    const links = [...(updated[colIndex].links || [])];
    links[linkIndex] = { ...links[linkIndex], [field]: value };
    updated[colIndex] = { ...updated[colIndex], links };
    updateContent('columns', updated);
  };

  const addColumnLink = (colIndex: number) => {
    const updated = [...columns];
    const links = [...(updated[colIndex].links || []), { label: 'Nouveau lien', url: '#' }];
    updated[colIndex] = { ...updated[colIndex], links };
    updateContent('columns', updated);
  };

  const removeColumnLink = (colIndex: number, linkIndex: number) => {
    const updated = [...columns];
    const links = (updated[colIndex].links || []).filter((_: any, i: number) => i !== linkIndex);
    updated[colIndex] = { ...updated[colIndex], links };
    updateContent('columns', updated);
  };

  const updateSocialLink = (index: number, field: string, value: string) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('socialLinks', updated);
  };

  const addSocialLink = () => {
    updateContent('socialLinks', [...socialLinks, { platform: 'facebook', url: '#' }]);
  };

  const removeSocialLink = (index: number) => {
    updateContent('socialLinks', socialLinks.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <ImageUploadField
        label="Logo"
        value={section.content.logo || ''}
        onChange={(url) => updateContent('logo', url)}
        placeholder="URL du logo"
      />
      <div>
        <label className={labelClass}>Texte du logo</label>
        <input
          type="text"
          value={section.content.logoText || ''}
          onChange={(e) => updateContent('logoText', e.target.value)}
          className={inputClass}
          placeholder="Nom de la marque"
        />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={section.content.description || ''}
          onChange={(e) => updateContent('description', e.target.value)}
          rows={2}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Colonnes de liens</label>
        <div className="space-y-3">
          {columns.map((col: any, colIndex: number) => (
            <div key={colIndex} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Colonne {colIndex + 1}</span>
                <button
                  onClick={() => removeColumn(colIndex)}
                  className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={col.title || ''}
                onChange={(e) => updateColumn(colIndex, 'title', e.target.value)}
                className={inputClass}
                placeholder="Titre de la colonne"
              />
              <div className="pl-3 border-l-2 border-gray-200 space-y-1.5">
                {(col.links || []).map((link: any, linkIndex: number) => (
                  <div key={linkIndex} className="flex items-center gap-1">
                    <div className="flex-1 flex gap-1">
                      <input
                        type="text"
                        value={link.label || ''}
                        onChange={(e) => updateColumnLink(colIndex, linkIndex, 'label', e.target.value)}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent"
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={link.url || ''}
                        onChange={(e) => updateColumnLink(colIndex, linkIndex, 'url', e.target.value)}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent"
                        placeholder="URL"
                      />
                    </div>
                    <button
                      onClick={() => removeColumnLink(colIndex, linkIndex)}
                      className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addColumnLink(colIndex)}
                  className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  <Plus className="w-3 h-3" />
                  <span>Ajouter un lien</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addColumn}
          className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une colonne</span>
        </button>
      </div>

      <div>
        <label className={labelClass}>Reseaux sociaux</label>
        <div className="space-y-2">
          {socialLinks.map((social: any, index: number) => (
            <div key={index} className="flex items-center gap-1.5">
              <select
                value={social.platform || 'facebook'}
                onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent"
              >
                {SOCIAL_PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={social.url || ''}
                onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent"
                placeholder="URL"
              />
              <button
                onClick={() => removeSocialLink(index)}
                className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addSocialLink}
          className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un reseau</span>
        </button>
      </div>

      <div>
        <label className={labelClass}>Copyright</label>
        <input
          type="text"
          value={section.content.copyright || ''}
          onChange={(e) => updateContent('copyright', e.target.value)}
          className={inputClass}
          placeholder="Laissez vide pour le texte par defaut"
        />
      </div>
    </div>
  );
}

export function ImageTextSplitContentEditor({ section, updateContent }: ContentEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Sous-titre (optionnel)</label>
        <input
          type="text"
          value={section.content.subtitle || ''}
          onChange={(e) => updateContent('subtitle', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Titre principal</label>
        <textarea
          value={section.content.headline || ''}
          onChange={(e) => updateContent('headline', e.target.value)}
          rows={3}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Paragraphe 1</label>
        <textarea
          value={section.content.paragraph1 || ''}
          onChange={(e) => updateContent('paragraph1', e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Paragraphe 2</label>
        <textarea
          value={section.content.paragraph2 || ''}
          onChange={(e) => updateContent('paragraph2', e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Paragraphe 3 (optionnel)</label>
        <textarea
          value={section.content.paragraph3 || ''}
          onChange={(e) => updateContent('paragraph3', e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Texte du lien</label>
        <input
          type="text"
          value={section.content.ctaText || ''}
          onChange={(e) => updateContent('ctaText', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Lien</label>
        <input
          type="text"
          value={section.content.ctaLink || ''}
          onChange={(e) => updateContent('ctaLink', e.target.value)}
          className={inputClass}
        />
      </div>
      <ImageUploadField
        label="Image"
        value={section.content.image || ''}
        onChange={(value) => updateContent('image', value)}
      />
    </div>
  );
}

export function ContentShowcaseContentEditor({ section, updateContent }: ContentEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Sous-titre</label>
        <input
          type="text"
          value={section.content.subtitle || ''}
          onChange={(e) => updateContent('subtitle', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Titre principal</label>
        <textarea
          value={section.content.headline || ''}
          onChange={(e) => updateContent('headline', e.target.value)}
          rows={2}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Colonne 1</label>
        <textarea
          value={section.content.column1 || ''}
          onChange={(e) => updateContent('column1', e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Colonne 2</label>
        <textarea
          value={section.content.column2 || ''}
          onChange={(e) => updateContent('column2', e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Colonne 3 (optionnel)</label>
        <textarea
          value={section.content.column3 || ''}
          onChange={(e) => updateContent('column3', e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>
      <ImageUploadField
        label="Image"
        value={section.content.image || ''}
        onChange={(value) => updateContent('image', value)}
      />
    </div>
  );
}

export function CenteredContentContentEditor({ section, updateContent }: ContentEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Sous-titre</label>
        <input
          type="text"
          value={section.content.subtitle || ''}
          onChange={(e) => updateContent('subtitle', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Titre principal</label>
        <textarea
          value={section.content.headline || ''}
          onChange={(e) => updateContent('headline', e.target.value)}
          rows={2}
          className={inputClass}
        />
      </div>
      <ImageUploadField
        label="Image"
        value={section.content.image || ''}
        onChange={(value) => updateContent('image', value)}
      />
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={section.content.description || ''}
          onChange={(e) => updateContent('description', e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Texte du bouton</label>
        <input
          type="text"
          value={section.content.ctaText || ''}
          onChange={(e) => updateContent('ctaText', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Lien du bouton</label>
        <input
          type="text"
          value={section.content.ctaLink || ''}
          onChange={(e) => updateContent('ctaLink', e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  );
}

export function TextColumnsContentEditor({ section, updateContent }: ContentEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Introduction</label>
        <textarea
          value={section.content.introduction || ''}
          onChange={(e) => updateContent('introduction', e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Texte du bouton</label>
        <input
          type="text"
          value={section.content.ctaText || ''}
          onChange={(e) => updateContent('ctaText', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Lien du bouton</label>
        <input
          type="text"
          value={section.content.ctaLink || ''}
          onChange={(e) => updateContent('ctaLink', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Colonne 1</label>
        <textarea
          value={section.content.column1 || ''}
          onChange={(e) => updateContent('column1', e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Colonne 2</label>
        <textarea
          value={section.content.column2 || ''}
          onChange={(e) => updateContent('column2', e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Colonne 3 (optionnel)</label>
        <textarea
          value={section.content.column3 || ''}
          onChange={(e) => updateContent('column3', e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>
    </div>
  );
}

export function ClickFunnelCenterCardContentEditor({ section, updateContent }: ContentEditorProps) {
  const navItems = section.content.navItems || [];
  const [selectedTabIndex, setSelectedTabIndex] = React.useState(0);

  const updateNavItem = (index: number, field: string, value: any) => {
    const updated = [...navItems];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('navItems', updated);
  };

  const addNavItem = () => {
    updateContent('navItems', [
      ...navItems,
      {
        label: 'New Tab',
        title: 'New Tab',
        subtitle: 'Subtitle for new tab',
        highlight: 'highlight text',
        description: 'Description for this tab',
        buttonText: 'Get Started',
        mediaUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
        mediaType: 'image',
      },
    ]);
  };

  const removeNavItem = (index: number) => {
    updateContent('navItems', navItems.filter((_: any, i: number) => i !== index));
    if (selectedTabIndex >= navItems.length - 1) {
      setSelectedTabIndex(Math.max(0, navItems.length - 2));
    }
  };

  const selectedTab = navItems[selectedTabIndex] || {};

  return (
    <div className="space-y-4">
      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Onglets de navigation</label>
          <button
            onClick={addNavItem}
            className="p-1 text-gray-600 hover:text-black hover:bg-gray-100 rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 mb-4 flex-wrap">
          {navItems.map((item: any, index: number) => (
            <button
              key={index}
              onClick={() => setSelectedTabIndex(index)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${selectedTabIndex === index
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {item.label || `Tab ${index + 1}`}
            </button>
          ))}
        </div>

        {navItems.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">
                Éditer: {selectedTab.label || `Tab ${selectedTabIndex + 1}`}
              </h4>
              <button
                onClick={() => removeNavItem(selectedTabIndex)}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
                title="Supprimer cet onglet"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className={labelClass}>Nom de l'onglet</label>
              <input
                type="text"
                value={selectedTab.label || ''}
                onChange={(e) => updateNavItem(selectedTabIndex, 'label', e.target.value)}
                placeholder="Nom affiché dans la navigation"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Titre principal</label>
              <input
                type="text"
                value={selectedTab.title || ''}
                onChange={(e) => updateNavItem(selectedTabIndex, 'title', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Sous-titre</label>
              <input
                type="text"
                value={selectedTab.subtitle || ''}
                onChange={(e) => updateNavItem(selectedTabIndex, 'subtitle', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Texte en surbrillance</label>
              <input
                type="text"
                value={selectedTab.highlight || ''}
                onChange={(e) => updateNavItem(selectedTabIndex, 'highlight', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={selectedTab.description || ''}
                onChange={(e) => updateNavItem(selectedTabIndex, 'description', e.target.value)}
                rows={3}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Texte du bouton</label>
              <input
                type="text"
                value={selectedTab.buttonText || ''}
                onChange={(e) => updateNavItem(selectedTabIndex, 'buttonText', e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Type de média</label>
              <select
                value={selectedTab.mediaType || 'image'}
                onChange={(e) => updateNavItem(selectedTabIndex, 'mediaType', e.target.value)}
                className={inputClass}
              >
                <option value="image">Image</option>
                <option value="video">Vidéo</option>
              </select>
            </div>

            <ImageUploadField
              label={selectedTab.mediaType === 'video' ? 'URL de la vidéo' : 'Image'}
              value={selectedTab.mediaUrl || ''}
              onChange={(url) => updateNavItem(selectedTabIndex, 'mediaUrl', url)}
              placeholder={selectedTab.mediaType === 'video' ? 'URL de la vidéo' : "URL de l'image"}
            />
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={section.content.showLeftDecor !== false}
            onChange={(e) => updateContent('showLeftDecor', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Afficher décoration gauche</span>
        </label>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={section.content.showRightDecor !== false}
            onChange={(e) => updateContent('showRightDecor', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Afficher décoration droite</span>
        </label>
      </div>
    </div>
  );
}

export function ClickFunnelTestimonialsContentEditor({ section, updateContent }: ContentEditorProps) {
  const logos = section.content.logos || [];
  const testimonials = section.content.testimonials || [];

  const addLogo = () => {
    const newLogos = [...logos, { name: 'Nouveau logo', imageUrl: '' }];
    updateContent('logos', newLogos);
  };

  const updateLogo = (index: number, field: string, value: string) => {
    const newLogos = [...logos];
    newLogos[index] = { ...newLogos[index], [field]: value };
    updateContent('logos', newLogos);
  };

  const removeLogo = (index: number) => {
    const newLogos = logos.filter((_: any, i: number) => i !== index);
    updateContent('logos', newLogos);
  };

  const addTestimonial = () => {
    const newTestimonials = [
      ...testimonials,
      {
        quote: 'Nouveau témoignage',
        name: 'Nom',
        badge: 'Verified ClickFunnels User',
        avatar: '',
      },
    ];
    updateContent('testimonials', newTestimonials);
  };

  const updateTestimonial = (index: number, field: string, value: string) => {
    const newTestimonials = [...testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    updateContent('testimonials', newTestimonials);
  };

  const removeTestimonial = (index: number) => {
    const newTestimonials = testimonials.filter((_: any, i: number) => i !== index);
    updateContent('testimonials', newTestimonials);
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={section.content.showLogos !== false}
            onChange={(e) => updateContent('showLogos', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Afficher les logos</span>
        </label>
      </div>

      {section.content.showLogos !== false && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Logos de marques</label>
            <button
              type="button"
              onClick={addLogo}
              className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>

          <div className="space-y-3">
            {logos.map((logo: any, index: number) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Logo {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeLogo(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={logo.name || ''}
                    onChange={(e) => updateLogo(index, 'name', e.target.value)}
                    placeholder="Nom de la marque"
                    className={inputClass}
                  />
                  <ImageUploadField
                    label=""
                    value={logo.imageUrl || ''}
                    onChange={(url) => updateLogo(index, 'imageUrl', url)}
                    placeholder="URL du logo"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={section.content.showStat !== false}
            onChange={(e) => updateContent('showStat', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Afficher la carte statistique</span>
        </label>

        {section.content.showStat !== false && (
          <div className="space-y-3 pl-6">
            <div>
              <label className={labelClass}>Nombre</label>
              <input
                type="text"
                value={section.content.statNumber || ''}
                onChange={(e) => updateContent('statNumber', e.target.value)}
                placeholder="100K+"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Label</label>
              <input
                type="text"
                value={section.content.statLabel || ''}
                onChange={(e) => updateContent('statLabel', e.target.value)}
                placeholder="ClickFunnels Users"
                className={inputClass}
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Témoignages</label>
          <button
            type="button"
            onClick={addTestimonial}
            className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <div className="space-y-3">
          {testimonials.map((testimonial: any, index: number) => (
            <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Témoignage {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeTestimonial(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className={labelClass}>Citation</label>
                  <textarea
                    value={testimonial.quote || ''}
                    onChange={(e) => updateTestimonial(index, 'quote', e.target.value)}
                    placeholder="Témoignage du client..."
                    rows={3}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Nom</label>
                  <input
                    type="text"
                    value={testimonial.name || ''}
                    onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                    placeholder="John Doe"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Badge</label>
                  <input
                    type="text"
                    value={testimonial.badge || ''}
                    onChange={(e) => updateTestimonial(index, 'badge', e.target.value)}
                    placeholder="Verified ClickFunnels User"
                    className={inputClass}
                  />
                </div>
                <ImageUploadField
                  label="Avatar"
                  value={testimonial.avatar || ''}
                  onChange={(url) => updateTestimonial(index, 'avatar', url)}
                  placeholder="URL de l'avatar"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ClickFunnelFeaturesContentEditor({ section, updateContent }: ContentEditorProps) {
  const features = section.content.features || [];

  const addFeature = () => {
    const newFeatures = [
      ...features,
      {
        videoUrl: '',
        thumbnailUrl: 'https://images.pexels.com/photos/5699479/pexels-photo-5699479.jpeg?auto=compress&cs=tinysrgb&w=600',
        quote: 'Nouvelle citation',
        author: 'Nom de l\'auteur',
      },
    ];
    updateContent('features', newFeatures);
  };

  const updateFeature = (index: number, field: string, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    updateContent('features', newFeatures);
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_: any, i: number) => i !== index);
    updateContent('features', newFeatures);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
        <input
          type="text"
          value={section.content.title || ''}
          onChange={(e) => updateContent('title', e.target.value)}
          placeholder="Build a funnel-based business"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sous-titre</label>
        <textarea
          value={section.content.subtitle || ''}
          onChange={(e) => updateContent('subtitle', e.target.value)}
          placeholder="Description complète"
          className={inputClass}
          rows={3}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Témoignages vidéo</label>
          <button
            type="button"
            onClick={addFeature}
            className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <div className="space-y-3">
          {features.map((feature: any, index: number) => (
            <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Témoignage {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <ImageUploadField
                  label="Vignette (thumbnail)"
                  value={feature.thumbnailUrl || ''}
                  onChange={(url) => updateFeature(index, 'thumbnailUrl', url)}
                  placeholder="URL de la vignette"
                />
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Vidéo (optionnel - remplace la vignette si fourni)
                  </label>
                  <ImageUploadField
                    label=""
                    value={feature.videoUrl || ''}
                    onChange={(url) => updateFeature(index, 'videoUrl', url)}
                    placeholder="URL de la vidéo MP4"
                    accept="video/*"
                  />
                </div>
                <input
                  type="text"
                  value={feature.quote || ''}
                  onChange={(e) => updateFeature(index, 'quote', e.target.value)}
                  placeholder="Citation"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={feature.author || ''}
                  onChange={(e) => updateFeature(index, 'author', e.target.value)}
                  placeholder="Nom de l'auteur"
                  className={inputClass}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Texte du bouton</label>
        <input
          type="text"
          value={section.content.buttonText || ''}
          onChange={(e) => updateContent('buttonText', e.target.value)}
          placeholder="Try ClickFunnels For Free"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Lien du bouton</label>
        <input
          type="text"
          value={section.content.buttonUrl || ''}
          onChange={(e) => updateContent('buttonUrl', e.target.value)}
          placeholder="#"
          className={inputClass}
        />
      </div>
    </div>
  );
}

export function ClickFunnelFooterContentEditor({ section, updateContent }: ContentEditorProps) {
  const columns = section.content.columns || [];

  const addColumn = () => {
    const newColumns = [
      ...columns,
      {
        title: 'Nouvelle colonne',
        links: [{ label: 'Lien 1', url: '#' }]
      }
    ];
    updateContent('columns', newColumns);
  };

  const updateColumn = (columnIndex: number, field: string, value: any) => {
    const newColumns = [...columns];
    newColumns[columnIndex] = { ...newColumns[columnIndex], [field]: value };
    updateContent('columns', newColumns);
  };

  const removeColumn = (columnIndex: number) => {
    const newColumns = columns.filter((_: any, i: number) => i !== columnIndex);
    updateContent('columns', newColumns);
  };

  const addLink = (columnIndex: number) => {
    const newColumns = [...columns];
    newColumns[columnIndex].links = [
      ...newColumns[columnIndex].links,
      { label: 'Nouveau lien', url: '#' }
    ];
    updateContent('columns', newColumns);
  };

  const updateLink = (columnIndex: number, linkIndex: number, field: string, value: string) => {
    const newColumns = [...columns];
    newColumns[columnIndex].links[linkIndex] = {
      ...newColumns[columnIndex].links[linkIndex],
      [field]: value
    };
    updateContent('columns', newColumns);
  };

  const removeLink = (columnIndex: number, linkIndex: number) => {
    const newColumns = [...columns];
    newColumns[columnIndex].links = newColumns[columnIndex].links.filter(
      (_: any, i: number) => i !== linkIndex
    );
    updateContent('columns', newColumns);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Texte du logo</label>
        <input
          type="text"
          value={section.content.logoText || ''}
          onChange={(e) => updateContent('logoText', e.target.value)}
          placeholder="ClickFunnels"
          className={inputClass}
        />
      </div>

      <ImageUploadField
        label="Logo (optionnel)"
        value={section.content.logo || ''}
        onChange={(url) => updateContent('logo', url)}
        placeholder="URL du logo"
      />

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Colonnes</label>
          <button
            type="button"
            onClick={addColumn}
            className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            Ajouter colonne
          </button>
        </div>

        <div className="space-y-4">
          {columns.map((column: any, columnIndex: number) => (
            <div key={columnIndex} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Colonne {columnIndex + 1}</span>
                <button
                  type="button"
                  onClick={() => removeColumn(columnIndex)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-3">
                <input
                  type="text"
                  value={column.title || ''}
                  onChange={(e) => updateColumn(columnIndex, 'title', e.target.value)}
                  placeholder="Titre de la colonne"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">Liens</label>
                  <button
                    type="button"
                    onClick={() => addLink(columnIndex)}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                  >
                    <Plus className="w-3 h-3" />
                    Ajouter lien
                  </button>
                </div>

                {column.links.map((link: any, linkIndex: number) => (
                  <div key={linkIndex} className="flex gap-2 items-start p-2 bg-white rounded border border-gray-200">
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={link.label || ''}
                        onChange={(e) => updateLink(columnIndex, linkIndex, 'label', e.target.value)}
                        placeholder="Texte du lien"
                        className={inputClass}
                      />
                      <input
                        type="text"
                        value={link.url || ''}
                        onChange={(e) => updateLink(columnIndex, linkIndex, 'url', e.target.value)}
                        placeholder="URL"
                        className={inputClass}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLink(columnIndex, linkIndex)}
                      className="text-red-600 hover:text-red-800 mt-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={section.content.showPrivacyChoices !== false}
            onChange={(e) => updateContent('showPrivacyChoices', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium text-gray-700">Afficher "Your Privacy Choices"</span>
        </label>

        {section.content.showPrivacyChoices !== false && (
          <input
            type="text"
            value={section.content.privacyChoicesText || ''}
            onChange={(e) => updateContent('privacyChoicesText', e.target.value)}
            placeholder="Your Privacy Choices"
            className={inputClass}
          />
        )}
      </div>
    </div>
  );
}

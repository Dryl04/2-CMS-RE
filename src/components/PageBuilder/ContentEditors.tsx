import { Plus, Trash2, GripVertical } from 'lucide-react';
import { PageBuilderSection } from '../../lib/pageBuilderTypes';
import ImageUploadField from './ImageUploadField';

const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent';
const labelClass = 'block text-sm font-medium text-gray-700 mb-2';

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
        <label className={labelClass}>Titre principal (H1)</label>
        <input
          type="text"
          value={section.content.headline || ''}
          onChange={(e) => updateContent('headline', e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>Sous-titre (H2)</label>
        <textarea
          value={section.content.subheadline || ''}
          onChange={(e) => updateContent('subheadline', e.target.value)}
          rows={3}
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
        <label className={labelClass}>Titre</label>
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
          placeholder="Texte"
        />
        <input
          type="text"
          value={section.content.primaryLink || ''}
          onChange={(e) => updateContent('primaryLink', e.target.value)}
          className={inputClass}
          placeholder="Lien"
        />
      </div>
      <div>
        <label className={labelClass}>Bouton secondaire</label>
        <input
          type="text"
          value={section.content.secondaryCta || ''}
          onChange={(e) => updateContent('secondaryCta', e.target.value)}
          className={`${inputClass} mb-2`}
          placeholder="Texte"
        />
        <input
          type="text"
          value={section.content.secondaryLink || ''}
          onChange={(e) => updateContent('secondaryLink', e.target.value)}
          className={inputClass}
          placeholder="Lien"
        />
      </div>
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
          placeholder="Texte du bouton"
        />
        <input
          type="text"
          value={section.content.ctaLink || ''}
          onChange={(e) => updateContent('ctaLink', e.target.value)}
          className={inputClass}
          placeholder="Lien du bouton"
        />
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
              <select
                value={feature.icon || 'zap'}
                onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                className={inputClass}
              >
                {FEATURE_ICONS.map((icon) => (
                  <option key={icon.id} value={icon.id}>{icon.label}</option>
                ))}
              </select>
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
              <input
                type="text"
                value={t.avatar || ''}
                onChange={(e) => updateTestimonial(index, 'avatar', e.target.value)}
                className={inputClass}
                placeholder="URL de l'avatar"
              />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Note</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => updateTestimonial(index, 'rating', star)}
                      className={`w-7 h-7 rounded text-sm font-medium transition-colors ${
                        star <= (t.rating || 0)
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

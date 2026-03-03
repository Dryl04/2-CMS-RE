import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageBuilderSection } from '@/lib/pageBuilderTypes';
import { getWidgetFieldLabel } from '@/lib/widgetFieldLabels';
import ImageUploadField from './ImageUploadField';
import { LinkInputField } from '@/components/common/LinkInputField';
import { RichTextArea } from '@/components/common/RichTextArea';
import IconPicker from './IconPicker';

const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-transparent';
const labelClass = 'block text-sm font-medium text-gray-700 mb-2';
const LABELS = {
  title: getWidgetFieldLabel('title') || 'Titre principal',
  subtitle: getWidgetFieldLabel('subtitle') || 'Sous-titre',
  headline: getWidgetFieldLabel('headline') || 'Titre principal',
  ctaText: getWidgetFieldLabel('ctaText') || 'Texte bouton principal',
  ctaLink: getWidgetFieldLabel('ctaLink') || 'Lien bouton principal',
};

const SOCIAL_PLATFORMS = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'twitter', label: 'Twitter / X' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'youtube', label: 'YouTube' },
];

interface ContentEditorProps {
  section: PageBuilderSection;
  updateContent: (key: string, value: any) => void;
}

export function PricingContentEditor({ section, updateContent }: ContentEditorProps) {
  const plans = section.content.plans || [];

  const updatePlan = (index: number, field: string, value: any) => {
    const updated = [...plans];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('plans', updated);
  };

  const updatePlanFeatures = (planIndex: number, featureIndex: number, value: string) => {
    const updated = [...plans];
    const features = [...(updated[planIndex].features || [])];
    features[featureIndex] = value;
    updated[planIndex] = { ...updated[planIndex], features };
    updateContent('plans', updated);
  };

  const addPlanFeature = (planIndex: number) => {
    const updated = [...plans];
    updated[planIndex] = { ...updated[planIndex], features: [...(updated[planIndex].features || []), 'Nouvelle fonctionnalite'] };
    updateContent('plans', updated);
  };

  const removePlanFeature = (planIndex: number, featureIndex: number) => {
    const updated = [...plans];
    updated[planIndex] = { ...updated[planIndex], features: (updated[planIndex].features || []).filter((_: any, i: number) => i !== featureIndex) };
    updateContent('plans', updated);
  };

  const addPlan = () => {
    updateContent('plans', [...plans, { name: 'New Plan', price: '$0', period: '/month', features: ['Feature 1'], popular: false }]);
  };

  const removePlan = (index: number) => {
    updateContent('plans', plans.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={2}
      />

      <div>
        <label className={labelClass}>Plans tarifaires</label>
        <div className="space-y-3">
          {plans.map((plan: any, planIndex: number) => (
            <div key={planIndex} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Plan {planIndex + 1}</span>
                <button onClick={() => removePlan(planIndex)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input type="text" value={plan.name || ''} onChange={(e) => updatePlan(planIndex, 'name', e.target.value)} className={inputClass} placeholder="Nom du plan" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={plan.price || ''} onChange={(e) => updatePlan(planIndex, 'price', e.target.value)} className={inputClass} placeholder="Prix (ex: $29)" />
                <input type="text" value={plan.period || ''} onChange={(e) => updatePlan(planIndex, 'period', e.target.value)} className={inputClass} placeholder="/month" />
              </div>
              <input type="text" value={plan.buttonText || ''} onChange={(e) => updatePlan(planIndex, 'buttonText', e.target.value)} className={inputClass} placeholder="Texte du bouton (ex: Get Started)" />
              <LinkInputField
                label="Lien du bouton"
                value={plan.buttonLink || ''}
                onChange={(val) => updatePlan(planIndex, 'buttonLink', val)}
              />
              <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={plan.popular === true} onChange={(e) => updatePlan(planIndex, 'popular', e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                <span>Plan populaire</span>
              </label>
              <div className="pl-3 border-l-2 border-gray-200 space-y-1.5">
                <span className="text-xs font-medium text-gray-500">Fonctionnalites</span>
                {(plan.features || []).map((feat: string, fIndex: number) => (
                  <div key={fIndex} className="flex items-center gap-1">
                    <input type="text" value={feat} onChange={(e) => updatePlanFeatures(planIndex, fIndex, e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent" placeholder="Fonctionnalite" />
                    <button onClick={() => removePlanFeature(planIndex, fIndex)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded flex-shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button onClick={() => addPlanFeature(planIndex)} className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700">
                  <Plus className="w-3 h-3" /><span>Ajouter</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addPlan} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter un plan</span>
        </button>
      </div>
    </div>
  );
}

export function StatsContentEditor({ section, updateContent }: ContentEditorProps) {
  const stats = section.content.stats || [];

  const updateStat = (index: number, field: string, value: string) => {
    const updated = [...stats];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('stats', updated);
  };

  const addStat = () => {
    updateContent('stats', [...stats, { number: '0', label: 'Statistique', suffix: '' }]);
  };

  const removeStat = (index: number) => {
    updateContent('stats', stats.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <div>
        <label className={labelClass}>Statistiques</label>
        <div className="space-y-2">
          {stats.map((stat: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">#{index + 1}</span>
                <button onClick={() => removeStat(index)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input type="text" value={stat.number || ''} onChange={(e) => updateStat(index, 'number', e.target.value)} className={inputClass} placeholder="Valeur (ex: 10K+)" />
              <input type="text" value={stat.label || ''} onChange={(e) => updateStat(index, 'label', e.target.value)} className={inputClass} placeholder="Label (ex: Clients actifs)" />
            </div>
          ))}
        </div>
        <button onClick={addStat} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter une statistique</span>
        </button>
      </div>
    </div>
  );
}

export function TeamContentEditor({ section, updateContent }: ContentEditorProps) {
  const members = section.content.members || [];

  const updateMember = (index: number, field: string, value: any) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('members', updated);
  };

  const updateMemberSocial = (index: number, field: string, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], social: { ...(updated[index].social || {}), [field]: value } };
    updateContent('members', updated);
  };

  const addMember = () => {
    updateContent('members', [...members, { name: 'Nouveau membre', role: 'Role', bio: '', avatar: '', social: { linkedin: '#', twitter: '#', email: '' } }]);
  };

  const removeMember = (index: number) => {
    updateContent('members', members.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={2}
      />
      <div>
        <label className={labelClass}>Membres</label>
        <div className="space-y-3">
          {members.map((member: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Membre {index + 1}</span>
                <button onClick={() => removeMember(index)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input type="text" value={member.name || ''} onChange={(e) => updateMember(index, 'name', e.target.value)} className={inputClass} placeholder="Nom complet" />
              <input type="text" value={member.role || ''} onChange={(e) => updateMember(index, 'role', e.target.value)} className={inputClass} placeholder="Poste / Role" />
              <textarea value={member.bio || ''} onChange={(e) => updateMember(index, 'bio', e.target.value)} rows={2} className={inputClass} placeholder="Biographie courte" />
              <ImageUploadField label="Photo" value={member.avatar || ''} onChange={(url) => updateMember(index, 'avatar', url)} placeholder="URL de la photo" />
              <details className="mt-1">
                <summary className="text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-800 select-none py-1 list-none flex items-center gap-1">
                  <span className="text-gray-400">▸</span> Overlay image décoratif
                </summary>
                <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-200">
                  <ImageUploadField
                    label="Image overlay"
                    value={member.overlayImage || ''}
                    onChange={(url) => updateMember(index, 'overlayImage', url)}
                    placeholder="URL de l'image overlay"
                  />
                  {member.overlayImage && (
                    <>
                      <div>
                        <label className={labelClass}>Position</label>
                        <select
                          value={member.overlayPosition || 'center'}
                          onChange={(e) => updateMember(index, 'overlayPosition', e.target.value)}
                          className={inputClass}
                        >
                          <option value="top-left">Haut gauche</option>
                          <option value="top-right">Haut droite</option>
                          <option value="bottom-left">Bas gauche</option>
                          <option value="bottom-right">Bas droite</option>
                          <option value="center">Centre</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Taille ({member.overlaySize || '500px'})</label>
                        <input
                          type="range"
                          min="32"
                          max="1500"
                          step="10"
                          value={parseInt(member.overlaySize) || 500}
                          onChange={(e) => updateMember(index, 'overlaySize', `${e.target.value}px`)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Opacité ({Math.round((member.overlayOpacity ?? 1) * 100)}%)</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={Math.round((member.overlayOpacity ?? 1) * 100)}
                          onChange={(e) => updateMember(index, 'overlayOpacity', parseInt(e.target.value) / 100)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Luminosité ({Math.round((member.overlayBrightness ?? 1) * 100)}%)</label>
                        <input
                          type="range"
                          min="0"
                          max="500"
                          step="5"
                          value={Math.round((member.overlayBrightness ?? 1) * 100)}
                          onChange={(e) => updateMember(index, 'overlayBrightness', parseInt(e.target.value) / 100)}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>
              </details>
              <div className="pl-3 border-l-2 border-gray-200 space-y-1.5">
                <span className="text-xs font-medium text-gray-500">Reseaux sociaux</span>
                <input type="text" value={member.social?.linkedin || ''} onChange={(e) => updateMemberSocial(index, 'linkedin', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent" placeholder="LinkedIn URL" />
                <input type="text" value={member.social?.twitter || ''} onChange={(e) => updateMemberSocial(index, 'twitter', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent" placeholder="Twitter URL" />
                <input type="email" value={member.social?.email || ''} onChange={(e) => updateMemberSocial(index, 'email', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent" placeholder="Email" />
              </div>
            </div>
          ))}
        </div>
        <button onClick={addMember} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter un membre</span>
        </button>
      </div>
    </div>
  );
}

export function FAQContentEditor({ section, updateContent }: ContentEditorProps) {
  const faqs = section.content.faqs || [];

  const updateFAQ = (index: number, field: string, value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('faqs', updated);
  };

  const addFAQ = () => {
    updateContent('faqs', [...faqs, { question: 'Nouvelle question ?', answer: 'Reponse a la question.' }]);
  };

  const removeFAQ = (index: number) => {
    updateContent('faqs', faqs.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <div>
        <label className={labelClass}>Questions / Reponses</label>
        <div className="space-y-3">
          {faqs.map((faq: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">#{index + 1}</span>
                <button onClick={() => removeFAQ(index)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input type="text" value={faq.question || ''} onChange={(e) => updateFAQ(index, 'question', e.target.value)} className={inputClass} placeholder="Question" />
              <textarea value={faq.answer || ''} onChange={(e) => updateFAQ(index, 'answer', e.target.value)} rows={3} className={inputClass} placeholder="Reponse" />
            </div>
          ))}
        </div>
        <button onClick={addFAQ} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter une question</span>
        </button>
      </div>
    </div>
  );
}

export function LogoCloudContentEditor({ section, updateContent }: ContentEditorProps) {
  const logos = section.content.logos || [];

  const updateLogo = (index: number, field: string, value: string) => {
    const updated = [...logos];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('logos', updated);
  };

  const addLogo = () => {
    updateContent('logos', [...logos, { name: 'Entreprise', url: '' }]);
  };

  const removeLogo = (index: number) => {
    updateContent('logos', logos.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <div>
        <label className={labelClass}>Logos partenaires</label>
        <div className="space-y-2">
          {logos.map((logo: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Logo {index + 1}</span>
                <button onClick={() => removeLogo(index)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input type="text" value={logo.name || ''} onChange={(e) => updateLogo(index, 'name', e.target.value)} className={inputClass} placeholder="Nom de l'entreprise" />
              <ImageUploadField label="Logo" value={logo.url || ''} onChange={(url) => updateLogo(index, 'url', url)} placeholder="URL du logo" />
            </div>
          ))}
        </div>
        <button onClick={addLogo} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter un logo</span>
        </button>
      </div>
    </div>
  );
}

export function VideoHeroContentEditor({ section, updateContent }: ContentEditorProps) {
  return (
    <div className="space-y-4">
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={2}
      />
      <div>
        <label className={labelClass}>Position du texte</label>
        <select
          value={section.content.textPosition || 'center'}
          onChange={(e) => updateContent('textPosition', e.target.value)}
          className={inputClass}
        >
          <option value="top">Haut</option>
          <option value="center">Centré</option>
          <option value="bottom">Bas</option>
        </select>
      </div>
      <ImageUploadField
        label="URL de la video"
        value={section.content.videoUrl || ''}
        onChange={(url) => updateContent('videoUrl', url)}
        placeholder="https://youtube.com/watch?v=... ou vidéo mp4"
        mediaType="video"
      />
      <ImageUploadField label="Image de vignette" value={section.content.thumbnail || ''} onChange={(url) => updateContent('thumbnail', url)} placeholder="URL de la vignette" />
      <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
        <input
          type="checkbox"
          checked={section.content.autoplay !== false}
          onChange={(e) => updateContent('autoplay', e.target.checked)}
          className="w-4 h-4 rounded border-gray-300"
        />
        <span>Lecture automatique</span>
      </label>
      <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700">
        <input
          type="checkbox"
          checked={section.content.videoOverlayEnabled !== false}
          onChange={(e) => updateContent('videoOverlayEnabled', e.target.checked)}
          className="w-4 h-4 rounded border-gray-300"
        />
        <span>Activer la superposition couleur</span>
      </label>
      {section.content.videoOverlayEnabled !== false && (
        <>
          <div>
            <label className={labelClass}>Couleur de superposition vidéo</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={section.content.videoOverlayColor || '#000000'}
                onChange={(e) => updateContent('videoOverlayColor', e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={section.content.videoOverlayColor || ''}
                onChange={(e) => updateContent('videoOverlayColor', e.target.value)}
                className={inputClass}
                placeholder="Ex: #000000 (vide = noir 50%)"
              />
              {section.content.videoOverlayColor && (
                <button
                  onClick={() => updateContent('videoOverlayColor', '')}
                  className="text-xs text-gray-400 hover:text-red-500"
                >✕</button>
              )}
            </div>
          </div>
          <div>
            <label className={labelClass}>
              Opacité superposition ({Math.round((section.content.videoOverlayOpacity ?? 0.5) * 100)}%)
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={Math.round((section.content.videoOverlayOpacity ?? 0.5) * 100)}
              onChange={(e) => updateContent('videoOverlayOpacity', parseInt(e.target.value) / 100)}
              className="w-full"
            />
          </div>
        </>
      )}
      <div>
        <label className={labelClass}>{LABELS.ctaText}</label>
        <input type="text" value={section.content.ctaText || ''} onChange={(e) => updateContent('ctaText', e.target.value)} className={inputClass} />
      </div>
      <LinkInputField
        label={LABELS.ctaLink}
        value={section.content.ctaLink || ''}
        onChange={(val) => updateContent('ctaLink', val)}
      />
    </div>
  );
}

export function GalleryContentEditor({ section, updateContent }: ContentEditorProps) {
  const items = section.content.items || [];

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('items', updated);
  };

  const addItem = () => {
    updateContent('items', [...items, { image: '', title: 'Nouveau projet', category: 'Design', link: '#' }]);
  };

  const removeItem = (index: number) => {
    updateContent('items', items.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <div>
        <label className={labelClass}>Images</label>
        <div className="space-y-3">
          {items.map((item: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">#{index + 1}</span>
                <button onClick={() => removeItem(index)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <ImageUploadField label="Image" value={item.image || ''} onChange={(url) => updateItem(index, 'image', url)} placeholder="URL de l'image" />
              <input type="text" value={item.title || ''} onChange={(e) => updateItem(index, 'title', e.target.value)} className={inputClass} placeholder="Titre du projet" />
              <input type="text" value={item.category || ''} onChange={(e) => updateItem(index, 'category', e.target.value)} className={inputClass} placeholder="Categorie" />
              <input type="text" value={item.link || ''} onChange={(e) => updateItem(index, 'link', e.target.value)} className={inputClass} placeholder="Lien" />
              <details className="mt-1">
                <summary className="text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-800 select-none py-1 list-none flex items-center gap-1">
                  <span className="text-gray-400">▸</span> Overlay image décoratif
                </summary>
                <div className="mt-2 space-y-2 pl-2 border-l-2 border-gray-200">
                  <ImageUploadField
                    label="Image overlay"
                    value={item.overlayImage || ''}
                    onChange={(url) => updateItem(index, 'overlayImage', url)}
                    placeholder="URL de l'image overlay"
                  />
                  {item.overlayImage && (
                    <>
                      <div>
                        <label className={labelClass}>Position</label>
                        <select
                          value={item.overlayPosition || 'center'}
                          onChange={(e) => updateItem(index, 'overlayPosition', e.target.value)}
                          className={inputClass}
                        >
                          <option value="top-left">Haut gauche</option>
                          <option value="top-right">Haut droite</option>
                          <option value="bottom-left">Bas gauche</option>
                          <option value="bottom-right">Bas droite</option>
                          <option value="center">Centre</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Taille ({item.overlaySize || '500px'})</label>
                        <input
                          type="range"
                          min="32"
                          max="1500"
                          step="10"
                          value={parseInt(item.overlaySize) || 500}
                          onChange={(e) => updateItem(index, 'overlaySize', `${e.target.value}px`)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Opacité ({Math.round((item.overlayOpacity ?? 1) * 100)}%)</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={Math.round((item.overlayOpacity ?? 1) * 100)}
                          onChange={(e) => updateItem(index, 'overlayOpacity', parseInt(e.target.value) / 100)}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Luminosité ({Math.round((item.overlayBrightness ?? 1) * 100)}%)</label>
                        <input
                          type="range"
                          min="0"
                          max="500"
                          step="5"
                          value={Math.round((item.overlayBrightness ?? 1) * 100)}
                          onChange={(e) => updateItem(index, 'overlayBrightness', parseInt(e.target.value) / 100)}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>
              </details>
            </div>
          ))}
        </div>
        <button onClick={addItem} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter une image</span>
        </button>
      </div>
    </div>
  );
}

export function TimelineContentEditor({ section, updateContent }: ContentEditorProps) {
  const events = section.content.events || [];

  const updateEvent = (index: number, field: string, value: string) => {
    const updated = [...events];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('events', updated);
  };

  const addEvent = () => {
    updateContent('events', [...events, { date: '2024', title: 'Nouvel evenement', description: 'Description', image: '' }]);
  };

  const removeEvent = (index: number) => {
    updateContent('events', events.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <div>
        <label className={labelClass}>Evenements</label>
        <div className="space-y-3">
          {events.map((event: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">#{index + 1}</span>
                <button onClick={() => removeEvent(index)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input type="text" value={event.date || ''} onChange={(e) => updateEvent(index, 'date', e.target.value)} className={inputClass} placeholder="Date (ex: 2024)" />
              <input type="text" value={event.title || ''} onChange={(e) => updateEvent(index, 'title', e.target.value)} className={inputClass} placeholder="Titre" />
              <textarea value={event.description || ''} onChange={(e) => updateEvent(index, 'description', e.target.value)} rows={2} className={inputClass} placeholder="Description" />
              <ImageUploadField label="Image (optionnel)" value={event.image || ''} onChange={(url) => updateEvent(index, 'image', url)} placeholder="URL de l'image" />
            </div>
          ))}
        </div>
        <button onClick={addEvent} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter un evenement</span>
        </button>
      </div>
    </div>
  );
}

export function NewsletterContentEditor({ section, updateContent }: ContentEditorProps) {
  return (
    <div className="space-y-4">
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={2}
      />
      <div>
        <label className={labelClass}>Placeholder du champ email</label>
        <input type="text" value={section.content.placeholder || ''} onChange={(e) => updateContent('placeholder', e.target.value)} className={inputClass} placeholder="Entrez votre email" />
      </div>
      <div>
        <label className={labelClass}>Texte du bouton</label>
        <input type="text" value={section.content.buttonText || ''} onChange={(e) => updateContent('buttonText', e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Note confidentialite</label>
        <input type="text" value={section.content.privacyNote || ''} onChange={(e) => updateContent('privacyNote', e.target.value)} className={inputClass} placeholder="Nous respectons votre vie privee." />
      </div>
      <ImageUploadField label="Image (optionnel)" value={section.content.image || ''} onChange={(url) => updateContent('image', url)} placeholder="URL de l'image" />
    </div>
  );
}

export function ProcessContentEditor({ section, updateContent }: ContentEditorProps) {
  const steps = section.content.steps || [];

  const updateStep = (index: number, field: string, value: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('steps', updated);
  };

  const addStep = () => {
    updateContent('steps', [...steps, { number: String(steps.length + 1).padStart(2, '0'), title: 'Nouvelle etape', description: 'Description de l etape', image: '' }]);
  };

  const removeStep = (index: number) => {
    updateContent('steps', steps.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <div>
        <label className={labelClass}>Etapes</label>
        <div className="space-y-2">
          {steps.map((step: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Etape {index + 1}</span>
                <button onClick={() => removeStep(index)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input type="text" value={step.number || ''} onChange={(e) => updateStep(index, 'number', e.target.value)} className={inputClass} placeholder="Numero (ex: 01)" />
              <input type="text" value={step.title || ''} onChange={(e) => updateStep(index, 'title', e.target.value)} className={inputClass} placeholder="Titre de l'etape" />
              <textarea value={step.description || ''} onChange={(e) => updateStep(index, 'description', e.target.value)} rows={2} className={inputClass} placeholder="Description" />
              <ImageUploadField
                label="Image"
                value={step.image || ''}
                onChange={(url) => updateStep(index, 'image', url)}
                placeholder="URL de l'image"
              />
            </div>
          ))}
        </div>
        <button onClick={addStep} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter une etape</span>
        </button>
      </div>
    </div>
  );
}

export function ServicesGridContentEditor({ section, updateContent }: ContentEditorProps) {
  const services = section.content.services || [];

  const updateService = (index: number, field: string, value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('services', updated);
  };

  const addService = () => {
    updateContent('services', [...services, { icon: 'zap', title: 'Nouveau service', description: 'Description', link: '#', linkText: 'En savoir plus' }]);
  };

  const removeService = (index: number) => {
    updateContent('services', services.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Description"
        value={section.content.description || ''}
        onChange={(val) => updateContent('description', val)}
        rows={3}
      />
      <div>
        <label className={labelClass}>Services</label>
        <div className="space-y-3">
          {services.map((service: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Service {index + 1}</span>
                <button onClick={() => removeService(index)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <IconPicker value={service.icon || 'zap'} onChange={(val) => updateService(index, 'icon', val)} />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Taille icone ({service.iconSize || 28}px)</label>
                <input type="range" min="16" max="80" step="4" value={service.iconSize || 28} onChange={(e) => updateService(index, 'iconSize', parseInt(e.target.value))} className="w-full" />
              </div>
              <input type="text" value={service.title || ''} onChange={(e) => updateService(index, 'title', e.target.value)} className={inputClass} placeholder="Titre du service" />
              <textarea value={service.description || ''} onChange={(e) => updateService(index, 'description', e.target.value)} rows={2} className={inputClass} placeholder="Description" />
              <div className="flex gap-2">
                <input type="text" value={service.linkText || ''} onChange={(e) => updateService(index, 'linkText', e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent" placeholder="Texte du lien" />
                <input type="text" value={service.link || ''} onChange={(e) => updateService(index, 'link', e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent" placeholder="URL" />
              </div>
            </div>
          ))}
        </div>
        <button onClick={addService} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter un service</span>
        </button>
      </div>
    </div>
  );
}

export function ContactSplitContentEditor({ section, updateContent }: ContentEditorProps) {
  return (
    <div className="space-y-4">
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Description"
        value={section.content.description || ''}
        onChange={(val) => updateContent('description', val)}
        rows={3}
      />
      <div>
        <label className={labelClass}>Telephone</label>
        <input type="text" value={section.content.phone || ''} onChange={(e) => updateContent('phone', e.target.value)} className={inputClass} placeholder="+33 1 23 45 67 89" />
      </div>
      <div>
        <label className={labelClass}>Adresse</label>
        <textarea value={section.content.address || ''} onChange={(e) => updateContent('address', e.target.value)} rows={2} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input type="email" value={section.content.email || ''} onChange={(e) => updateContent('email', e.target.value)} className={inputClass} placeholder="contact@example.com" />
      </div>
      <div>
        <label className={labelClass}>Titre du formulaire</label>
        <input type="text" value={section.content.formTitle || ''} onChange={(e) => updateContent('formTitle', e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Description du formulaire</label>
        <textarea value={section.content.formDescription || ''} onChange={(e) => updateContent('formDescription', e.target.value)} rows={2} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Texte du bouton</label>
        <input type="text" value={section.content.buttonText || ''} onChange={(e) => updateContent('buttonText', e.target.value)} className={inputClass} />
      </div>
    </div>
  );
}

export function FeedbackContactContentEditor({ section, updateContent }: ContentEditorProps) {
  return (
    <div className="space-y-4">
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Description"
        value={section.content.description || ''}
        onChange={(val) => updateContent('description', val)}
        rows={3}
      />
      <div>
        <label className={labelClass}>Texte du lien CTA</label>
        <input type="text" value={section.content.ctaText || ''} onChange={(e) => updateContent('ctaText', e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Titre du formulaire</label>
        <input type="text" value={section.content.formTitle || ''} onChange={(e) => updateContent('formTitle', e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Description du formulaire</label>
        <textarea value={section.content.formDescription || ''} onChange={(e) => updateContent('formDescription', e.target.value)} rows={2} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Texte du bouton</label>
        <input type="text" value={section.content.buttonText || ''} onChange={(e) => updateContent('buttonText', e.target.value)} className={inputClass} />
      </div>
    </div>
  );
}

export function ServicesCardsContentEditor({ section, updateContent }: ContentEditorProps) {
  const services = section.content.services || [];

  const updateService = (index: number, field: string, value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('services', updated);
  };

  const addService = () => {
    updateContent('services', [...services, { icon: 'zap', title: 'Nouveau service', description: 'Description', image: '', link: '#', linkText: 'En savoir plus' }]);
  };

  const removeService = (index: number) => {
    updateContent('services', services.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Description"
        value={section.content.description || ''}
        onChange={(val) => updateContent('description', val)}
        rows={2}
      />
      <div>
        <label className={labelClass}>Texte du bouton CTA</label>
        <input type="text" value={section.content.ctaText || ''} onChange={(e) => updateContent('ctaText', e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Services</label>
        <div className="space-y-3">
          {services.map((service: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Service {index + 1}</span>
                <button onClick={() => removeService(index)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <IconPicker value={service.icon || 'zap'} onChange={(val) => updateService(index, 'icon', val)} />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Taille icone ({service.iconSize || 32}px)</label>
                <input type="range" min="16" max="80" step="4" value={service.iconSize || 32} onChange={(e) => updateService(index, 'iconSize', parseInt(e.target.value))} className="w-full" />
              </div>
              <input type="text" value={service.title || ''} onChange={(e) => updateService(index, 'title', e.target.value)} className={inputClass} placeholder="Titre" />
              <textarea value={service.description || ''} onChange={(e) => updateService(index, 'description', e.target.value)} rows={2} className={inputClass} placeholder="Description" />
              <ImageUploadField label="Image" value={service.image || ''} onChange={(url) => updateService(index, 'image', url)} placeholder="URL de l'image" />
              <div className="flex gap-2">
                <input type="text" value={service.linkText || ''} onChange={(e) => updateService(index, 'linkText', e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent" placeholder="Texte lien" />
                <input type="text" value={service.link || ''} onChange={(e) => updateService(index, 'link', e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent" placeholder="URL" />
              </div>
            </div>
          ))}
        </div>
        <button onClick={addService} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter un service</span>
        </button>
      </div>
    </div>
  );
}

export function EditorialCardsContentEditor({ section, updateContent }: ContentEditorProps) {
  const cards = section.content.cards || [];

  const updateCard = (index: number, field: string, value: string) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('cards', updated);
  };

  const addCard = () => {
    updateContent('cards', [...cards, { title: 'Nouveau titre', description: '', meta: '', image: '' }]);
  };

  const removeCard = (index: number) => {
    updateContent('cards', cards.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <div>
        <label className={labelClass}>Texte du bouton "Voir tout"</label>
        <input type="text" value={section.content.ctaText || ''} onChange={(e) => updateContent('ctaText', e.target.value)} className={inputClass} />
      </div>
      <LinkInputField
        label='Lien "Voir tout"'
        value={section.content.ctaLink || ''}
        onChange={(val) => updateContent('ctaLink', val)}
      />
      <div>
        <label className={labelClass}>Cartes</label>
        <div className="space-y-3">
          {cards.map((card: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Carte {index + 1}</span>
                <button onClick={() => removeCard(index)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <ImageUploadField label="Image" value={card.image || ''} onChange={(url) => updateCard(index, 'image', url)} placeholder="URL de l'image" />
              <input type="text" value={card.title || ''} onChange={(e) => updateCard(index, 'title', e.target.value)} className={inputClass} placeholder="Titre" />
              <textarea value={card.description || ''} onChange={(e) => updateCard(index, 'description', e.target.value)} rows={2} className={inputClass} placeholder="Description" />
              <input type="text" value={card.meta || ''} onChange={(e) => updateCard(index, 'meta', e.target.value)} className={inputClass} placeholder="Meta (ex: 12 Janvier 2024)" />
            </div>
          ))}
        </div>
        <button onClick={addCard} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter une carte</span>
        </button>
      </div>
    </div>
  );
}

export function MinimalCTAContentEditor({ section, updateContent }: ContentEditorProps) {
  return (
    <div className="space-y-4">
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <div>
        <label className={labelClass}>Bouton principal</label>
        <input type="text" value={section.content.primaryText || ''} onChange={(e) => updateContent('primaryText', e.target.value)} className={`${inputClass} mb-2`} placeholder="Texte" />
        <LinkInputField
          value={section.content.primaryLink || ''}
          onChange={(val) => updateContent('primaryLink', val)}
        />
      </div>
      <div>
        <label className={labelClass}>Bouton secondaire</label>
        <input type="text" value={section.content.secondaryText || ''} onChange={(e) => updateContent('secondaryText', e.target.value)} className={`${inputClass} mb-2`} placeholder="Texte" />
        <LinkInputField
          value={section.content.secondaryLink || ''}
          onChange={(val) => updateContent('secondaryLink', val)}
        />
      </div>
    </div>
  );
}

export function CinematicFooterContentEditor({ section, updateContent }: ContentEditorProps) {
  const columns = section.content.columns || [];
  const socials = section.content.socials || [];

  const updateColumn = (colIndex: number, field: string, value: any) => {
    const updated = [...columns];
    updated[colIndex] = { ...updated[colIndex], [field]: value };
    updateContent('columns', updated);
  };

  const addColumn = () => {
    updateContent('columns', [...columns, { title: 'Colonne', links: [{ label: 'Lien', url: '#' }] }]);
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
    updated[colIndex] = { ...updated[colIndex], links: [...(updated[colIndex].links || []), { label: 'Nouveau lien', url: '#' }] };
    updateContent('columns', updated);
  };

  const removeColumnLink = (colIndex: number, linkIndex: number) => {
    const updated = [...columns];
    updated[colIndex] = { ...updated[colIndex], links: (updated[colIndex].links || []).filter((_: any, i: number) => i !== linkIndex) };
    updateContent('columns', updated);
  };

  const updateSocial = (index: number, field: string, value: string) => {
    const updated = [...socials];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('socials', updated);
  };

  const addSocial = () => {
    updateContent('socials', [...socials, { platform: 'facebook', url: '#' }]);
  };

  const removeSocial = (index: number) => {
    updateContent('socials', socials.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Nom de la marque</label>
        <input type="text" value={section.content.brand || ''} onChange={(e) => updateContent('brand', e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Copyright</label>
        <input type="text" value={section.content.copyright || ''} onChange={(e) => updateContent('copyright', e.target.value)} className={inputClass} placeholder="Copyright © 2026" />
      </div>
      <ImageUploadField label="Image de fond (optionnel)" value={section.content.backgroundImage || ''} onChange={(url) => updateContent('backgroundImage', url)} placeholder="URL de l'image de fond" />

      <div>
        <label className={labelClass}>Reseaux sociaux</label>
        <div className="space-y-2">
          {socials.map((social: any, index: number) => (
            <div key={index} className="flex items-center gap-1.5">
              <select value={social.platform || 'facebook'} onChange={(e) => updateSocial(index, 'platform', e.target.value)} className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent">
                {SOCIAL_PLATFORMS.map((p) => (<option key={p.id} value={p.id}>{p.label}</option>))}
              </select>
              <input type="text" value={social.url || ''} onChange={(e) => updateSocial(index, 'url', e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent" placeholder="URL" />
              <button onClick={() => removeSocial(index)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button onClick={addSocial} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter un reseau</span>
        </button>
      </div>

      <div>
        <label className={labelClass}>Colonnes de liens</label>
        <div className="space-y-3">
          {columns.map((col: any, colIndex: number) => (
            <div key={colIndex} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Colonne {colIndex + 1}</span>
                <button onClick={() => removeColumn(colIndex)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input type="text" value={col.title || ''} onChange={(e) => updateColumn(colIndex, 'title', e.target.value)} className={inputClass} placeholder="Titre de la colonne" />
              <div className="pl-3 border-l-2 border-gray-200 space-y-1.5">
                {(col.links || []).map((link: any, linkIndex: number) => (
                  <div key={linkIndex} className="flex items-center gap-1">
                    <div className="flex-1 flex gap-1">
                      <input type="text" value={link.label || ''} onChange={(e) => updateColumnLink(colIndex, linkIndex, 'label', e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent" placeholder="Label" />
                      <input type="text" value={link.url || ''} onChange={(e) => updateColumnLink(colIndex, linkIndex, 'url', e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent" placeholder="URL" />
                    </div>
                    <button onClick={() => removeColumnLink(colIndex, linkIndex)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded flex-shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button onClick={() => addColumnLink(colIndex)} className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700">
                  <Plus className="w-3 h-3" /><span>Ajouter un lien</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addColumn} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter une colonne</span>
        </button>
      </div>
    </div>
  );
}

export function SocialFollowContentEditor({ section, updateContent }: ContentEditorProps) {
  const platforms = section.content.platforms || [];

  const updatePlatform = (index: number, field: string, value: string) => {
    const updated = [...platforms];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('platforms', updated);
  };

  const addPlatform = () => {
    updateContent('platforms', [...platforms, { platform: 'instagram', handle: '@votrecompte', url: '#', followers: '' }]);
  };

  const removePlatform = (index: number) => {
    updateContent('platforms', platforms.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <div>
        <label className={labelClass}>Plateformes</label>
        <div className="space-y-3">
          {platforms.map((platform: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Plateforme {index + 1}</span>
                <button onClick={() => removePlatform(index)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <select value={platform.platform || 'instagram'} onChange={(e) => updatePlatform(index, 'platform', e.target.value)} className={inputClass}>
                {SOCIAL_PLATFORMS.map((p) => (<option key={p.id} value={p.id}>{p.label}</option>))}
              </select>
              <input type="text" value={platform.handle || ''} onChange={(e) => updatePlatform(index, 'handle', e.target.value)} className={inputClass} placeholder="@votrecompte" />
              <input type="text" value={platform.followers || ''} onChange={(e) => updatePlatform(index, 'followers', e.target.value)} className={inputClass} placeholder="Nb abonnes (ex: 12.5K)" />
              <input type="text" value={platform.url || ''} onChange={(e) => updatePlatform(index, 'url', e.target.value)} className={inputClass} placeholder="URL du profil" />
            </div>
          ))}
        </div>
        <button onClick={addPlatform} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter une plateforme</span>
        </button>
      </div>
    </div>
  );
}

export function NewsletterSignupContentEditor({ section, updateContent }: ContentEditorProps) {
  return (
    <div className="space-y-4">
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={2}
      />
      <div>
        <label className={labelClass}>Placeholder email</label>
        <input type="text" value={section.content.placeholder || ''} onChange={(e) => updateContent('placeholder', e.target.value)} className={inputClass} placeholder="Votre adresse email" />
      </div>
      <div>
        <label className={labelClass}>Texte du bouton</label>
        <input type="text" value={section.content.buttonText || ''} onChange={(e) => updateContent('buttonText', e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Note de confidentialite</label>
        <input type="text" value={section.content.privacyNote || ''} onChange={(e) => updateContent('privacyNote', e.target.value)} className={inputClass} />
      </div>
    </div>
  );
}

export function SimpleHeroContentEditor({ section, updateContent }: ContentEditorProps) {
  return (
    <div className="space-y-4">
      <RichTextArea
        label="Sous-titre H2"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Titre principal H1"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Description"
        value={section.content.description || ''}
        onChange={(val) => updateContent('description', val)}
        rows={3}
      />
      <div>
        <label className={labelClass}>Bouton principal</label>
        <input type="text" value={section.content.ctaText || ''} onChange={(e) => updateContent('ctaText', e.target.value)} className={`${inputClass} mb-2`} placeholder="Texte" />
        <LinkInputField
          value={section.content.ctaLink || ''}
          onChange={(val) => updateContent('ctaLink', val)}
        />
      </div>
      <div>
        <label className={labelClass}>Bouton secondaire (optionnel)</label>
        <input type="text" value={section.content.secondaryCtaText || ''} onChange={(e) => updateContent('secondaryCtaText', e.target.value)} className={`${inputClass} mb-2`} placeholder="Texte" />
        <LinkInputField
          value={section.content.secondaryCtaLink || ''}
          onChange={(val) => updateContent('secondaryCtaLink', val)}
        />
      </div>
    </div>
  );
}

export function HeroWithTestimonialsContentEditor({ section, updateContent }: ContentEditorProps) {
  const testimonials = section.content.testimonials || [];

  const updateTestimonial = (index: number, field: string, value: string) => {
    const updated = [...testimonials];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('testimonials', updated);
  };

  const addTestimonial = () => {
    updateContent('testimonials', [...testimonials, { avatar: '', name: 'Nom', text: 'Temoignage' }]);
  };

  const removeTestimonial = (index: number) => {
    updateContent('testimonials', testimonials.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <RichTextArea
        label="Sous-titre H2"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Titre principal H1"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Description"
        value={section.content.description || ''}
        onChange={(val) => updateContent('description', val)}
        rows={3}
      />
      <div>
        <label className={labelClass}>Texte du bouton</label>
        <input type="text" value={section.content.ctaText || ''} onChange={(e) => updateContent('ctaText', e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Temoignages</label>
        <div className="space-y-3">
          {testimonials.map((t: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">#{index + 1}</span>
                <button onClick={() => removeTestimonial(index)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <ImageUploadField label="Avatar" value={t.avatar || ''} onChange={(url) => updateTestimonial(index, 'avatar', url)} placeholder="URL de l'avatar" />
              <input type="text" value={t.name || ''} onChange={(e) => updateTestimonial(index, 'name', e.target.value)} className={inputClass} placeholder="Nom" />
              <textarea value={t.text || ''} onChange={(e) => updateTestimonial(index, 'text', e.target.value)} rows={2} className={inputClass} placeholder="Temoignage" />
            </div>
          ))}
        </div>
        <button onClick={addTestimonial} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter un temoignage</span>
        </button>
      </div>
    </div>
  );
}

export function HeroWithServicesContentEditor({ section, updateContent }: ContentEditorProps) {
  const services = section.content.services || [];

  const updateService = (index: number, field: string, value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('services', updated);
  };

  const addService = () => {
    updateContent('services', [...services, { icon: 'zap', title: 'Service', description: 'Description' }]);
  };

  const removeService = (index: number) => {
    updateContent('services', services.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <RichTextArea
        label="Sous-titre H2"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Titre principal H1"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Description"
        value={section.content.description || ''}
        onChange={(val) => updateContent('description', val)}
        rows={3}
      />
      <div>
        <label className={labelClass}>Bouton principal</label>
        <input type="text" value={section.content.ctaText || ''} onChange={(e) => updateContent('ctaText', e.target.value)} className={`${inputClass} mb-2`} placeholder="Texte" />
        <LinkInputField
          value={section.content.ctaLink || ''}
          onChange={(val) => updateContent('ctaLink', val)}
        />
      </div>
      <ImageUploadField
        label="Image principale"
        value={section.content.image || ''}
        onChange={(url) => updateContent('image', url)}
        placeholder="URL de l'image"
        mediaType="image"
      />
      <div>
        <label className={labelClass}>Services (grille basse)</label>
        <div className="space-y-2">
          {services.map((service: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">#{index + 1}</span>
                <button onClick={() => removeService(index)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <IconPicker value={service.icon || 'zap'} onChange={(val) => updateService(index, 'icon', val)} />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Taille icone ({service.iconSize || 48}px)</label>
                <input type="range" min="16" max="80" step="4" value={service.iconSize || 48} onChange={(e) => updateService(index, 'iconSize', parseInt(e.target.value))} className="w-full" />
              </div>
              <input type="text" value={service.title || ''} onChange={(e) => updateService(index, 'title', e.target.value)} className={inputClass} placeholder="Titre" />
              <textarea value={service.description || ''} onChange={(e) => updateService(index, 'description', e.target.value)} rows={2} className={inputClass} placeholder="Description" />
            </div>
          ))}
        </div>
        <button onClick={addService} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter un service</span>
        </button>
      </div>
    </div>
  );
}

export function ClickFunnelsHeroContentEditor({ section, updateContent }: ContentEditorProps) {
  return (
    <div className="space-y-4">
      <RichTextArea
        label="Titre principal H1"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Sous-titre H2"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Accroche"
        value={section.content.tagline || ''}
        onChange={(val) => updateContent('tagline', val)}
        rows={1}
        singleLine
      />
      <div>
        <label className={labelClass}>Placeholder du champ email</label>
        <input type="text" value={section.content.inputPlaceholder || ''} onChange={(e) => updateContent('inputPlaceholder', e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Texte du bouton</label>
        <input type="text" value={section.content.buttonText || ''} onChange={(e) => updateContent('buttonText', e.target.value)} className={inputClass} />
      </div>
      <label className="flex items-center space-x-2 cursor-pointer">
        <input type="checkbox" checked={section.content.showSecondaryLink !== false} onChange={(e) => updateContent('showSecondaryLink', e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
        <span className="text-sm font-medium text-gray-700">Afficher lien secondaire</span>
      </label>
      {section.content.showSecondaryLink !== false && (
        <>
          <div>
            <label className={labelClass}>Prefixe lien secondaire</label>
            <input type="text" value={section.content.secondaryLinkPrefix || ''} onChange={(e) => updateContent('secondaryLinkPrefix', e.target.value)} className={inputClass} placeholder="Not ready to get started?" />
          </div>
          <div>
            <label className={labelClass}>Texte lien secondaire</label>
            <input type="text" value={section.content.secondaryLinkText || ''} onChange={(e) => updateContent('secondaryLinkText', e.target.value)} className={inputClass} placeholder="Learn More" />
          </div>
          <div>
            <label className={labelClass}>URL lien secondaire</label>
            <input type="text" value={section.content.secondaryLink || ''} onChange={(e) => updateContent('secondaryLink', e.target.value)} className={inputClass} placeholder="#" />
          </div>
        </>
      )}
      <label className="flex items-center space-x-2 cursor-pointer">
        <input type="checkbox" checked={section.content.showTrustBadges === true} onChange={(e) => updateContent('showTrustBadges', e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
        <span className="text-sm font-medium text-gray-700">Afficher badges de confiance</span>
      </label>
    </div>
  );
}

export function MembershipPricingContentEditor({ section, updateContent }: ContentEditorProps) {
  const plans = section.content.plans || [];

  const updatePlan = (index: number, field: string, value: any) => {
    const updated = [...plans];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('plans', updated);
  };

  const updatePlanFeatures = (planIndex: number, featureIndex: number, value: string) => {
    const updated = [...plans];
    const features = [...(updated[planIndex].features || [])];
    features[featureIndex] = value;
    updated[planIndex] = { ...updated[planIndex], features };
    updateContent('plans', updated);
  };

  const addPlanFeature = (planIndex: number) => {
    const updated = [...plans];
    updated[planIndex] = { ...updated[planIndex], features: [...(updated[planIndex].features || []), 'Nouvelle fonctionnalite'] };
    updateContent('plans', updated);
  };

  const removePlanFeature = (planIndex: number, featureIndex: number) => {
    const updated = [...plans];
    updated[planIndex] = { ...updated[planIndex], features: (updated[planIndex].features || []).filter((_: any, i: number) => i !== featureIndex) };
    updateContent('plans', updated);
  };

  const addPlan = () => {
    updateContent('plans', [...plans, { name: 'Plan', price: '$0', period: '/mois', description: '', features: ['Inclus'], highlighted: false, ctaText: "S'inscrire" }]);
  };

  const removePlan = (index: number) => {
    updateContent('plans', plans.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Description"
        value={section.content.description || ''}
        onChange={(val) => updateContent('description', val)}
        rows={2}
      />
      <div>
        <label className={labelClass}>Plans tarifaires</label>
        <div className="space-y-3">
          {plans.map((plan: any, planIndex: number) => (
            <div key={planIndex} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">Plan {planIndex + 1}</span>
                <button onClick={() => removePlan(planIndex)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input type="text" value={plan.name || ''} onChange={(e) => updatePlan(planIndex, 'name', e.target.value)} className={inputClass} placeholder="Nom du plan" />
              <IconPicker value={plan.icon || 'layers'} onChange={(val) => updatePlan(planIndex, 'icon', val)} />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Taille icone ({plan.iconSize || 32}px)</label>
                <input type="range" min="16" max="80" step="4" value={plan.iconSize || 32} onChange={(e) => updatePlan(planIndex, 'iconSize', parseInt(e.target.value))} className="w-full" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={plan.price || ''} onChange={(e) => updatePlan(planIndex, 'price', e.target.value)} className={inputClass} placeholder="Prix" />
                <input type="text" value={plan.period || ''} onChange={(e) => updatePlan(planIndex, 'period', e.target.value)} className={inputClass} placeholder="/mois" />
              </div>
              <textarea value={plan.description || ''} onChange={(e) => updatePlan(planIndex, 'description', e.target.value)} rows={2} className={inputClass} placeholder="Description du plan" />
              <input type="text" value={plan.ctaText || ''} onChange={(e) => updatePlan(planIndex, 'ctaText', e.target.value)} className={inputClass} placeholder="Texte du bouton" />
              <LinkInputField
                label="Lien du bouton"
                value={plan.ctaLink || ''}
                onChange={(val) => updatePlan(planIndex, 'ctaLink', val)}
              />
              <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={plan.highlighted === true} onChange={(e) => updatePlan(planIndex, 'highlighted', e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                <span>Plan mis en avant</span>
              </label>
              <div className="pl-3 border-l-2 border-gray-200 space-y-1.5">
                <span className="text-xs font-medium text-gray-500">Fonctionnalites incluses</span>
                {(plan.features || []).map((feat: string, fIndex: number) => (
                  <div key={fIndex} className="flex items-center gap-1">
                    <input type="text" value={feat} onChange={(e) => updatePlanFeatures(planIndex, fIndex, e.target.value)} className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-black focus:border-transparent" placeholder="Fonctionnalite" />
                    <button onClick={() => removePlanFeature(planIndex, fIndex)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded flex-shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button onClick={() => addPlanFeature(planIndex)} className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700">
                  <Plus className="w-3 h-3" /><span>Ajouter</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addPlan} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter un plan</span>
        </button>
      </div>
    </div>
  );
}

export function BentoFeaturesContentEditor({ section, updateContent }: ContentEditorProps) {
  const features = section.content.features || [];

  const updateFeature = (index: number, field: string, value: any) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('features', updated);
  };

  const addFeature = () => {
    updateContent('features', [...features, { label: 'Nouveau', title: 'Fonctionnalite', size: 'sm', height: 'h-48' }]);
  };

  const removeFeature = (index: number) => {
    updateContent('features', features.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <RichTextArea
        label="Sous-titre"
        value={section.content.subtitle || ''}
        onChange={(val) => updateContent('subtitle', val)}
        rows={1}
        singleLine
      />
      <RichTextArea
        label="Titre H2"
        value={section.content.title || ''}
        onChange={(val) => updateContent('title', val)}
        rows={1}
        singleLine
      />
      <div>
        <label className={labelClass}>Elements Bento</label>
        <div className="space-y-2">
          {features.map((feature: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">#{index + 1}</span>
                <button onClick={() => removeFeature(index)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <input type="text" value={feature.label || ''} onChange={(e) => updateFeature(index, 'label', e.target.value)} className={inputClass} placeholder="Label (petit)" />
              <input type="text" value={feature.title || ''} onChange={(e) => updateFeature(index, 'title', e.target.value)} className={inputClass} placeholder="Titre" />
              <select value={feature.size || 'sm'} onChange={(e) => updateFeature(index, 'size', e.target.value)} className={inputClass}>
                <option value="sm">Petit</option>
                <option value="md">Moyen</option>
                <option value="lg">Grand</option>
                <option value="xl">Tres grand</option>
              </select>
            </div>
          ))}
        </div>
        <button onClick={addFeature} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter un element</span>
        </button>
      </div>
    </div>
  );
}

export function FeaturesCarouselContentEditor({ section, updateContent }: ContentEditorProps) {
  const features = section.content.features || [];

  const updateFeature = (index: number, field: string, value: any) => {
    const updated = [...features];
    updated[index] = { ...updated[index], [field]: value };
    updateContent('features', updated);
  };

  const addFeature = () => {
    updateContent('features', [...features, { icon: 'layers', title: 'Fonctionnalite', description: 'Description', ctaText: '', featured: false }]);
  };

  const removeFeature = (index: number) => {
    updateContent('features', features.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center space-x-2 cursor-pointer">
        <input type="checkbox" checked={section.content.showDots !== false} onChange={(e) => updateContent('showDots', e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
        <span className="text-sm font-medium text-gray-700">Afficher les points de navigation</span>
      </label>
      <div>
        <label className={labelClass}>Fonctionnalites</label>
        <div className="space-y-3">
          {features.map((feature: any, index: number) => (
            <div key={index} className="bg-gray-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">#{index + 1}</span>
                <button onClick={() => removeFeature(index)} className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <IconPicker value={feature.icon || 'layers'} onChange={(val) => updateFeature(index, 'icon', val)} />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Taille icone ({feature.iconSize || 64}px)</label>
                <input type="range" min="16" max="128" step="4" value={feature.iconSize || 64} onChange={(e) => updateFeature(index, 'iconSize', parseInt(e.target.value))} className="w-full" />
              </div>
              <input type="text" value={feature.title || ''} onChange={(e) => updateFeature(index, 'title', e.target.value)} className={inputClass} placeholder="Titre" />
              <textarea value={feature.description || ''} onChange={(e) => updateFeature(index, 'description', e.target.value)} rows={2} className={inputClass} placeholder="Description" />
              <input type="text" value={feature.ctaText || ''} onChange={(e) => updateFeature(index, 'ctaText', e.target.value)} className={inputClass} placeholder="Texte du bouton (optionnel)" />
              <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={feature.featured === true} onChange={(e) => updateFeature(index, 'featured', e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
                <span>Mis en avant</span>
              </label>
            </div>
          ))}
        </div>
        <button onClick={addFeature} className="mt-2 flex items-center space-x-1.5 text-sm text-gray-600 hover:text-gray-900 font-medium">
          <Plus className="w-4 h-4" /><span>Ajouter une carte</span>
        </button>
      </div>
    </div>
  );
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // === Section Types ===
  const sectionTypes = [
    { name: 'hero', label: 'Hero Section', description: "Section d'en-tête avec titre principal et CTA", icon: 'Zap', isSystem: true, schema: { title: 'string', subtitle: 'string', cta_text: 'string', cta_url: 'string', image: 'string' } },
    { name: 'features', label: 'Features Grid', description: 'Grille de fonctionnalités avec icônes', icon: 'Grid', isSystem: true, schema: { title: 'string', items: [{ icon: 'string', title: 'string', description: 'string' }] } },
    { name: 'testimonials', label: 'Testimonials', description: 'Section de témoignages clients', icon: 'MessageCircle', isSystem: true, schema: { title: 'string', items: [{ name: 'string', role: 'string', content: 'string', avatar: 'string' }] } },
    { name: 'cta', label: 'Call to Action', description: "Section d'appel à l'action", icon: 'ArrowRight', isSystem: true, schema: { title: 'string', description: 'string', button_text: 'string', button_url: 'string' } },
    { name: 'content', label: 'Rich Content', description: 'Section de contenu riche avec HTML', icon: 'FileText', isSystem: true, schema: { content: 'html' } },
    { name: 'image_text', label: 'Image + Text', description: 'Section avec image et texte côte à côte', icon: 'Image', isSystem: true, schema: { title: 'string', content: 'string', image: 'string', image_position: 'left|right' } },
    { name: 'stats', label: 'Statistics', description: 'Section de statistiques et chiffres clés', icon: 'BarChart', isSystem: true, schema: { title: 'string', items: [{ value: 'string', label: 'string' }] } },
    { name: 'faq', label: 'FAQ', description: 'Section de questions/réponses', icon: 'HelpCircle', isSystem: true, schema: { title: 'string', items: [{ question: 'string', answer: 'string' }] } },
  ];

  for (const st of sectionTypes) {
    await prisma.sectionType.upsert({
      where: { name: st.name },
      update: {},
      create: st,
    });
  }
  console.log(`  ✓ ${sectionTypes.length} section types`);

  // === Page Themes (with colors already merged) ===
  const pageThemes = [
    {
      name: 'Par défaut',
      description: 'Thème par défaut avec Inter',
      css: {
        bodyFont: 'Inter, system-ui, sans-serif', headingFont: 'Inter, system-ui, sans-serif',
        textColor: '#1f2937', headingColor: '#111827',
        textBase: '16px', textSm: '14px', textLg: '18px',
        h1Size: '48px', h2Size: '36px', h3Size: '30px', h4Size: '24px',
        textWeight: '400', headingWeight: '700',
        backgroundColor: '#ffffff', primaryColor: '#3b82f6', secondaryColor: '#8b5cf6', accentColor: '#10b981',
      },
      isDefault: true,
    },
    {
      name: 'Élégant',
      description: 'Typographie élégante avec Playfair Display',
      css: {
        bodyFont: 'Georgia, serif', headingFont: '"Playfair Display", Georgia, serif',
        textColor: '#374151', headingColor: '#1f2937',
        textBase: '17px', textSm: '15px', textLg: '19px',
        h1Size: '56px', h2Size: '40px', h3Size: '32px', h4Size: '26px',
        textWeight: '400', headingWeight: '700',
        backgroundColor: '#fafaf9', primaryColor: '#a855f7', secondaryColor: '#ec4899', accentColor: '#f59e0b',
      },
      isDefault: true,
    },
    {
      name: 'Moderne',
      description: 'Design moderne avec Poppins',
      css: {
        bodyFont: '"Poppins", system-ui, sans-serif', headingFont: '"Poppins", system-ui, sans-serif',
        textColor: '#4b5563', headingColor: '#111827',
        textBase: '15px', textSm: '13px', textLg: '17px',
        h1Size: '44px', h2Size: '34px', h3Size: '28px', h4Size: '22px',
        textWeight: '400', headingWeight: '600',
        backgroundColor: '#ffffff', primaryColor: '#06b6d4', secondaryColor: '#8b5cf6', accentColor: '#f43f5e',
      },
      isDefault: true,
    },
    {
      name: 'Audacieux',
      description: 'Typographie forte et audacieuse',
      css: {
        bodyFont: '"Roboto", system-ui, sans-serif', headingFont: '"Montserrat", system-ui, sans-serif',
        textColor: '#374151', headingColor: '#000000',
        textBase: '16px', textSm: '14px', textLg: '18px',
        h1Size: '52px', h2Size: '38px', h3Size: '30px', h4Size: '24px',
        textWeight: '400', headingWeight: '800',
        backgroundColor: '#ffffff', primaryColor: '#ef4444', secondaryColor: '#f97316', accentColor: '#eab308',
      },
      isDefault: true,
    },
    {
      name: 'Minimaliste',
      description: 'Design épuré et minimaliste',
      css: {
        bodyFont: '"Work Sans", system-ui, sans-serif', headingFont: '"Work Sans", system-ui, sans-serif',
        textColor: '#6b7280', headingColor: '#374151',
        textBase: '15px', textSm: '13px', textLg: '17px',
        h1Size: '40px', h2Size: '32px', h3Size: '26px', h4Size: '20px',
        textWeight: '300', headingWeight: '500',
        backgroundColor: '#fafafa', primaryColor: '#64748b', secondaryColor: '#94a3b8', accentColor: '#0ea5e9',
      },
      isDefault: true,
    },
    {
      name: 'Classique',
      description: 'Typographie classique avec Times',
      css: {
        bodyFont: '"Lora", Georgia, serif', headingFont: '"Merriweather", Georgia, serif',
        textColor: '#1f2937', headingColor: '#111827',
        textBase: '18px', textSm: '16px', textLg: '20px',
        h1Size: '48px', h2Size: '36px', h3Size: '30px', h4Size: '24px',
        textWeight: '400', headingWeight: '700',
        backgroundColor: '#fffef7', primaryColor: '#92400e', secondaryColor: '#78350f', accentColor: '#b45309',
      },
      isDefault: true,
    },
  ];

  for (const pt of pageThemes) {
    const existing = await prisma.pageTheme.findFirst({ where: { name: pt.name } });
    if (!existing) {
      await prisma.pageTheme.create({ data: pt });
    }
  }
  console.log(`  ✓ ${pageThemes.length} page themes`);

  // === Fonts Library ===
  const fonts = [
    { fontName: 'Inter', fontFamily: '"Inter", system-ui, sans-serif', fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap', fontWeights: ['300', '400', '500', '600', '700', '800', '900'], isGoogleFont: true, isSystem: true },
    { fontName: 'Roboto', fontFamily: '"Roboto", system-ui, sans-serif', fontUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap', fontWeights: ['300', '400', '500', '700', '900'], isGoogleFont: true, isSystem: true },
    { fontName: 'Poppins', fontFamily: '"Poppins", system-ui, sans-serif', fontUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap', fontWeights: ['300', '400', '500', '600', '700', '800', '900'], isGoogleFont: true, isSystem: true },
    { fontName: 'Playfair Display', fontFamily: '"Playfair Display", serif', fontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap', fontWeights: ['400', '500', '600', '700', '800', '900'], isGoogleFont: true, isSystem: true },
    { fontName: 'Montserrat', fontFamily: '"Montserrat", system-ui, sans-serif', fontUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap', fontWeights: ['300', '400', '500', '600', '700', '800', '900'], isGoogleFont: true, isSystem: true },
    { fontName: 'Open Sans', fontFamily: '"Open Sans", system-ui, sans-serif', fontUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap', fontWeights: ['300', '400', '500', '600', '700', '800'], isGoogleFont: true, isSystem: true },
    { fontName: 'Lato', fontFamily: '"Lato", system-ui, sans-serif', fontUrl: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap', fontWeights: ['300', '400', '700', '900'], isGoogleFont: true, isSystem: true },
    { fontName: 'Merriweather', fontFamily: '"Merriweather", serif', fontUrl: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap', fontWeights: ['300', '400', '700', '900'], isGoogleFont: true, isSystem: true },
  ];

  for (const f of fonts) {
    await prisma.fontsLibrary.upsert({
      where: { fontName: f.fontName },
      update: {},
      create: f,
    });
  }
  console.log(`  ✓ ${fonts.length} fonts`);

  // === DaisyUI Themes ===
  const daisyuiThemes = [
    { name: 'Light', slug: 'light', tokens: {"primary":"#570df8","primary-content":"#ffffff","secondary":"#f000b8","secondary-content":"#ffffff","accent":"#37cdbe","accent-content":"#163835","neutral":"#2a323c","neutral-content":"#a6adbb","base-100":"#ffffff","base-200":"#f2f2f2","base-300":"#e5e6e6","base-content":"#1f2937","info":"#3abff8","info-content":"#002b3d","success":"#36d399","success-content":"#003320","warning":"#fbbd23","warning-content":"#382800","error":"#f87272","error-content":"#470000"}, isActive: true },
    { name: 'Dark', slug: 'dark', tokens: {"primary":"#661ae6","primary-content":"#ffffff","secondary":"#d926a9","secondary-content":"#ffffff","accent":"#1fb2a6","accent-content":"#ffffff","neutral":"#2a323c","neutral-content":"#a6adbb","base-100":"#1d232a","base-200":"#191e24","base-300":"#15191e","base-content":"#a6adbb","info":"#3abff8","info-content":"#002b3d","success":"#36d399","success-content":"#003320","warning":"#fbbd23","warning-content":"#382800","error":"#f87272","error-content":"#470000"}, isActive: false },
    { name: 'Cupcake', slug: 'cupcake', tokens: {"primary":"#65c3c8","primary-content":"#223D3E","secondary":"#ef9fbc","secondary-content":"#3D2B32","accent":"#eeaf3a","accent-content":"#3D3520","neutral":"#291334","neutral-content":"#D4C1DB","base-100":"#faf7f5","base-200":"#efecea","base-300":"#e7e2df","base-content":"#291334","info":"#3abff8","info-content":"#002b3d","success":"#36d399","success-content":"#003320","warning":"#fbbd23","warning-content":"#382800","error":"#f87272","error-content":"#470000"}, isActive: false },
    { name: 'Bumblebee', slug: 'bumblebee', tokens: {"primary":"#e0a82e","primary-content":"#3D2F0A","secondary":"#f9d72f","secondary-content":"#3D350B","accent":"#e0a82e","accent-content":"#3D2F0A","neutral":"#1f2937","neutral-content":"#d5d7da","base-100":"#ffffff","base-200":"#f2f2f2","base-300":"#e5e6e6","base-content":"#1f2937","info":"#3abff8","info-content":"#002b3d","success":"#36d399","success-content":"#003320","warning":"#fbbd23","warning-content":"#382800","error":"#f87272","error-content":"#470000"}, isActive: false },
    { name: 'Emerald', slug: 'emerald', tokens: {"primary":"#66cc8a","primary-content":"#1A3320","secondary":"#377cfb","secondary-content":"#0E1F3D","accent":"#ea5234","accent-content":"#ffffff","neutral":"#333c4d","neutral-content":"#d1d5db","base-100":"#ffffff","base-200":"#f2f2f2","base-300":"#e5e6e6","base-content":"#333c4d","info":"#3abff8","info-content":"#002b3d","success":"#36d399","success-content":"#003320","warning":"#fbbd23","warning-content":"#382800","error":"#f87272","error-content":"#470000"}, isActive: false },
    { name: 'Corporate', slug: 'corporate', tokens: {"primary":"#4b6bfb","primary-content":"#ffffff","secondary":"#7b92b2","secondary-content":"#1E2530","accent":"#67cba0","accent-content":"#1A3325","neutral":"#181a2a","neutral-content":"#d5d7da","base-100":"#ffffff","base-200":"#f2f2f2","base-300":"#e5e6e6","base-content":"#181a2a","info":"#3abff8","info-content":"#002b3d","success":"#36d399","success-content":"#003320","warning":"#fbbd23","warning-content":"#382800","error":"#f87272","error-content":"#470000"}, isActive: false },
    { name: 'Synthwave', slug: 'synthwave', tokens: {"primary":"#e779c1","primary-content":"#3D1E30","secondary":"#58c7f3","secondary-content":"#16323D","accent":"#f3cc30","accent-content":"#3D330C","neutral":"#20134e","neutral-content":"#f9f7fd","base-100":"#1a103d","base-200":"#150D33","base-300":"#110A29","base-content":"#f9f7fd","info":"#53c0f0","info-content":"#153040","success":"#71ead2","success-content":"#1C3B35","warning":"#f3cc30","warning-content":"#3D330C","error":"#e24056","error-content":"#390F16"}, isActive: false },
    { name: 'Retro', slug: 'retro', tokens: {"primary":"#ef9995","primary-content":"#3D2726","secondary":"#a4cbb4","secondary-content":"#29332D","accent":"#dc8850","accent-content":"#372214","neutral":"#2e282a","neutral-content":"#e4d8b4","base-100":"#ece3ca","base-200":"#e4d8b4","base-300":"#d5c5a1","base-content":"#282425","info":"#2094f3","info-content":"#08253D","success":"#009485","success-content":"#002521","warning":"#ff9900","warning-content":"#402600","error":"#ff5724","error-content":"#401609"}, isActive: false },
    { name: 'Cyberpunk', slug: 'cyberpunk', tokens: {"primary":"#ff7598","primary-content":"#3D1C25","secondary":"#75d1f0","secondary-content":"#1D343C","accent":"#c07eec","accent-content":"#301F3B","neutral":"#423f00","neutral-content":"#e7e600","base-100":"#ffee00","base-200":"#e6d600","base-300":"#ccbe00","base-content":"#333300","info":"#00fefe","info-content":"#004040","success":"#79ff79","success-content":"#1E401E","warning":"#ff7f00","warning-content":"#402000","error":"#ff4444","error-content":"#401111"}, isActive: false },
    { name: 'Valentine', slug: 'valentine', tokens: {"primary":"#e96d7b","primary-content":"#3A1B1F","secondary":"#a991f7","secondary-content":"#2A243E","accent":"#88dbdd","accent-content":"#223737","neutral":"#af4670","neutral-content":"#f2d9e1","base-100":"#fae7f4","base-200":"#f5d5ea","base-300":"#f0c3e0","base-content":"#632c3b","info":"#2094f3","info-content":"#08253D","success":"#009485","success-content":"#002521","warning":"#ff9900","warning-content":"#402600","error":"#ff5724","error-content":"#401609"}, isActive: false },
    { name: 'Halloween', slug: 'halloween', tokens: {"primary":"#f28c18","primary-content":"#3D2306","secondary":"#6d3a9c","secondary-content":"#e4d1f4","accent":"#51a800","accent-content":"#142A00","neutral":"#2f1b05","neutral-content":"#f0dcc8","base-100":"#212121","base-200":"#1a1a1a","base-300":"#131313","base-content":"#d5ccbb","info":"#2094f3","info-content":"#08253D","success":"#009485","success-content":"#002521","warning":"#ff9900","warning-content":"#402600","error":"#ff5724","error-content":"#401609"}, isActive: false },
    { name: 'Garden', slug: 'garden', tokens: {"primary":"#5c7f67","primary-content":"#ffffff","secondary":"#ecf4e7","secondary-content":"#3B3D39","accent":"#fae5e5","accent-content":"#3E3939","neutral":"#5d5656","neutral-content":"#d7d1d1","base-100":"#e9e7e7","base-200":"#dddada","base-300":"#d1cdcd","base-content":"#100f0f","info":"#2094f3","info-content":"#08253D","success":"#009485","success-content":"#002521","warning":"#ff9900","warning-content":"#402600","error":"#ff5724","error-content":"#401609"}, isActive: false },
    { name: 'Forest', slug: 'forest', tokens: {"primary":"#1eb854","primary-content":"#052E15","secondary":"#1db990","secondary-content":"#052E24","accent":"#1db5c4","accent-content":"#052D31","neutral":"#19362d","neutral-content":"#d1e0da","base-100":"#171212","base-200":"#120e0e","base-300":"#0d0a0a","base-content":"#d1caca","info":"#2094f3","info-content":"#08253D","success":"#009485","success-content":"#002521","warning":"#ff9900","warning-content":"#402600","error":"#ff5724","error-content":"#401609"}, isActive: false },
    { name: 'Aqua', slug: 'aqua', tokens: {"primary":"#09ecf3","primary-content":"#023B3D","secondary":"#966fb3","secondary-content":"#251C2D","accent":"#ffe999","accent-content":"#403A26","neutral":"#3b8ac4","neutral-content":"#d1e3f1","base-100":"#345da7","base-200":"#2D5196","base-300":"#264585","base-content":"#d5e0f0","info":"#2094f3","info-content":"#08253D","success":"#009485","success-content":"#002521","warning":"#ff9900","warning-content":"#402600","error":"#ff5724","error-content":"#401609"}, isActive: false },
    { name: 'Lofi', slug: 'lofi', tokens: {"primary":"#0d0d0d","primary-content":"#ffffff","secondary":"#1a1919","secondary-content":"#ffffff","accent":"#262626","accent-content":"#ffffff","neutral":"#000000","neutral-content":"#ffffff","base-100":"#ffffff","base-200":"#f2f2f2","base-300":"#e6e6e6","base-content":"#000000","info":"#0070f3","info-content":"#ffffff","success":"#21cc51","success-content":"#052E14","warning":"#ff6154","warning-content":"#401814","error":"#de1c8d","error-content":"#ffffff"}, isActive: false },
    { name: 'Pastel', slug: 'pastel', tokens: {"primary":"#d1c1d7","primary-content":"#353036","secondary":"#f6cbd1","secondary-content":"#3E3234","accent":"#b6e3d4","accent-content":"#2D3935","neutral":"#70acc7","neutral-content":"#1C2B32","base-100":"#ffffff","base-200":"#f9fafb","base-300":"#d1d5db","base-content":"#333333","info":"#8cc8ea","info-content":"#23323B","success":"#addfad","success-content":"#2B382B","warning":"#f5d38b","warning-content":"#3E3523","error":"#f1a3a8","error-content":"#3C292A"}, isActive: false },
    { name: 'Fantasy', slug: 'fantasy', tokens: {"primary":"#6e0b75","primary-content":"#ffffff","secondary":"#007ebd","secondary-content":"#ffffff","accent":"#f8860d","accent-content":"#3E2203","neutral":"#1f2937","neutral-content":"#d5d7da","base-100":"#ffffff","base-200":"#f2f2f2","base-300":"#e5e6e6","base-content":"#1f2937","info":"#3abff8","info-content":"#002b3d","success":"#36d399","success-content":"#003320","warning":"#fbbd23","warning-content":"#382800","error":"#f87272","error-content":"#470000"}, isActive: false },
    { name: 'Wireframe', slug: 'wireframe', tokens: {"primary":"#b8b8b8","primary-content":"#2E2E2E","secondary":"#b8b8b8","secondary-content":"#2E2E2E","accent":"#b8b8b8","accent-content":"#2E2E2E","neutral":"#ebebeb","neutral-content":"#3B3B3B","base-100":"#ffffff","base-200":"#eeeeee","base-300":"#dddddd","base-content":"#333333","info":"#0070f3","info-content":"#ffffff","success":"#21cc51","success-content":"#052E14","warning":"#ff6154","warning-content":"#401814","error":"#de1c8d","error-content":"#ffffff"}, isActive: false },
    { name: 'Black', slug: 'black', tokens: {"primary":"#343232","primary-content":"#d5d4d4","secondary":"#343232","secondary-content":"#d5d4d4","accent":"#343232","accent-content":"#d5d4d4","neutral":"#272626","neutral-content":"#d4d3d3","base-100":"#000000","base-200":"#0d0d0d","base-300":"#1a1a1a","base-content":"#cccccc","info":"#0070f3","info-content":"#ffffff","success":"#21cc51","success-content":"#052E14","warning":"#ff6154","warning-content":"#401814","error":"#de1c8d","error-content":"#ffffff"}, isActive: false },
    { name: 'Luxury', slug: 'luxury', tokens: {"primary":"#ffffff","primary-content":"#000000","secondary":"#152747","secondary-content":"#d1dBeb","accent":"#513448","accent-content":"#dAc5d4","neutral":"#331800","neutral-content":"#f0dcc8","base-100":"#09090b","base-200":"#070708","base-300":"#050506","base-content":"#dca54c","info":"#66c6ff","info-content":"#1A3240","success":"#87d039","success-content":"#22340E","warning":"#e2d562","warning-content":"#383518","error":"#ff6f6f","error-content":"#401C1C"}, isActive: false },
    { name: 'Dracula', slug: 'dracula', tokens: {"primary":"#ff79c6","primary-content":"#3D1E30","secondary":"#bd93f9","secondary-content":"#2F243E","accent":"#ffb86c","accent-content":"#3D2E1A","neutral":"#414558","neutral-content":"#d1d3da","base-100":"#282a36","base-200":"#21222c","base-300":"#1a1b24","base-content":"#f8f8f2","info":"#8be9fd","info-content":"#233A3F","success":"#50fa7b","success-content":"#143E1E","warning":"#f1fa8c","warning-content":"#3C3E23","error":"#ff5555","error-content":"#401515"}, isActive: false },
    { name: 'CMYK', slug: 'cmyk', tokens: {"primary":"#45AEEE","primary-content":"#112B3B","secondary":"#E8488A","secondary-content":"#3A1222","accent":"#FFC107","accent-content":"#403002","neutral":"#1a1a2e","neutral-content":"#d1d1dc","base-100":"#ffffff","base-200":"#f2f2f2","base-300":"#e5e6e6","base-content":"#1a1a2e","info":"#3abff8","info-content":"#002b3d","success":"#36d399","success-content":"#003320","warning":"#fbbd23","warning-content":"#382800","error":"#f87272","error-content":"#470000"}, isActive: false },
    { name: 'Autumn', slug: 'autumn', tokens: {"primary":"#8C0327","primary-content":"#f2ccd4","secondary":"#D85251","secondary-content":"#361414","accent":"#D59B6C","accent-content":"#36271B","neutral":"#826A5C","neutral-content":"#e8e0db","base-100":"#f1f1f1","base-200":"#e6e6e6","base-300":"#dbdbdb","base-content":"#1f1f1f","info":"#42ADBB","info-content":"#102B2F","success":"#499380","success-content":"#122520","warning":"#E97F14","warning-content":"#3A2005","error":"#DF1A2F","error-content":"#38060C"}, isActive: false },
    { name: 'Business', slug: 'business', tokens: {"primary":"#1C4E80","primary-content":"#d1dfeb","secondary":"#7C909A","secondary-content":"#1F2426","accent":"#EA6947","accent-content":"#3B1A12","neutral":"#23282E","neutral-content":"#d3d5d7","base-100":"#202020","base-200":"#1a1a1a","base-300":"#141414","base-content":"#d6d6d6","info":"#0091D5","info-content":"#002435","success":"#6BB187","success-content":"#1B2C22","warning":"#DBAE59","warning-content":"#372C17","error":"#AC3E31","error-content":"#2B100C"}, isActive: false },
    { name: 'Acid', slug: 'acid', tokens: {"primary":"#FF00F5","primary-content":"#40003D","secondary":"#FF7400","secondary-content":"#401D00","accent":"#CBFF00","accent-content":"#334000","neutral":"#1f1f1f","neutral-content":"#d1d1d1","base-100":"#fafafa","base-200":"#ebebeb","base-300":"#dcdcdc","base-content":"#1f1f1f","info":"#00b5ff","info-content":"#002D40","success":"#00a96e","success-content":"#002A1C","warning":"#ffbe00","warning-content":"#403000","error":"#ff5861","error-content":"#401618"}, isActive: false },
    { name: 'Lemonade', slug: 'lemonade', tokens: {"primary":"#519903","primary-content":"#142601","secondary":"#E9E92E","secondary-content":"#3A3A0B","accent":"#F7F9CA","accent-content":"#3E3E33","neutral":"#191A3E","neutral-content":"#d1d1dc","base-100":"#ffffff","base-200":"#f2f2f2","base-300":"#e5e6e6","base-content":"#191A3E","info":"#C8E1FF","info-content":"#323840","success":"#DEF29F","success-content":"#383D28","warning":"#F7E589","warning-content":"#3E3922","error":"#F2B6B5","error-content":"#3D2D2D"}, isActive: false },
    { name: 'Night', slug: 'night', tokens: {"primary":"#38bdf8","primary-content":"#0E2F3E","secondary":"#818cf8","secondary-content":"#20233E","accent":"#f471b5","accent-content":"#3D1C2D","neutral":"#1e293b","neutral-content":"#d1d8e4","base-100":"#0f172a","base-200":"#0d1322","base-300":"#0b0f1a","base-content":"#b2c5df","info":"#0ca5e9","info-content":"#03293A","success":"#2dd4bf","success-content":"#0B3530","warning":"#f4bf50","warning-content":"#3D3014","error":"#fb7085","error-content":"#3E1C21"}, isActive: false },
    { name: 'Coffee', slug: 'coffee', tokens: {"primary":"#DB924B","primary-content":"#372412","secondary":"#6F4E37","secondary-content":"#f0e2d4","accent":"#263E3F","accent-content":"#c9dAdb","neutral":"#120C12","neutral-content":"#d0c3d0","base-100":"#20161F","base-200":"#1a111a","base-300":"#140d14","base-content":"#cebdbd","info":"#8DCAC1","info-content":"#233230","success":"#9DB787","success-content":"#272E22","warning":"#FFD25F","warning-content":"#403518","error":"#FC9581","error-content":"#3F2520"}, isActive: false },
    { name: 'Winter', slug: 'winter', tokens: {"primary":"#047AFF","primary-content":"#ffffff","secondary":"#463AA2","secondary-content":"#ffffff","accent":"#C148AC","accent-content":"#30122B","neutral":"#021431","neutral-content":"#cdd4e0","base-100":"#ffffff","base-200":"#f2f7ff","base-300":"#e3ecf7","base-content":"#394E6A","info":"#93E7FB","info-content":"#243A3F","success":"#81CFD1","success-content":"#203434","warning":"#EFD7BB","warning-content":"#3C362F","error":"#E58B8B","error-content":"#392323"}, isActive: false },
    { name: 'Dim', slug: 'dim', tokens: {"primary":"#9FE88D","primary-content":"#283A23","secondary":"#FF7D5C","secondary-content":"#401F17","accent":"#C792E9","accent-content":"#32243A","neutral":"#2A303C","neutral-content":"#B2CCD6","base-100":"#2A303C","base-200":"#242933","base-300":"#1F242D","base-content":"#B2CCD6","info":"#28EBFF","info-content":"#0A3B40","success":"#62EFBD","success-content":"#183C2F","warning":"#EFD7BB","warning-content":"#3C362F","error":"#FFAE9B","error-content":"#402B27"}, isActive: false },
    { name: 'Nord', slug: 'nord', tokens: {"primary":"#5E81AC","primary-content":"#17202B","secondary":"#81A1C1","secondary-content":"#202830","accent":"#88C0D0","accent-content":"#223034","neutral":"#4C566A","neutral-content":"#d8dee9","base-100":"#eceff4","base-200":"#e5e9f0","base-300":"#d8dee9","base-content":"#2E3440","info":"#B48EAD","info-content":"#2D232B","success":"#A3BE8C","success-content":"#293023","warning":"#EBCB8B","warning-content":"#3B3223","error":"#BF616A","error-content":"#30181A"}, isActive: false },
    { name: 'Sunset', slug: 'sunset', tokens: {"primary":"#FF865B","primary-content":"#402117","secondary":"#FD6F9C","secondary-content":"#3F1C27","accent":"#2DD4BF","accent-content":"#0B3530","neutral":"#1E293B","neutral-content":"#d1d8e4","base-100":"#121C22","base-200":"#0F171C","base-300":"#0C1216","base-content":"#9FB9D0","info":"#38BDF8","info-content":"#0E2F3E","success":"#4ADE80","success-content":"#122B20","warning":"#FBBF24","warning-content":"#3E3009","error":"#FB7185","error-content":"#3E1C21"}, isActive: false },
  ];

  for (const theme of daisyuiThemes) {
    await prisma.daisyuiTheme.upsert({
      where: { slug: theme.slug },
      update: {},
      create: { ...theme, source: 'daisyui' },
    });
  }
  console.log(`  ✓ ${daisyuiThemes.length} DaisyUI themes`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

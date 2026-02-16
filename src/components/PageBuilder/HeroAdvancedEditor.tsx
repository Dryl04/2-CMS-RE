import { PageBuilderSection } from '../../lib/pageBuilderTypes';

interface HeroAdvancedEditorProps {
  section: PageBuilderSection;
  updateDesign: (category: string, key: string, value: any) => void;
}

export function HeroAdvancedEditor({ section, updateDesign }: HeroAdvancedEditorProps) {
  const overlayEnabled = section.design?.overlay?.enabled !== false;
  const overlayColor = section.design?.overlay?.color || '#000000';
  const overlayOpacity = section.design?.overlay?.opacity ?? 0.4;
  const overlayGradient = section.design?.overlay?.gradient || 'none';
  const overlayGradientDirection = section.design?.overlay?.gradientDirection || 'to bottom';

  const blurAmount = section.design?.effects?.blur || 0;
  const brightness = section.design?.effects?.brightness ?? 100;
  const contrast = section.design?.effects?.contrast ?? 100;
  const saturate = section.design?.effects?.saturate ?? 100;
  const grayscale = section.design?.effects?.grayscale || 0;
  const sepia = section.design?.effects?.sepia || 0;
  const hueRotate = section.design?.effects?.hueRotate || 0;

  const parallaxEnabled = section.design?.effects?.parallax || false;
  const animationEnabled = section.design?.effects?.animation || false;
  const animationType = section.design?.effects?.animationType || 'fade-in';

  const contentPosition = section.design?.layout?.contentPosition || 'left';
  const contentAlignment = section.design?.layout?.contentAlignment || 'start';
  const minHeight = section.design?.layout?.minHeight || '500px';
  const maxWidth = section.design?.layout?.maxWidth || '7xl';

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          Options avancées pour personnaliser l'apparence et les effets du Hero
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
          Superposition (Overlay)
        </h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={overlayEnabled}
              onChange={(e) => updateDesign('overlay', 'enabled', e.target.checked)}
              className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Activer la superposition</span>
          </label>

          {overlayEnabled && (
            <>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Couleur overlay</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={overlayColor}
                    onChange={(e) => updateDesign('overlay', 'color', e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={overlayColor}
                    onChange={(e) => updateDesign('overlay', 'color', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Opacité: {(overlayOpacity * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => updateDesign('overlay', 'opacity', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Type de gradient</label>
                <select
                  value={overlayGradient}
                  onChange={(e) => updateDesign('overlay', 'gradient', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="none">Couleur unie</option>
                  <option value="linear">Gradient linéaire</option>
                  <option value="radial">Gradient radial</option>
                </select>
              </div>

              {overlayGradient === 'linear' && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Direction gradient</label>
                  <select
                    value={overlayGradientDirection}
                    onChange={(e) => updateDesign('overlay', 'gradientDirection', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="to top">Vers le haut</option>
                    <option value="to bottom">Vers le bas</option>
                    <option value="to left">Vers la gauche</option>
                    <option value="to right">Vers la droite</option>
                    <option value="to top left">Diagonale haut-gauche</option>
                    <option value="to top right">Diagonale haut-droite</option>
                    <option value="to bottom left">Diagonale bas-gauche</option>
                    <option value="to bottom right">Diagonale bas-droite</option>
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
          Filtres d'Image
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Flou: {blurAmount}px
            </label>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={blurAmount}
              onChange={(e) => updateDesign('effects', 'blur', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Luminosité: {brightness}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={brightness}
              onChange={(e) => updateDesign('effects', 'brightness', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Contraste: {contrast}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={contrast}
              onChange={(e) => updateDesign('effects', 'contrast', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Saturation: {saturate}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={saturate}
              onChange={(e) => updateDesign('effects', 'saturate', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Niveaux de gris: {grayscale}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={grayscale}
              onChange={(e) => updateDesign('effects', 'grayscale', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Sépia: {sepia}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={sepia}
              onChange={(e) => updateDesign('effects', 'sepia', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Rotation teinte: {hueRotate}°
            </label>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={hueRotate}
              onChange={(e) => updateDesign('effects', 'hueRotate', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-600 rounded-full"></span>
          Effets & Animation
        </h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={parallaxEnabled}
              onChange={(e) => updateDesign('effects', 'parallax', e.target.checked)}
              className="mr-2 w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Effet parallaxe</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={animationEnabled}
              onChange={(e) => updateDesign('effects', 'animation', e.target.checked)}
              className="mr-2 w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Animation d'entrée</span>
          </label>

          {animationEnabled && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">Type d'animation</label>
              <select
                value={animationType}
                onChange={(e) => updateDesign('effects', 'animationType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="fade-in">Apparition progressive</option>
                <option value="slide-up">Glissement vers le haut</option>
                <option value="slide-down">Glissement vers le bas</option>
                <option value="slide-left">Glissement vers la gauche</option>
                <option value="slide-right">Glissement vers la droite</option>
                <option value="zoom-in">Zoom avant</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
          Mise en Page
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Position du contenu</label>
            <select
              value={contentPosition}
              onChange={(e) => updateDesign('layout', 'contentPosition', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            >
              <option value="left">Gauche</option>
              <option value="center">Centre</option>
              <option value="right">Droite</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Alignement vertical</label>
            <select
              value={contentAlignment}
              onChange={(e) => updateDesign('layout', 'contentAlignment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            >
              <option value="start">Haut</option>
              <option value="center">Centre</option>
              <option value="end">Bas</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Hauteur minimale</label>
            <input
              type="text"
              value={minHeight}
              onChange={(e) => updateDesign('layout', 'minHeight', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="ex: 500px, 80vh"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Largeur maximale</label>
            <select
              value={maxWidth}
              onChange={(e) => updateDesign('layout', 'maxWidth', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            >
              <option value="sm">Très petite (640px)</option>
              <option value="md">Petite (768px)</option>
              <option value="lg">Moyenne (1024px)</option>
              <option value="xl">Grande (1280px)</option>
              <option value="2xl">Très grande (1536px)</option>
              <option value="3xl">Extra large (1920px)</option>
              <option value="4xl">2XL (2304px)</option>
              <option value="5xl">3XL (2560px)</option>
              <option value="6xl">4XL (2880px)</option>
              <option value="7xl">5XL (3200px)</option>
              <option value="full">Pleine largeur</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-xs text-yellow-800 font-medium mb-1">
          Astuce
        </p>
        <p className="text-xs text-yellow-700">
          Pour la variante "Full Background", essayez un overlay sombre avec un gradient linéaire vers le bas pour un effet dramatique.
        </p>
      </div>
    </div>
  );
}

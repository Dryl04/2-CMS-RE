# Guide Rapide - Thèmes CSS Personnalisés

## Accès rapide

1. Ouvrez le **Page Builder** (Éditeur Avancé)
2. Dans la toolbar, cherchez le sélecteur bleu avec l'icône 🎨
3. Cliquez sur l'icône ⚙️ à côté pour ouvrir le gestionnaire

## Créer votre premier thème

### Étape 1: Ouvrir le gestionnaire
Cliquez sur ⚙️ dans la barre d'outils du Page Builder

### Étape 2: Créer
Cliquez sur **"Nouveau thème"**

### Étape 3: Personnaliser
Remplissez les champs:
- Nom et description
- Choisissez les polices
- Définissez les couleurs (utilisez le sélecteur)
- Ajustez les tailles
- Réglez l'épaisseur

### Étape 4: Prévisualiser
La section "Aperçu" montre le rendu en temps réel

### Étape 5: Enregistrer
Cliquez sur **"Enregistrer"**

### Étape 6: Utiliser
Fermez le gestionnaire et sélectionnez votre thème dans le menu déroulant bleu

## Exemples de thèmes

### Thème Corporate
```
Police texte: Roboto
Police titres: Montserrat
Couleur texte: #333333
Couleur titres: #000000
Taille base: 16px
H1: 48px
Poids texte: 400
Poids titres: 700
```

### Thème Magazine
```
Police texte: Georgia
Police titres: Playfair Display
Couleur texte: #2c2c2c
Couleur titres: #1a1a1a
Taille base: 18px
H1: 56px
Poids texte: 400
Poids titres: 700
```

### Thème Startup
```
Police texte: Inter
Police titres: Poppins
Couleur texte: #4b5563
Couleur titres: #111827
Taille base: 15px
H1: 44px
Poids texte: 400
Poids titres: 600
```

### Thème Minimaliste
```
Police texte: Work Sans
Police titres: Work Sans
Couleur texte: #6b7280
Couleur titres: #374151
Taille base: 15px
H1: 40px
Poids texte: 300
Poids titres: 500
```

## Astuces

### Contraste
Assurez-vous d'avoir un bon contraste entre le texte et le fond pour la lisibilité:
- Ratio minimum recommandé: 4.5:1 pour le texte normal
- Ratio minimum recommandé: 3:1 pour les grands textes

### Hiérarchie
Créez une hiérarchie claire entre les titres:
- H1 devrait être nettement plus grand que H2
- Différence recommandée: 20-30% entre chaque niveau
- Exemple: H1 48px → H2 36px → H3 28px → H4 22px

### Cohérence
- Limitez-vous à 2-3 polices maximum par thème
- Utilisez la même police pour tous les titres
- Gardez les poids cohérents (pas trop de variations)

### Lisibilité
- Taille minimale pour le texte: 14px
- Taille optimale pour le corps de texte: 16-18px
- Poids normal (400) pour le texte courant
- Poids gras (600-700) pour les titres

## Dupliquer pour personnaliser

La façon la plus rapide de créer un thème:

1. Ouvrez le gestionnaire
2. Trouvez un thème par défaut proche de votre vision
3. Cliquez sur l'icône 📄 (Dupliquer)
4. Modifiez seulement ce qui diffère
5. Enregistrez avec un nouveau nom

## Problèmes courants

### Le thème ne s'applique pas
- Vérifiez que vous êtes en mode Aperçu ou dans le Canvas
- Assurez-vous d'avoir enregistré le thème
- Rechargez la page si nécessaire

### Police non disponible
- Seules les polices listées dans le gestionnaire sont disponibles
- Les polices Google Fonts sont chargées automatiquement
- Si vous avez besoin d'une autre police, contactez le développeur

### Thème perdu après changement de navigateur
- Les thèmes sont stockés en localStorage
- Chaque navigateur a son propre stockage
- Solution: recréez le thème ou dupliquez-le depuis un thème par défaut

### Couleurs pas visibles
- Vérifiez le contraste avec l'arrière-plan
- Essayez des couleurs plus foncées pour le texte
- Utilisez le sélecteur de couleur pour ajuster

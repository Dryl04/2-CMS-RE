# Démarrage Rapide - Système de Thèmes

## Problème : Le gestionnaire de thèmes est vide

Si vous voyez le message "No Themes Found" ou "Theme Table Not Found", suivez ces étapes :

## Solution 1 : Initialisation Automatique (Recommandé)

1. Connectez-vous à votre application
2. Allez dans **Thèmes visuels** depuis le tableau de bord
3. Si vous voyez "No Themes Found", cliquez sur le bouton **"Initialize Default Themes"**
4. Attendez quelques secondes que les thèmes soient créés
5. Les 5 thèmes modernes apparaîtront automatiquement

## Solution 2 : Configuration Manuelle via SQL

Si l'initialisation automatique ne fonctionne pas ou si la table n'existe pas :

### Étape 1 : Créer la table themes

1. Ouvrez votre [Supabase Dashboard](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor** (dans le menu de gauche)
4. Cliquez sur **New query**
5. Ouvrez le fichier `create_themes_system.sql` à la racine du projet
6. Copiez tout son contenu
7. Collez-le dans l'éditeur SQL de Supabase
8. Cliquez sur **Run** (ou Ctrl/Cmd + Enter)

### Étape 2 : Vérifier l'installation

1. Retournez dans votre application
2. Allez dans **Thèmes visuels**
3. Vous devriez voir 5 thèmes prédéfinis :
   - Modern Professional
   - Bold & Dynamic
   - Minimalist Elegance
   - Dark Mode Premium
   - Ocean Breeze

## En cas de problème

### Erreur : "relation themes does not exist"
- La table n'a pas été créée
- Suivez la Solution 2 ci-dessus

### Erreur : "permission denied"
- Vérifiez que vous êtes connecté avec un compte authentifié
- Les politiques RLS nécessitent une authentification

### Les thèmes ne s'affichent pas après l'initialisation
1. Rafraîchissez la page (F5)
2. Vérifiez la console du navigateur pour les erreurs (F12)
3. Vérifiez que les données ont été insérées dans Supabase :
   - Dashboard > Table Editor > themes
   - Vous devriez voir 5 lignes

### Vérifier la structure de la base de données

Pour vérifier que tout est correctement configuré, allez dans Supabase Dashboard > Table Editor :

**Table `themes` devrait avoir ces colonnes :**
- id (uuid)
- name (text)
- description (text)
- colors (jsonb)
- typography (jsonb)
- spacing (jsonb)
- components (jsonb)
- user_id (uuid, nullable)
- is_default (boolean)
- created_at (timestamptz)
- updated_at (timestamptz)

**Table `page_templates` devrait avoir cette colonne supplémentaire :**
- theme_id (uuid, nullable)

## Support

Si vous rencontrez toujours des problèmes :
1. Vérifiez les logs de la console navigateur (F12)
2. Vérifiez les logs Supabase dans Dashboard > Logs
3. Assurez-vous que votre fichier `.env` contient les bonnes clés Supabase

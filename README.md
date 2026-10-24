# EduSign_codex

Un espace de découverte de la **langue des signes française (LSF)** pour les élèves et leurs parents : regarder, essayer, partager.

## Le produit

- Interface en français et en anglais : accueil, leçons, activités, assistant, carnet et bilan.
- Deux ateliers — alphabet et nombres — avec vidéos YouTube LSF, crédits et liens directs vers les créateurs.
- Un mini-quiz de trois questions après chaque vidéo : correction expliquée, nouvel essai et résultats enregistrés dans Supabase pour les comptes connectés.
- Recherche et filtres par thème, objectifs simples et conseils aux parents.
- Authentification et données d’apprentissage dans Supabase : e-mail et intégration Google OAuth (activation du fournisseur requise).
- Aperçus des vidéos dans les cartes de cours, pages Formules, À propos et Communauté avec partage de leçons.
- Assistant en français ou en anglais, à l’écrit et par la voix lorsque le service IA est disponible.

Une activité terminée est une **déclaration de pratique**, pas une évaluation des gestes. Le lecteur détecte la fin de la vidéo via l’API IFrame YouTube pour ouvrir le quiz ; un bouton permet aussi de l’ouvrir après un visionnage externe. Le temps passé sur YouTube n’est pas mesuré. Les scores des quiz portent sur la compréhension et les exercices de lettres/nombres, pas sur la qualité des gestes. Un compte représente un carnet partagé, sans profils enfants séparés.

## Architecture

| Dossier | Rôle |
| --- | --- |
| `edusign-next/` | Next.js / React / TypeScript : interface, sessions Supabase, accès aux données et API |
| `ai-service/` | FastAPI : assistant, transcription, synthèse vocale, bilan et modèle de reconnaissance historique |
| `docs/EDUSIGN_PLAN.md` | État du projet, choix de produit et travail restant |

L’ancienne bibliothèque vidéo et les poids du modèle sont conservés. Ils ne sont pas utilisés comme démonstrations LSF dans le parcours public. La reconnaissance n’a pas été entraînée ou validée pour la LSF.

## Démarrer

Dans `edusign-next/` :

```sh
npm install
cp .env.local.example .env.local
# Renseigner les valeurs dans le fichier local, jamais dans Git.
npm run config:check
npm run db:setup
npm run db:seed
npm run dev -- --port 3100
```

Si votre fichier `.env` est déjà configuré, conservez-le : `.env.local` prend priorité. Utilisez la chaîne exacte du **Transaction pooler** fournie par Supabase. Définissez les URL de redirection dans Supabase pour la connexion et la récupération de mot de passe.

Dans `ai-service/` :

```sh
python3.10 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env
.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8100
```

`OPENAI_API_KEY` reste côté serveur. Les fonctions vocales utilisent actuellement les adaptateurs existants ; leur migration vers les nouveaux modèles est un chantier séparé. Sans service IA, les leçons et activités restent accessibles.

## Vérifier

Dans `edusign-next/` :

```sh
npm run typecheck
npm run lint
npm test
npm run build
node scripts/smoke-auth.mjs
node scripts/smoke-http.mjs
node scripts/smoke-locales.mjs
node scripts/smoke-product-pages.mjs
node scripts/verify-lsf-links.mjs
# Test connecté (compte temporaire, service IA démarré) :
node scripts/verify-learner-journey.mjs --temporary-user
# Confirmation d’inscription, sans envoi d’e-mail :
node scripts/verify-signup.mjs --temporary-user
```

Les tests HTTP nécessitent le serveur sur le port 3100. Les tests `verify-auth.mjs --temporary-user` et `verify-ownership.mjs --temporary-users` créent des comptes temporaires puis les suppriment ; ils doivent viser un projet de test. La commande de seed publie les deux ateliers alphabet/nombres et dépublie les autres cours connus, sans supprimer les utilisateurs ni leur historique.

## Ressources et attribution

Les vidéos sont intégrées depuis leurs publications d’origine, sans téléchargement ni réhébergement. Les auteurs sont crédités sur chaque leçon : [MAE Langue des Signes](https://www.maelanguedessignes.com/didactique-lsf) et [Dico Plus LSF](https://karinevermot.wixsite.com/website-1/post/lsf-point-par-point-les-nombres). Le catalogue versionné se trouve dans `edusign-next/src/lib/data/lsf-catalog.json`.

Les liens de découverte incluent [Le Dico Elix](https://dico.elix-lsf.fr/) et [LSF DICO — INJS de Metz](https://lsfdico.injs-metz.fr/). EduSign n’est pas affilié à ces organismes.

Le dépôt cible est [EduSign_codex](https://github.com/amithkm9/EduSign_codex). Les règles du hackathon, l’hébergement et les conditions de diffusion restent à confirmer avant publication.

## Développement avec Codex

Les instructions du dépôt sont dans [AGENTS.md](AGENTS.md). Le sélecteur FR / EN mémorise la langue dans un cookie ; les vidéos restent en LSF. Les traductions de l’interface sont locales et ne nécessitent aucun appel IA. Ce dépôt démarre un nouvel historique Git à partir du code EduSign existant. Les commits d’import organisent le projet actuel et ne représentent pas les dates de création initiale de chaque fonctionnalité.

## Comptes et nouvelles pages

[Configurer Google et l’e-mail](docs/AUTH_SETUP.md) : les comptes restent dans Supabase. Le fournisseur Google doit être activé dans le tableau de bord ; un SMTP de production et un test de délivrabilité restent nécessaires pour l’inscription publique par e-mail.

`/packages` présente la découverte gratuite, le tutorat personnel et l’abonnement. Les deux dernières offres sont en préparation, sans prix inventé, réservation ou paiement. `/about` présente la mission et l’approche du projet. `/community` propose des activités à partager et un outil de partage de leçons ; ce n’est pas encore un forum de membres. Les aperçus des cours proviennent des vidéos LSF originales sur YouTube et gardent les crédits des créateurs.

# Déployer EduSign

Ce document décrit la configuration à préparer. Aucun déploiement n’est effectué automatiquement.

## Base et authentification Supabase

Depuis `edusign-next/`, avec les valeurs locales renseignées :

```sh
npm run config:check
npm run db:setup
npm run db:seed
npm run db:verify
```

La base utilise le Transaction pooler fourni dans le panneau Connect. Pour les migrations, `MIGRATION_DATABASE_URL` permet une connexion dédiée si nécessaire. Le seed publie les ateliers LSF et dépublie les anciens cours sans supprimer leur historique.

Configurer dans Supabase le Site URL, les URL de callback/récupération et l’envoi des emails. Vérifier une inscription réelle, la confirmation, la connexion et la récupération du mot de passe sur le domaine déployé.

## Service Python

Déployer le Dockerfile de `ai-service/` sur un hébergeur compatible. Définir `OPENAI_API_KEY` et `INTERNAL_API_TOKEN` dans les secrets de l’hébergeur. Le service écoute sur le port 8100 par défaut. Vérifier `/health` puis les endpoints authentifiés depuis le serveur Next.

Le modèle de reconnaissance historique reste conservé pour expérimentation ; il n’est pas utilisé pour évaluer les ateliers LSF. Les adaptateurs OpenAI actuels doivent être revus et testés avant une diffusion publique durable.

## Application Next.js

Définir `edusign-next` comme dossier racine de l’application sur l’hébergeur.

| Variable | Usage |
| --- | --- |
| `SUPABASE_URL` | URL du projet |
| `SUPABASE_PUBLISHABLE_KEY` | Clé publique, exposée au navigateur |
| `DATABASE_URL` | Connexion PostgreSQL via pooler, côté serveur |
| `NEXT_PUBLIC_SITE_URL` | Domaine HTTPS canonique |
| `AI_SERVICE_URL` | URL du service Python |
| `INTERNAL_API_TOKEN` | Secret partagé avec le service Python |

`SUPABASE_SECRET_KEY` sert aux scripts administratifs et aux tests temporaires ; elle ne doit jamais être exposée au navigateur. Les vidéos LSF restent hébergées par leurs créateurs sur YouTube : aucun upload des médias historiques n’est requis pour ce parcours.

## Avant publication

Exécuter les contrôles du README, refaire l’audit des dépendances et vérifier le parcours sur desktop et mobile. Tester les huit liens vidéo, le fonctionnement du lecteur externe, les emails, l’isolation des comptes, l’enregistrement des activités, et les erreurs réseau. Les règles du hackathon et les conditions de réutilisation des ressources doivent être confirmées.

## Google et e-mail

Suivre [AUTH_SETUP.md](docs/AUTH_SETUP.md) pour les clients Google, les URL de callback, le SMTP et les vérifications de connexion. Les identifiants Google OAuth se configurent dans Supabase, jamais dans le client Next.js. Vérifier les fournisseurs avec `node scripts/check-auth-providers.mjs`.

Les images de cours utilisent le service d’optimisation Next.js avec le domaine autorisé `i.ytimg.com`. Le serveur de production doit pouvoir joindre ce domaine. Les vidéos restent hébergées chez leurs créateurs.

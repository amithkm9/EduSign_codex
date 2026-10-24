# EduSign_codex

Un espace de découverte de la **langue des signes française (LSF)** pour les élèves et leurs parents : regarder, essayer, partager.

## Le produit

- Interface en français et en anglais : accueil, leçons, activités, assistant, carnet et bilan.
- Deux ateliers — alphabet et nombres — avec vidéos YouTube LSF, crédits et liens directs vers les créateurs.
- Un défi caméra après chaque vidéo : capture, replay et analyse expérimentale par le modèle historique pour A/B/C et 1/2/3. Correspondance, différence ou résultat incertain ; ce modèle n’est pas validé pour la LSF.
- Quiz de compréhension facultatif : correction expliquée, nouvel essai et résultats Supabase.
- Suivi vidéo : temps de lecture visible, couverture unique et dernière position, inclus dans le bilan connecté.
- Recherche et filtres par thème, objectifs simples et conseils aux parents.
- Authentification et données d’apprentissage dans Supabase : e-mail et intégration Google OAuth (activation du fournisseur requise).
- Aperçus des vidéos dans les cartes de cours, pages Formules, À propos et Communauté avec partage de leçons.
- Assistant en français ou en anglais, à l’écrit et par la voix lorsque le service IA est disponible.

Une activité terminée est une **déclaration de pratique**, pas une évaluation des gestes. Le lecteur détecte la fin de la vidéo via l’API IFrame YouTube pour ouvrir le défi caméra. La lecture active dans l’onglet visible est estimée et enregistrée ; les pauses, le buffering, les sauts et le visionnage sur le site YouTube sont exclus. Ce suivi ne mesure pas l’attention. Les scores des quiz portent sur la compréhension et les exercices de lettres/nombres, pas sur la qualité des gestes. Un compte représente un carnet partagé, sans profils enfants séparés.

## Architecture

| Dossier | Rôle |
| --- | --- |
| `edusign-next/` | Next.js / React / TypeScript : interface, sessions Supabase, accès aux données et API |
| `ai-service/` | FastAPI : assistant, transcription, synthèse vocale, bilan et modèle de reconnaissance historique |
| `docs/EDUSIGN_PLAN.md` | État du projet, choix de produit et travail restant |

L’ancienne bibliothèque vidéo et les poids du modèle sont conservés. Ils ne sont pas utilisés comme démonstrations LSF dans le parcours public. Le modèle historique est connecté uniquement pour la démonstration, à la demande du propriétaire. L’ordre de ses six classes est supposé ; sa reconnaissance n’a pas été validée pour la LSF. Les résultats démo ne deviennent pas des notes dans le bilan.

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

`OPENAI_API_KEY` reste dans le fichier ignoré `ai-service/.env`. Redémarrez le service après un changement de clé. Les modèles sont configurables via `OPENAI_TUTOR_MODEL` (gpt-4o-mini), `OPENAI_TRANSCRIBE_MODEL` (gpt-transcribe) et `OPENAI_TTS_MODEL` (gpt-4o-mini-tts).

L’assistant propose des programmes courts, des questions interactives corrigées côté serveur et des liens LSF vérifiés. La conversation reste dans la session de la page ; FR / EN conserve les messages et change la langue des nouveaux échanges. Le service reçoit les derniers messages et uniquement des agrégats de progression pour la personnalisation, sans nom ni âge dans le prompt. La connexion fournisseur est vérifiée et mise en cache pendant 60 secondes ; un statut connecté ne garantit pas les quotas de chaque modèle vocal. Les réponses de secours sont explicitement marquées « Réponse guidée ».

La dictée enregistre au maximum 60 secondes, respecte le format réel du navigateur (notamment MP4 sur Safari), puis propose une transcription modifiable avant envoi. Annuler ou masquer l’onglet arrête la capture. Chaque réponse peut être écoutée ; la lecture automatique est facultative. Les exercices guidés ne nécessitent pas de clé OpenAI, mais nécessitent le service Python. Sans service IA, les leçons restent accessibles.

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
node scripts/verify-tutor.mjs --temporary-user
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

`/packages` présente la découverte gratuite, le tutorat personnel et l’abonnement. Les offres Standard et Tuteur personnel sont en préparation. Leurs prix mensuels et le contact écoles sont configurables côté serveur (`EDUSIGN_STANDARD_MONTHLY_EUR`, `EDUSIGN_TUTOR_MONTHLY_EUR`, `EDUSIGN_SCHOOLS_EMAIL`) ; le Tuteur personnel est affiché à 99 €/mois et le contact écoles est amithkm9@gmail.com. Le prix Standard reste à confirmer. Aucun achat ni paiement n’est activé. `/about` présente la mission et l’approche du projet. `/community` propose des activités à partager et un outil de partage de leçons ; ce n’est pas encore un forum de membres. Les aperçus des cours proviennent des vidéos LSF originales sur YouTube et gardent les crédits des créateurs.

Tests du coach côté Python : `.venv/bin/python -m unittest discover -s tests`. Vérification réelle facultative et facturée par le fournisseur : `.venv/bin/python tests/verify_live_coach.py --live-api` depuis `ai-service/`. Elle utilise uniquement des exemples synthétiques en français et anglais, vérifie les réponses et suivis, puis synthèse → transcription → réponse → synthèse. Un mode de secours ne compte jamais comme un succès IA.

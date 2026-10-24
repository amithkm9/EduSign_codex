# EduSign — plan et état du produit

Mis à jour le 24 octobre 2026. Public confirmé : élèves et parents qui les accompagnent. Langues d’interface : français et anglais. Langue enseignée dans les ressources : LSF. Dépôt cible : https://github.com/amithkm9/EduSign_codex.git.

## Réalisé

- Supabase : connexion au pooler, schéma, profils automatiques, politiques de propriété et données initiales. Authentification testée avec comptes temporaires ; isolation entre deux comptes et répétabilité du setup vérifiées.
- Refonte visuelle : bleu, crème, pêche, jaune et vert doux ; cartes thématiques, navigation responsive et actions lisibles.
- Parcours bilingue français / anglais : accueil, catalogue avec recherche/filtres, leçons, coin parents, ressources, atelier libre, assistant, carnet et bilan.
- Huit ateliers LSF publiés par MAE Langue des Signes et Dico Plus LSF, avec liens YouTube directs et crédits. Disponibilité vérifiée via les métadonnées YouTube. Le visionnage complet et la qualité pédagogique nécessitent une revue par une personne compétente en LSF.
- L’ancien catalogue est dépublié sans suppression de l’historique. Les identifiants LSF sont distincts afin de ne pas transférer une progression historique vers une nouvelle leçon.
- L’assistant français / anglais renvoie vers des ressources LSF sélectionnées ; il ne présente pas la bibliothèque historique comme LSF. La transcription reçoit le code de langue choisi, `fr` ou `en`.
- Nettoyage des composants non référencés, de l’ancien import Mongo et des captures obsolètes. Le dossier actif est `edusign-next` ; les instructions Markdown correspondent à ce nom.

## Sens des données

« J’ai pratiqué cette activité » enregistre une déclaration. Ce n’est pas une évaluation du geste. Le lecteur YouTube externe ne fournit pas de mesure de temps dans cette version. L’atelier libre garde son pense-bête uniquement sur la page. Le compte est partagé par son utilisateur ; il n’existe pas encore de profils enfants indépendants.

Les vidéos historiques et les poids du modèle sont conservés mais retirés du parcours pédagogique LSF. Leur langue et leurs performances doivent être évaluées avant une éventuelle réutilisation.

## Vérifications et limites

Les commandes sont documentées dans le README. Les tests Supabase temporaires suppriment leurs comptes à la fin. Ne jamais afficher les clés serveur ni les mettre dans `NEXT_PUBLIC_*`. Les identifiants locaux sont ignorés par Git.

La revue visuelle dans un vrai navigateur dépend de l’autorisation d’accès à Chrome, refusée lors de la première livraison. Les liens de confirmation et de récupération doivent être testés avec la configuration SMTP et les URL déployées. Les contrôles de code et HTTP ne remplacent pas ces essais.

La pile conserve des dépendances avec sept avis de sécurité modérés après les mises à jour de la première livraison ; aucun avis élevé ou critique n’était présent lors de ce dernier audit. Refaire l’audit avant publication.

## Suite

1. Revue visuelle desktop/mobile et parcours avec un parent et un élève.
2. Validation LSF des vidéos, des activités et des textes par une personne compétente.
3. Fiabilisation de l’assistant : modèle configurable, évaluation des réponses françaises et budget d’usage.
4. Migration des adaptateurs vocaux actuels vers les modèles disponibles, tests du microphone et des sorties audio françaises.
5. Historique de conversations, préférences et éventuels profils enfants, après définition précise du besoin.
6. Déploiement, email réel, test des liens et démonstration reproductible.

## Hackathon

Le lien de l’événement et son échéance restent à fournir. Les règles sur le code préexistant, l’usage de Codex, les licences, la visibilité du dépôt et le format de démonstration ne sont pas encore vérifiées. Aucun déploiement ni push n’a été effectué pendant les deux premières livraisons.

## Vérification de la refonte

17 tests Node et 6 tests Python réussis. Les huit vidéos sont accessibles via les métadonnées YouTube ; une ancienne vidéo scolaire indisponible a été remplacée. Les contrôles HTTP des pages françaises et anglaises, des liens historiques et des protections passent. Un compte temporaire a vérifié les pages connectées dans les deux langues, l’enregistrement d’une activité dans Supabase, le renvoi d’une leçon LSF par le tuteur et les bilans français et anglais. Ce compte et ses données ont été supprimés. La compilation de production passe. Les interactions visuelles et le microphone réel restent à tester dans le navigateur.

## Bilinguisme et environnement Codex

Sélecteur FR / EN persistant, rendu initial et attribut HTML lang adaptés au cookie, traductions locales, recherche dans les deux langues et assistant LSF dans la langue choisie. L’ancien réglage local d’un autre agent a été retiré ; AGENTS.md décrit le travail avec Codex. Le code existant est importé dans EduSign_codex avec un nouvel historique, à la demande du propriétaire. L’ancien historique est sauvegardé localement et le dépôt précédent reste intact. Les nouveaux commits utilisent leurs dates réelles d’import. La clé OpenAI locale a été rejetée lors de la vérification de traduction ; les traductions locales et les orientations LSF sans IA restent utilisables.

## Comptes, visuels et pages produit — 24 octobre 2026

- Bouton Google sur connexion et inscription, PKCE, échanges de session et retour à la destination interne. Un fournisseur désactivé et une annulation sont expliqués dans la langue choisie. Le fournisseur Google reste à activer dans Supabase ; voir AUTH_SETUP.md.
- L’inscription e-mail conserve la destination et la langue choisies. La confirmation e-mail reste activée. Tester l’envoi SMTP réel avant une ouverture publique.
- Aperçus des vidéos LSF sur les cartes et le lecteur, images optimisées et repli en cas d’indisponibilité. Les auteurs restent crédités.
- Page Formules : gratuit, tuteur personnel et abonnement. Les offres payantes restent « à venir » en attendant les prix, les intervenants, les avantages et le paiement.
- Page À propos enrichie : mission, principes, ressources et rôle limité de l’assistant IA.
- Page Communauté : activités de groupe, choix d’une leçon et partage natif ou copie du lien, avec repli manuel. Aucun faux membre, témoignage, message ou compteur de communauté.
- Navigation et textes des nouvelles pages dans les deux langues. Les anciens renvois de /packages et /community sont remplacés par leurs pages dédiées.

Vérification de ces ajouts : compilation de production, TypeScript, lint et 22 tests Node réussis. Les pages produit sont rendues en français et en anglais. Les formulaires Google gèrent le fournisseur désactivé dans les deux langues ; les annulations et erreurs OAuth ne quittent pas l’application. Les huit aperçus passent par l’optimiseur d’images. Un compte d’inscription temporaire a vérifié le refus avant confirmation, la confirmation, le profil, la connexion e-mail et le nettoyage, sans envoi d’e-mail. La configuration locale NEXT_PUBLIC_SITE_URL manquante a été complétée avec localhost:3100. Le build signale un avertissement de compatibilité Edge provenant du SDK Supabase ; les contrôles HTTP des sessions passent. La revue visuelle et le partage natif nécessitent encore un navigateur autorisé.

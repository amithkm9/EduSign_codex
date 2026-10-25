# EduSign — plan et état du produit

Positionnement confirmé le 25 octobre 2026 : plateforme d’apprentissage de la langue des signes française enrichie par l’intelligence artificielle, destinée aux enfants de 3 à 15 ans et à leurs parents. Langues d’interface : français et anglais. Langue enseignée dans les ressources : LSF. Dépôt cible : https://github.com/amithkm9/EduSign_codex.git. L’historique d’implémentation ci-dessous conserve ses dates d’origine.

## Réalisé

- Supabase : connexion au pooler, schéma, profils automatiques, politiques de propriété et données initiales. Authentification testée avec comptes temporaires ; isolation entre deux comptes et répétabilité du setup vérifiées.
- Refonte visuelle : bleu, crème, pêche, jaune et vert doux ; cartes thématiques, navigation responsive et actions lisibles.
- Parcours bilingue français / anglais : accueil, catalogue avec recherche/filtres, leçons, coin parents, ressources, vidéo et quiz, assistant, carnet et bilan.
- Deux ateliers LSF (alphabet et nombres) publiés par MAE Langue des Signes et Dico Plus LSF, avec liens YouTube directs et crédits. Disponibilité vérifiée via les métadonnées YouTube. Le visionnage complet et la qualité pédagogique nécessitent une revue par une personne compétente en LSF.
- L’ancien catalogue est dépublié sans suppression de l’historique. Les identifiants LSF sont distincts afin de ne pas transférer une progression historique vers une nouvelle leçon.
- L’assistant français / anglais renvoie vers des ressources LSF sélectionnées ; il ne présente pas la bibliothèque historique comme LSF. La transcription reçoit le code de langue choisi, `fr` ou `en`.
- Nettoyage des composants non référencés, de l’ancien import Mongo et des captures obsolètes. Le dossier actif est `edusign-next` ; les instructions Markdown correspondent à ce nom.

## Sens des données

« J’ai pratiqué cette activité » enregistre une déclaration. Ce n’est pas une évaluation du geste. Le lecteur YouTube externe ne fournit pas de mesure de temps dans cette version. Chaque vidéo mène à un quiz de compréhension de trois questions. Les résultats des utilisateurs connectés sont calculés côté serveur et enregistrés dans Supabase ; les essais anonymes restent sur la page. Les reprises d’enregistrement utilisent un identifiant stable pour éviter les doublons. Le compte est partagé par son utilisateur ; il n’existe pas encore de profils enfants indépendants.

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

## Accueil et présentation — 24 octobre 2026

L’accueil adopte une typographie plus sobre, une hiérarchie claire et un aperçu interactif de trois leçons LSF. Les sections expliquent le parcours, les ressources, l’accompagnement des parents et le rôle de l’assistant. Une FAQ et des appels à l’action distincts permettent d’explorer sans compte ou de créer un carnet. L’en-tête, les contrôles mobiles et le pied de page sont harmonisés dans les deux langues. Les valeurs affichées proviennent du catalogue, sans témoignages ou compteurs inventés.

Compilation, TypeScript, lint, 22 tests Node et contrôles HTTP français/anglais réussis. La revue visuelle desktop/mobile et les interactions du sélecteur d’aperçu restent à vérifier dans un navigateur autorisé.

## Alphabet, nombres et quiz — 24 octobre 2026

Le parcours public se concentre désormais sur deux vidéos : l’alphabet manuel de MAE et les nombres de Dico Plus LSF. Les autres ateliers sont dépubliés dans Supabase et leurs URL renvoient au catalogue ; les données historiques restent conservées. Accueil, cartes, communauté, formules et suggestions du tuteur suivent ce périmètre.

Chaque vidéo ouvre automatiquement un mini-quiz via l’événement de fin de l’[API YouTube IFrame](https://developers.google.com/youtube/iframe_api_reference). Le lecteur reste chargé au clic uniquement. Le bouton « Passer au quiz » permet de continuer après un visionnage externe ou en cas de lecteur bloqué. Ouvrir le quiz met le lecteur en pause ; revoir la vidéo n’efface pas les réponses.

Trois questions par atelier, choix au clavier, correction après chaque réponse, explications consultables après le résultat et nouvel essai. Les questions portent sur la compréhension, l’ordre des lettres et les quantités, sans prétendre reconnaître ou évaluer les gestes. Sources : [dactylologie MAE](https://www.maelanguedessignes.com/didactique-lsf) et [nombres Dico Plus](https://karinevermot.wixsite.com/website-1/post/lsf-point-par-point-les-nombres). Les contenus restent à relire avec une personne compétente en LSF.

Les résultats connectés utilisent `quiz_attempts`. Le serveur recalcule les scores à partir des choix, refuse les réponses invalides et déduplique les reprises grâce à l’identifiant d’essai. Les scores envoyés par le navigateur ne sont pas utilisés. Modifier les questions d’un quiz publié nécessite un nouvel identifiant de version dans `src/lib/quiz/quizzes.json`. Aucune migration de schéma. Le bilan affiche les résultats par leçon et son cache vérifie que les données n’ont pas changé.

Vérification : compilation, TypeScript, lint, 26 tests Node et 6 tests Python réussis. Métadonnées des deux vidéos accessibles ; contrôles HTTP français/anglais, redirections et protections réussis. Un compte temporaire a vérifié les scores recalculés malgré un score client falsifié, les reprises concurrentes sans doublon, les nouveaux essais, les données invalides et le bilan actualisé ; ce compte et ses données ont été supprimés. Le catalogue Supabase est synchronisé. La lecture réelle de YouTube, l’événement de fin et la revue visuelle restent à vérifier dans un navigateur autorisé ; les tests HTTP ne les couvrent pas.

## Navigation, lecture et pratique caméra — 24 octobre 2026

Accueil ajouté à la navigation desktop/mobile. Formules gratuites, Standard mensuel et Tuteur personnel mensuel, avec section écoles sur devis. Les montants et l’adresse publique de contact sont en attente du propriétaire ; les variables serveur sont prêtes, sans coordonnées ni prix inventés.

Le suivi distingue lecture active visible en millisecondes, intervalles uniques regardés, durée de la vidéo et dernière position. Échantillonnage à la seconde, synchronisation toutes les 15 secondes et lors des pauses/départs, identifiants d’événements pour dédupliquer les reprises. Pauses, buffering, arrière-plan et grands sauts exclus. Les événements YouTube enrichissent Supabase et le bilan par leçon ; les déclarations manuelles restent distinctes. L’ancien calcul « 15 signes appris par activité terminée » a été retiré. La mesure provient du navigateur : elle ne prouve ni attention, ni présence, ni maîtrise. Les fermetures hors ligne peuvent perdre la dernière tranche non livrée.

Le défi caméra devient l’activité principale après la vidéo. Capture locale de trois secondes pour A/B/C et 1/2/3, replay, nouvel essai, arrêt des pistes après capture, fermeture ou arrière-plan. Le quiz de compréhension reste facultatif. Aucun média n’est téléversé. Le classifieur historique a six étiquettes codées en dur et aucun fichier original de correspondance des classes ; sa validité pour la LSF n’est pas établie. L’API publique renvoie donc un état non évalué au lieu d’un faux verdict.

Pour terminer la correction automatique : obtenir des données/modèles LSF avec correspondance de classes vérifiée, évaluer sur des personnes absentes de l’entraînement et choisir un seuil d’abstention à partir de cette évaluation. Les gestes hors vocabulaire et les mains mal visibles doivent produire « indéterminé ». Ne pas utiliser le score de compréhension comme score de gestes.

Références techniques : [API YouTube IFrame](https://developers.google.com/youtube/iframe_api_reference), [capture caméra getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia). Les tests de calcul et HTTP ne remplacent pas une vérification de YouTube et de la caméra dans un navigateur autorisé.

Validation de cette livraison : TypeScript, lint, build de production, 29 tests Node et 7 tests Python réussis. Le parcours connecté temporaire vérifie la persistance du temps, la couverture sans doublons, les valeurs invalides, les reprises réseau, le bilan enrichi et l’abstention du point d’entrée de reconnaissance. Les contrôles HTTP FR/EN et les protections passent. Deux comptes temporaires ont vérifié la confidentialité des événements et le refus d’écritures directes ; la répétition du setup/seed conserve les données. Tous les comptes de test ont été supprimés. Lecture YouTube et capture webcam réelles restent non vérifiées dans le navigateur.

Recherche complémentaire de modèle : le [prototype MonSigne](https://github.com/AlexisLasselin/Algosup-Moonshot-Project) annonce un alphabet LSF, mais aucune licence de réutilisation n’est déclarée dans les métadonnées du dépôt consultées et son README ne fournit pas de validation utilisable pour notre évaluation des élèves. Il n’a pas été importé. Le [corpus STVD-LSF de Tours](https://www.dataset-stvd.univ-tours.fr/lsf/index.html) est un corpus de vidéos télévisées soumis à accord d’accès pour la recherche non commerciale, pas un modèle prêt pour ces défis alphabet/nombres. Aucun modèle de remplacement approprié n’a été validé pendant cette livraison.

## Démo du modèle existant et tarif confirmé — 24 octobre 2026

À la demande explicite du propriétaire, le modèle déjà entraîné est connecté au défi caméra pour la démo. Les utilisateurs connectés capturent trois secondes ; jusqu’à 30 JPEG réduits sont envoyés au service IA. Retour : correspondance à la cible, autre prédiction ou résultat incertain. A/B/C et 1/2/3 uniquement. Le modèle n’est pas présenté comme validé pour la LSF, son ordre de classes reste supposé et ses résultats ne sont pas enregistrés comme notes de compétence. Les essais anonymes gardent la capture locale et proposent une connexion pour l’analyse.

Modèle chargé sans compilation, dimensions d’entrée et de sortie vérifiées, inférences sérialisées, tracker réinitialisé entre essais, limites de volume et de fréquence, réponses sans détails d’erreurs internes. Test réel de chargement et passage avant sur tenseur synthétique réussis. La route authentifiée a traité trente images sans main et renvoyé « incertain », sans fabriquer de correspondance. L’exactitude sur de vrais gestes n’est pas validée et l’essai de caméra dans le navigateur reste à faire.

Tuteur personnel : 99 €/mois. Contact écoles : amithkm9@gmail.com, lien mailto visible. Valeurs confirmées utilisées par défaut, surcharge possible via environnement. Prix Standard toujours en attente. Réservation/paiement toujours fermés.

Vérification : TypeScript, lint, build, 29 tests Node et 11 tests Python réussis. Pages FR/EN, tarif et e-mail affichés, protections et parcours Supabase avec modèle réel vérifiés ; compte temporaire supprimé. Poids du modèle inchangés.

## Revue UI et parcours de leçon — 24 octobre 2026

Revue par contrôle du navigateur dans Chrome et Safari. Présentation harmonisée : fond papier chaud, encre bleu nuit, accent vert dans le titre d’accueil, aperçu contrasté, titres moins lourds, cartes et boutons plus lisibles. Navigation principale recentrée sur le parcours d’apprentissage, état actif conservé dans une leçon, liens secondaires disponibles dans le menu mobile et le pied de page. Catalogue, espace personnel, leçons et formules suivent cette hiérarchie. Les boutons partagés acceptent les libellés longs et proposent une cible minimale de 44 px.

La leçon propose trois entrées explicites : regarder, pratiquer, quiz. Le quiz sans caméra est accessible directement. Le passage entre les activités conserve les réponses du quiz ; quitter la pratique démonte le composant caméra et déclenche son nettoyage. Revoir la vidéo ferme l’activité et replace le focus sur le lecteur. Les nouveaux textes et libellés accessibles existent en français et en anglais ; la langue des signes enseignée reste la LSF.

Vérifications visuelles et interactions : accueil français dans Chrome ; accueil anglais, sélection alphabet/nombres, recherche et filtre du catalogue, leçon nombres, réponses et résultat 3/3, conservation de la réponse après changement d’activité, retour à la vidéo et formules dans Safari. Le menu compact, son ouverture/fermeture après navigation et le repli de la mise en page ont été vérifiés au zoom du navigateur, puis le zoom a été rétabli. Ce contrôle ne remplace pas un essai sur téléphone réel. Aucun compte ni résultat d’élève n’a été modifié.

Validation technique : TypeScript, lint, 29 tests Node, 11 tests Python et build de production réussis. Contrôles HTTP des routes, des protections et des deux langues réussis sur le port 3100. Le contrôle HTTP a détecté qu’un chargement global rendait les redirections et erreurs 404 en flux HTTP 200 ; cette limite de chargement a été retirée et les statuts attendus revérifiés. La capture webcam réelle, la fin de lecture YouTube, la persistance connectée et les écrans protégés n’ont pas été revérifiés visuellement dans cette revue.

Retour caméra : le verdict apparaît désormais sur la vidéo, au-dessus des commandes de lecture. Une correspondance affiche une coche et un cadre verts ; une différence utilise l’ambre et un résultat incertain reste neutre. Le message persiste jusqu’au prochain essai, avec annonce accessible et animation désactivée en mode mouvement réduit. La prédiction reste identifiée comme issue du modèle démo. TypeScript, lint, 29 tests Node, 11 tests Python et build réussis ; ce nouvel affichage n’a pas encore été vérifié avec une capture webcam réelle.

## Accueil centré sur l’apprentissage des signes — 24 octobre 2026

Le titre principal nomme explicitement la langue des signes française, avec sa traduction anglaise complète. Une définition de LSF et une explication de la différence entre langue enseignée et langue de l’interface suivent immédiatement le premier écran. L’aperçu présente en grand une véritable vidéo des ressources existantes avec son créateur, deux choix alphabet/nombres et un accès direct à la leçon. Aucune image de signe inventée n’a été ajoutée. Le bouton principal ouvre directement la première leçon ; le second rejoint les deux ateliers. Les sections expliquent les objectifs débutants, puis le parcours vidéo, pratique caméra et quiz, avec une présentation plus concrète et des cartes harmonisées.

Revue Safari : accueil FR/EN, changement d’aperçu, lien vers les ateliers et ouverture de la première leçon vérifiés. Mise en page empilée vérifiée au zoom du navigateur, puis zoom rétabli ; aucun téléphone physique testé. TypeScript, lint, 29 tests Node, 11 tests Python, build et contrôles HTTP des routes, langues et protections réussis. Les assertions de contenu d’accueil suivent le nouveau titre explicite.

## Coach interactif — 24 octobre 2026

L’assistant dispose maintenant d’une interface de coaching bilingue : quatre entrées, plans courts, suggestions contextuelles, ressources sélectionnées et trois questions de compréhension corrigées côté serveur. Une bonne réponse reçoit un encadré vert ; une erreur reçoit une explication. Les échanges restent en mémoire de la page et survivent au changement FR / EN. Ils ne sont pas ajoutés au bilan de maîtrise des signes.

Les réponses OpenAI utilisent un schéma structuré et des ressources autorisées. Les messages de secours sont identifiés comme tels. La vérification de connexion contrôle l’accès au modèle, pas seulement la présence d’une clé. Les modèles texte, transcription et voix sont configurables. La dictée conserve le format réel (WebM/MP4), s’arrête à 60 secondes, permet d’annuler et propose une transcription modifiable avant l’envoi au coach. Chaque réponse dispose d’une lecture vocale ; la lecture automatique reste facultative.

Validation : typecheck, lint, 33 tests web, build de production et 20 tests Python passent. Le contrôle connecté français/anglais utilise un compte temporaire supprimé après le test. L’API OpenAI est désormais opérationnelle après redémarrage : réponses, suivi contextuel, synthèse, transcription et chaîne voix → coach → voix vérifiés dans les deux langues avec des phrases synthétiques. Revue Chrome : disposition bureau, exercice correct vert, correction en français après changement de langue sans perte de conversation, lecture audio et disposition compacte à 300 % de zoom. La capture d’un microphone physique et les appareils mobiles réels restent à vérifier. L’exactitude pédagogique sur un large corpus de questions LSF reste un travail d’évaluation, pas une garantie fournie par ces tests.

## Assistant vidéo et studio bilingue — 24 octobre 2026

Le propriétaire a demandé l’utilisation de la bibliothèque locale : 354 WebM conservés, 354 dérivés MP4 H.264 produits et 708 objets copiés dans le bucket Supabase privé `sign-demonstrations`. Recherche déterministe par mots, alias et demandes de parents, sans dépendance au modèle de conversation. La collection importée n’est pas validée comme LSF ; elle est séparée de six clips LSF Elix sous CC BY-SA 4.0, avec crédits et sources. Les leçons LSF sont inchangées.

Interface remplacée par un studio : démonstration dédiée à gauche, guide et saisie à droite, bibliothèque dépliable, ralenti, boucle et signes déjà explorés. Un seul clip actif. Français ou anglais détecté depuis le message, indépendamment de l’interface ; « bonjour » produit une réponse française et uniquement le clip correspondant. Les titres et la synthèse vocale suivent cette langue. Les mots partagés et ambigus utilisent la langue de l’interface.

Validation : 36 tests Node et 33 tests Python, TypeScript, lint et build réussis. Téléversement des 354 paires confirmé sans erreur ; contrôles connectés des empreintes, du seek et de la confidentialité réussis. API vocale réelle vérifiée avec les mots synthétiques Bonjour et Hello et la langue d’interface opposée. Les essais sur microphone physique et téléphone réel restent à réaliser.

## Palette commune — 24 octobre 2026

Toutes les pages utilisent désormais les mêmes tokens : `primary` pour les actions bleues et les états sélectionnés, `navy`/`media` pour les surfaces vidéo sombres, `background`/`card`/`secondary`/`muted` pour les fonds, `foreground`/`muted-foreground` pour le texte. Les sections décoratives vertes, roses, pêche et jaunes sont remplacées par les surfaces communes. Les retours corrects gardent `success` en vert ; avertissements et essais à revoir utilisent `warning` en ambre. Les couleurs officielles du bouton Google sont conservées.

Les valeurs sont centralisées dans `edusign-next/src/app/globals.css` et exposées par `tailwind.config.ts`. Pour les nouvelles pages, réutiliser ces tokens plutôt qu’ajouter des couleurs hexadécimales locales. Les graphiques utilisent déjà `primary`. La mise en page et les comportements bilingues du studio sont conservés.

Validation : TypeScript, lint, 36 tests Node, 33 tests Python et build de production réussis. Contrôle HTTP des pages produit réussi ; accueil et feuille de style répondent en 200 sur le port 3100. Revue visuelle Safari de l’accueil, du guide parents et des formules : fonds, boutons, titres et cartes cohérents. Les écrans authentifiés, le mode sombre et les appareils mobiles n’ont pas fait l’objet d’une nouvelle revue visuelle pour ce changement de couleurs.


## Séquences vidéo et routage du coach — 25 octobre 2026

Les courtes expressions prises en charge, notamment « good morning », renvoient les clips Good puis Morning dans la bibliothèque importée. Le lecteur reste dans le panneau latéral et passe au mot suivant à la fin du clip, sans fenêtre modale. Des boutons permettent de choisir un mot ou de relancer la séquence. Les clips gardent leur étiquette de langue non vérifiée ; la collection LSF conserve la correspondance exacte avec Bonjour. Les mots manquants sont signalés lors des recherches partielles explicites.

Le mode coach est sélectionné au démarrage. Les questions d’apprentissage reconnues depuis la recherche vidéo atteignent aussi le modèle, au lieu de recevoir une erreur de recherche de mot. Les instructions professionnelles actives sont dans `ai-service/app/data/coach_prompt.txt`. La clé existante a produit des réponses réelles en français et en anglais ; aucun changement de clé n’a été nécessaire. Les erreurs du fournisseur sont journalisées par catégorie seulement, sans secrets, avec maintien d’une réponse guidée.

Validation : TypeScript, lint, 36 tests web, 37 tests Python et build de production réussis. Vérifications API réelles FR/EN et suivis contextuels réussis. Le parcours HTTP connecté sur le port 3100 vérifie Good → Morning dans les deux modes, les deux fichiers vidéo et une question d’apprentissage donnant une réponse IA depuis le mode recherche. Le compte temporaire a été supprimé. Revue visuelle Chrome : panneau latéral, mots Good/Morning, lecteur Morning et conversation visibles sans modale. La transition automatique de fin de clip n’a pas été observée de bout en bout par l’agent ; les changements de fenêtre pendant la revue ont interrompu cet essai. Mobile et microphone non revérifiés.

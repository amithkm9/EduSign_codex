# EduSign — application web

Application Next.js 15 / React 19 en français, avec Supabase Auth et PostgreSQL via Drizzle.

Consulter le [README principal](../README.md) pour l’installation et les vérifications, et le [plan du projet](../docs/EDUSIGN_PLAN.md) pour les décisions de produit.

- `src/app` : pages et API authentifiées.
- `src/components` : navigation, catalogue, lecteur YouTube LSF, atelier, assistant et bilan.
- `src/lib/data/lsf-catalog.json` : deux ateliers (alphabet et nombres), leurs sources et leurs activités originales.
- `src/lib/quiz/quizzes.json` : questions versionnées, options et corrections. `grade.mjs` vérifie les réponses côté serveur.
- Le lecteur ouvre le quiz à la fin de la vidéo avec l’API YouTube IFrame ; le bouton « Passer au quiz » reste disponible. Les résultats connectés utilisent `quiz_attempts`, sans migration de schéma.
- `drizzle` : migrations SQL et politiques Supabase.
- `scripts` : configuration, base de données et vérifications.
- `tests` : tests des contrats d’authentification et du catalogue.

`npm run db:seed` synchronise les ateliers LSF sans supprimer les données des apprenants. Les anciens cours restent en base mais sont dépubliés. Les anciennes URL de leçons redirigent vers le nouveau catalogue.

Le lecteur ne charge YouTube qu’après un clic. Un lien direct vers YouTube reste visible si l’intégration est indisponible. La progression est déclarative, sans mesure automatique du visionnage ni score de maîtrise.

## Lecture, caméra et tarifs

`src/lib/video` mesure la lecture active visible à partir des événements et positions YouTube, fusionne les intervalles regardés et synchronise des événements identifiés (reprises sans doublon). La migration additive `drizzle/manual/0005_video_progress.sql` est appliquée par `npm run db:setup`. Les anciens événements sont conservés. Les clients Supabase lisent uniquement leurs propres événements ; les écritures passent par les API authentifiées. Le bilan sépare couverture unique et temps total, relectures comprises. Une panne réseau peut empêcher la livraison de la dernière tranche ; l’interface affiche les erreurs de synchronisation.

Le défi caméra demande une lettre ou un nombre, capture trois secondes localement sans audio et permet de revoir l’essai. Pour un utilisateur connecté, jusqu’à 30 JPEG réduits sont transmis au service IA, traités en mémoire, puis abandonnés. Le point d’entrée authentifié utilise le modèle historique en mode démo : correspondance au signe demandé, différence ou abstention. Les classes A/B/C et 1/2/3 reposent sur l’ordre historique supposé ; ce résultat ne valide pas un geste LSF et n’est pas ajouté aux notes du bilan.

Les montants mensuels et l’adresse écoles sont lus depuis les variables serveur documentées dans `.env.local.example`. Valeurs par défaut confirmées : Tuteur personnel 99 €/mois, écoles amithkm9@gmail.com. Standard reste à confirmer. Aucun checkout n’est activé.

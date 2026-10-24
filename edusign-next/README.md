# EduSign — application web

Application Next.js 15 / React 19 en français, avec Supabase Auth et PostgreSQL via Drizzle.

Consulter le [README principal](../README.md) pour l’installation et les vérifications, et le [plan du projet](../docs/EDUSIGN_PLAN.md) pour les décisions de produit.

- `src/app` : pages et API authentifiées.
- `src/components` : navigation, catalogue, lecteur YouTube LSF, atelier, assistant et bilan.
- `src/lib/data/lsf-catalog.json` : huit ateliers, leurs sources et leurs activités originales.
- `drizzle` : migrations SQL et politiques Supabase.
- `scripts` : configuration, base de données et vérifications.
- `tests` : tests des contrats d’authentification et du catalogue.

`npm run db:seed` synchronise les ateliers LSF sans supprimer les données des apprenants. Les anciens cours restent en base mais sont dépubliés. Les anciennes URL de leçons redirigent vers le nouveau catalogue.

Le lecteur ne charge YouTube qu’après un clic. Un lien direct vers YouTube reste visible si l’intégration est indisponible. La progression est déclarative, sans mesure automatique du visionnage ni score de maîtrise.

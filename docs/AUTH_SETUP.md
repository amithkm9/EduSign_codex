# EduSign — Google et e-mail avec Supabase

La création de compte par e-mail et Google utilise exclusivement Supabase Auth. L’interface est disponible en français et en anglais. Le même bouton Google connecte les comptes existants et crée un compte au premier accès. Le callback utilise PKCE et conserve une destination interne validée.

## État vérifié le 24 octobre 2026

Le projet `ivchgdgplgumhfpnizbe` autorise les inscriptions par e-mail et exige leur confirmation. Le fournisseur Google est désactivé. L’application gère cet état en proposant de continuer par e-mail, sans envoyer l’utilisateur vers une erreur brute de fournisseur.

```sh
cd edusign-next
node scripts/check-auth-providers.mjs
```

Cette commande est en lecture seule et n’affiche aucune clé.

## Activer Google

1. Dans Google Auth Platform, créer un client OAuth de type **Application Web**. Configurer l’audience et l’écran de consentement pour EduSign. En mode test, ajouter les comptes Google autorisés à tester.
2. Ajouter l’origine locale `http://localhost:3100` et, au déploiement, l’origine HTTPS réelle dans les origines JavaScript autorisées.
3. Ajouter l’URI de redirection Google : `https://ivchgdgplgumhfpnizbe.supabase.co/auth/v1/callback`.
4. Dans Supabase → Authentication → Sign In / Providers → Google, activer Google et renseigner le Client ID et le Client Secret. Le secret reste dans Supabase, jamais dans Git, le navigateur ou un fichier `NEXT_PUBLIC_*`.
5. Dans Supabase → Authentication → URL Configuration, définir la Site URL et autoriser `http://localhost:3100/auth/callback` ainsi que `http://localhost:3100/auth/callback?next=**` pour les destinations de retour locales. Ajouter les équivalents exacts de votre domaine de production. L’application valide toujours `next` comme chemin interne.
6. Configurer `NEXT_PUBLIC_SITE_URL` avec l’origine de l’application, sans chemin. En local : `http://localhost:3100`. La configuration `127.0.0.1` doit être cohérente de bout en bout si vous la préférez à `localhost`.
7. Refaire la vérification des fournisseurs, puis tester « Continuer avec Google » depuis la connexion et l’inscription. Vérifier la session, le profil, la déconnexion, l’annulation et le retour à la leçon initiale.

Les clés Supabase de l’application ne permettent pas à elles seules de créer le client Google ou de configurer ce fournisseur. Il faut l’accès au tableau de bord ou un jeton de gestion et un client Google valide.

Documentation officielle : [Google avec Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-google), [URLs de redirection](https://supabase.com/docs/guides/auth/redirect-urls), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [SSR et cookies](https://supabase.com/docs/guides/auth/server-side/creating-a-client).

## Inscription par e-mail

L’inscription demande un prénom, une adresse e-mail et un mot de passe. Si la confirmation est activée, le compte n’est connecté qu’après confirmation. La préférence FR / EN est enregistrée dans les métadonnées d’inscription, et la destination initiale est conservée.

Configurer un fournisseur SMTP de production et vérifier les liens reçus avec une vraie adresse autorisée. Le service d’envoi par défaut de Supabase a des restrictions : l’activation de l’e-mail ne prouve pas la délivrabilité à tous les utilisateurs. Aucun réglage de confirmation ou de sécurité n’est désactivé par l’application.

Vérifier l’inscription, le lien de confirmation, le retour à la leçon, la connexion, la récupération et la déconnexion. Les tests automatisés existants vérifient les comptes temporaires et l’isolation des données ; ils ne remplacent pas un test de délivrabilité SMTP ou le consentement Google réel.

Test de confirmation sans envoyer d’e-mail : `node scripts/verify-signup.mjs --temporary-user`. Il crée un lien d’inscription temporaire via l’API d’administration, vérifie le refus de connexion avant confirmation, confirme le compte et contrôle son profil et sa connexion avant de le supprimer. Il ne valide pas l’envoi SMTP ni le callback PKCE dans un navigateur.

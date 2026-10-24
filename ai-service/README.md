# EduSign — service IA

FastAPI gère le tutorat, la voix et les textes du bilan. Le serveur Next vérifie l’utilisateur et fournit son contexte ; le service Python ne possède pas de connexion à la base.

| Endpoint | Usage |
| --- | --- |
| `GET /health` | État du service et présence de la configuration OpenAI |
| `POST /tutor/chat` | Assistant français et ressources LSF sélectionnées |
| `POST /voice/chat` | Transcription française, assistant et réponse vocale optionnelle |
| `POST /voice/tts` | Lecture d’un texte |
| `POST /report/insights` | Bilan narratif en français |
| `POST /recognize` | Modèle historique connecté au défi caméra en mode démo, sans validation LSF |

`app/lsf.py` traite les demandes françaises avant toute résolution dans la bibliothèque historique. Il propose uniquement les liens de ressources sélectionnés et n’utilise pas les anciens clips comme démonstrations LSF. En l’absence d’OpenAI, les orientations locales restent disponibles. Les fonctions vocales nécessitent OpenAI.

```sh
python3.10 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env
.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8100
.venv/bin/python -m unittest discover -s tests
```

Les dépendances de reconnaissance sont chargées à la demande. Conserver les versions TensorFlow/MediaPipe épinglées et les poids existants jusqu’à une évaluation dédiée.

Les adaptateurs existants emploient actuellement `gpt-4o-mini`, `whisper-1` et `tts-1`. La langue de transcription du parcours français est `fr`. Leur migration vers de nouveaux modèles doit être testée séparément, sans présenter ces adaptateurs comme la nouvelle architecture vocale finalisée.

En production, définir `OPENAI_API_KEY` et le même `INTERNAL_API_TOKEN` que le serveur Next.

## Reconnaissance démo

`GET /recognize/status` charge et vérifie le modèle ainsi que MediaPipe. `POST /recognize` reçoit `{target, frames}` : cible A/B/C/1/2/3, 10 à 30 JPEG base64. Le navigateur capture 30 images réduites sur trois secondes. Authentification Supabase au niveau du gateway Next.js et jeton interne au niveau de FastAPI.

Le modèle existant attend `(30, 63)` points normalisés et produit six probabilités. L’ordre historique `[one, two, three, a, b, c]` reste une hypothèse faute du fichier d’étiquettes original. Le résultat porte `mode=legacy_demo`, `lsf_validated=false` et `verdict=match|different|uncertain`. Les seuils 0,70 de confiance et 0,15 d’écart sont des heuristiques de démonstration, pas une calibration. Moins de huit images avec une main, ou moins de la moitié de la séquence, entraîne une abstention. Aucun résultat démo ne devient une note de maîtrise.

Les pistes de caméra s’arrêtent après capture ; les images passent en mémoire dans le service IA sans écriture sur disque. Les inférences sont sérialisées et le tracker est réinitialisé entre essais pour éviter de mélanger les séquences. Sur macOS, MediaPipe peut nécessiter un accès graphique indisponible dans un sandbox ; lancer le service local normalement.

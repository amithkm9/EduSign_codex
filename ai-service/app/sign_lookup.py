"""Bilingual word lookup against explicit video collections, never invented media."""
import json
import re
import unicodedata
from pathlib import Path
from difflib import get_close_matches

DATA = Path(__file__).parent / 'data'
COLLECTIONS = {
    'lsf': json.loads((DATA / 'sign-videos.json').read_text()),
    'project': json.loads((DATA / 'project-sign-videos.json').read_text()),
}


def normalize(text):
    text = ''.join(c for c in unicodedata.normalize('NFD', text.lower()) if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', ' ', text).strip()


def extract_target(message):
    # Quotes and explicit request templates avoid matching 'child', 'I' or 'show'
    # from the request itself. We never turn arbitrary sentences into a sign sequence.
    quoted = re.findall(r'["“«]([^"”»]+)["”»]', message)
    if quoted:
        return ', '.join(quoted)
    text = normalize(message)
    text = re.sub(r'\s+(in|en) (french sign language|sign language|langue des signes francaise|langue des signes|lsf)\b.*$', '', text)
    text = re.sub(r'\s+(for my (child|kid|daughter|son)|to my (child|kid)|a mon enfant|a ma fille|a mon fils|pour mon enfant)\b.*$', '', text)
    patterns = [
        r'^.*?\b(?:how (?:do|can) (?:i|you|we) (?:sign|say)|how to (?:sign|say)|comment (?:signer|dire)|comment (?:on|je|tu) (?:signe|dit))\s+',
        r'^.*?\b(?:the (?:sign|word|symbol)|le (?:signe|mot|symbole))\s+(?:(?:for|of|pour|de|du)\s+)?',
        r'^.*?\b(?:teach (?:my |a )?(?:child|kid|daughter|son)|apprendre a (?:mon |un )?enfant)\s+(?:(?:to|a) (?:say|sign|dire|signer)\s+)?',
        r'^(?:please |s il (?:te|vous) plait )?(?:show me|show|montre moi|montrez moi|montre|voir|revoir|teach me|apprends moi|apprendre|learn)\s+(?:(?:a |the |une |la )?(?:video|demonstration) (?:of |for |de |du |pour )?)?',
    ]
    for pattern in patterns:
        changed = re.sub(pattern, '', text)
        if changed != text:
            text = changed
            break
    text = re.sub(r'^(?:(?:the|a|le|un) )?(?:sign|signe|word|mot|symbol|symbole) (?:(?:for|of|pour|de) )?', '', text)
    return re.sub(r'\s+(please|s il te plait|s il vous plait)$', '', text).strip()


def find_signs(target, catalog):
    clean = normalize(target)
    exact = [item for item in catalog if any(clean == normalize(alias) for alias in item['aliases'])]
    if exact:
        return exact[:3]
    parts = re.split(r'\s+(?:and|et)\s+|[,;]', target)
    if len(parts) > 1:
        found = []
        for part in parts[:3]:
            hits = [item for item in catalog if any(normalize(part) == normalize(alias) for alias in item['aliases'])]
            if not hits:
                return []  # Never silently omit an unsupported word.
            found.extend(hits[:1])
        return list({item['id']: item for item in found}.values())
    return []


def sign_reply(message, language='fr', history=None, explicit=False, collection='lsf'):
    from .bilingual import reply_language
    language = reply_language(message, language)
    en = language == 'en'
    clean = normalize(message)
    # An explicit LSF request always uses sourced LSF clips, not the project imports.
    if re.search(r'\b(lsf|french sign language|langue des signes francaise)\b', clean):
        collection = 'lsf'
    catalog = COLLECTIONS.get(collection, COLLECTIONS['lsf'])
    target = extract_target(message)
    matches = find_signs(target, catalog)
    if not (explicit or matches):
        return None
    if re.search(r'\b(asl|bsl|american sign|langue des signes americaine|british sign)\b', clean):
        text = ('I can’t verify an ASL or BSL demonstration in these collections. Choose the sourced LSF collection if you want French Sign Language.' if en else 'Je ne peux pas confirmer une démonstration ASL ou BSL dans ces collections. Choisissez la collection LSF sourcée pour la langue des signes française.')
        ids, suggestions = [], []
    else:
        if not matches and clean in ['again', 'show it again', 'replay', 'slower', 'show that again', 'encore', 'revoir', 'plus lentement', 'montre encore']:
            for item in reversed(history or []):
                if item.get('role') == 'assistant':
                    quoted = re.findall(r'«\s*([^»]+?)\s*»', item.get('content', ''))
                    if quoted: matches = find_signs(', '.join(quoted), catalog)
                    break
        if matches:
            selected = matches[:3]
            labels = ', '.join('« ' + item['label'][language] + ' »' for item in selected)
            if collection == 'project':
                text = (f'Here is {labels} from your video library. Watch the demonstration, then try it together. You can replay or slow it down.' if en else f'Voici {labels} dans votre bibliothèque vidéo. Regardez le geste, puis essayez ensemble. Vous pouvez le revoir ou le ralentir.')
            else:
                text = (f'Here is {labels} in French Sign Language (LSF). Watch the demonstration, then take turns trying it with your child.' if en else f'Voici {labels} en langue des signes française (LSF). Regardez la démonstration, puis essayez chacun votre tour avec votre enfant.')
            if len(selected) > 1:
                text += (' These are separate word demonstrations, not a signed sentence.' if en else ' Ce sont des démonstrations de mots séparés, pas une phrase traduite en LSF.')
            ids = [item['id'] for item in selected]
            preferred = ['HI', 'HELLO', 'BYE', 'MOTHER', 'WATER', 'APPLE']
            options = [item for item in catalog if item.get('key') in preferred] if collection == 'project' else catalog
            suggestions = [item['label'][language] for item in options if item['id'] not in ids][:3]
        else:
            ids = []
            aliases = {normalize(alias): item for item in catalog for alias in item['aliases']}
            near = get_close_matches(normalize(target), aliases, n=3, cutoff=0.82) if len(target.split()) <= 3 else []
            if near:
                suggestions = list(dict.fromkeys(aliases[alias]['label'][language] for alias in near))
                text = ('Did you mean one of these words? Choose it below to see the demonstration.' if en else 'Vouliez-vous dire l’un de ces mots ? Choisissez-le ci-dessous pour voir la démonstration.')
            else:
                text = ('I couldn’t find that word in the selected collection. Try a single word in French or English, or browse the video library. A whole sentence cannot be translated by joining word clips.' if en else 'Je n’ai pas trouvé ce mot dans la collection choisie. Essayez un seul mot en français ou en anglais, ou parcourez la bibliothèque vidéo. Assembler des vidéos de mots ne traduit pas une phrase en langue des signes.')
                preferred = ['HI', 'HELLO', 'BYE', 'MOTHER', 'WATER', 'APPLE']
                suggestions = [item['label'][language] for item in catalog if collection != 'project' or item.get('key') in preferred][:6]
    response = {'type': 'sign_video' if ids else 'sign_not_found', 'mode': 'library', 'response': text, 'language': language, 'collection': collection, 'sign_ids': ids, 'suggestions': suggestions, 'resources': [] if ids or collection == 'project' else [{'title': 'Le Dico Elix', 'url': 'https://dico.elix-lsf.fr/'}]}
    return {'response': response, 'language': language, 'text_for_speech': text}

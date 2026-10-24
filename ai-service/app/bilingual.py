"""Choose the reply language from the current message, with UI fallback for ambiguity."""
import re

# Short requests need vocabulary evidence; generic language detectors often mistake
# bonjour/hi or shared words such as chat, pain, orange and alphabet.
FRENCH_ALIASES = {'bonjour', 'salut', 'coucou', 'au revoir', 'a bientot', 'maman', 'mere', 'papa', 'pere', 'eau', 'manger', 'boire', 'dormir', 'enfant', 'enfants', 'pomme', 'chien', 'chat', 'chaussure', 'chaussures', 'ami', 'amie', 'ecole', 'merci', 's il vous plait', 's il te plait'}
FR_WORDS = set('je tu nous vous il elle ils elles mon ma mes votre vos notre nos enfant enfants apprendre apprendrez apprends montre montrez comment pourquoi quel quelle quels quelles signe signes dire dis bonjour salut merci oui non est sont suis voudrais veux peux peut pouvez avec pour une des du les le la et ou au aux en francais explique expliquer aide moi revoir encore lentement plus famille activite programme minutes nombres lettres'.split())
EN_WORDS = set('i you we he she they my your our child children learn teach show how why what which sign signs say hello hi thanks thank yes no is are am would want can could with for a the and or in english explain help me replay again slower family activity plan numbers letters please'.split())


def reply_language(message, fallback='fr'):
    from .sign_lookup import COLLECTIONS, normalize
    clean = normalize(message)
    if re.search(r'\b(?:reply|respond|answer|reponds|repondez)\s+(?:only |uniquement )?(?:in|en)\s+(?:french|francais)\b', clean):
        return 'fr'
    if re.search(r'\b(?:reply|respond|answer|reponds|repondez)\s+(?:only |uniquement )?(?:in|en)\s+(?:english|anglais)\b', clean):
        return 'en'
    french = set(FRENCH_ALIASES)
    english = set()
    for catalog in COLLECTIONS.values():
        for item in catalog:
            french.add(normalize(item['label']['fr']))
            english.add(normalize(item['label']['en']))
    for catalog in COLLECTIONS.values():
        for item in catalog:
            english.update(normalize(alias) for alias in item['aliases'] if normalize(alias) not in french)
    # Exact vocabulary wins over incidental tokens inside a multiword label.
    if clean in french and clean not in english:
        return 'fr'
    if clean in english and clean not in french:
        return 'en'
    if clean in french and clean in english:
        return fallback
    tokens = set(clean.split())
    fr = len(tokens & FR_WORDS)
    en = len(tokens & EN_WORDS)
    if fr != en:
        return 'fr' if fr > en else 'en'
    if re.search(r'[àâçéèêëîïôùûüœ]', message.lower()):
        return 'fr'
    return fallback if fallback in ('fr', 'en') else 'fr'

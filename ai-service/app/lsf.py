"""French tutor: LSF sources only. Never relabel the preserved legacy dataset."""
import re
import unicodedata
from .config import has_openai
from .llm import get_openai_client

TOPICS = [
    ('alphabet', ['alphabet', 'lettre', 'prénom', 'prenom', 'dactylologie', 'name', 'letter'], 'Les lettres prennent vie'),
    ('nombres', ['nombre', 'chiffre', 'compter', 'number', 'count'], 'À vous de compter'),
]

def process_french_message(message: str, history=None, profile=None, language='fr') -> dict:
    english = language == 'en'
    clean = ''.join(c for c in unicodedata.normalize('NFD', message.lower()) if not unicodedata.combining(c))
    matched = [(slug, title) for slug, keys, title in TOPICS if any(re.search(r'\b' + re.escape(k), clean) for k in keys)]
    resources = [{'title': title, 'url': '/learn/lsf-' + slug} for slug, title in matched[:3]]
    if not resources:
        resources = [{'title': 'Le Dico Elix — rechercher un signe en LSF', 'url': 'https://dico.elix-lsf.fr/'}]
    text = ('Ouvrez la ressource ci-dessous pour observer la démonstration en LSF. Regardez les mains, le visage et le mouvement, puis faites pause pour essayer à votre rythme. Vous pouvez pratiquer à deux et revenir au modèle aussi souvent que nécessaire.' if matched else 'Pour commencer, choisissez une seule découverte : les nombres ou les lettres de votre prénom. Le Dico Elix permet aussi de rechercher un mot en LSF. Je peux vous orienter vers les leçons EduSign ; les gestes précis doivent être vérifiés dans une démonstration LSF.')
    if english:
        titles = {'bonjour':'Hello, world!', 'alphabet':'Letters come to life', 'couleurs':'A world of colours', 'famille':'The people who matter', 'nombres':'Let’s count', 'ecole':'A day at school', 'emotions':'How are you feeling?', 'dialogue':'Shall we get acquainted?'}
        resources = [{'title':titles[slug], 'url':'/learn/lsf-'+slug} for slug, _ in matched[:3]] or [{'title':'Le Dico Elix — look up a sign in LSF','url':'https://dico.elix-lsf.fr/'}]
        text = ('Open the lesson below to watch its French Sign Language demonstration. Watch the hands, face and movement, then pause and try at your own pace. You can practise together and return to the example whenever you need.' if matched else 'Start with one discovery: numbers or the letters in your name. Le Dico Elix also lets you look up words in French Sign Language. I can guide you to EduSign lessons; always check the exact signs in an LSF demonstration. English explanations do not change the sign language to ASL.')
    if has_openai():
        try:
            reply = get_openai_client().chat.completions.create(
                model='gpt-4o-mini',
                messages=[{'role': 'system', 'content': (
                    ('Reply only in English. ' if english else 'Réponds uniquement en français. ') + 'Tu es l’assistant pédagogique EduSign pour les élèves et les parents. Réponds en 2 courts paragraphes, avec chaleur et sans infantiliser. '
                    'Le sujet est la langue des signes française (LSF). Ne te présente pas comme un enseignant certifié. '
                    'Tu peux proposer des activités, expliquer comment apprendre et orienter vers les ressources fournies. '
                    'Ne décris pas de position de main ou de traduction signée sans source validée. Ne transforme pas le français mot à mot en signes. '
                    'Ne recommande jamais la bibliothèque historique ISL/ASL ni une vidéo inventée. N’invente pas de lien. '
                    'Les expressions du visage et la grammaire font partie de la LSF. Ne prétends pas avoir évalué les gestes de l’élève. '
                    'Les ressources liées ci-dessous sont ajoutées par le serveur : ' + str(resources)
                )}] + [{'role': m['role'], 'content': str(m['content'])[:2000]} for m in (history or [])[-6:] if m.get('role') in ('user','assistant')] + [{'role':'user','content':message[:2000]}],
                max_tokens=500,
            )
            text = reply.choices[0].message.content or text
        except Exception:
            text = ('Conversational mode is temporarily unavailable. ' if english else 'Le mode conversationnel est momentanément indisponible. ') + text
    response = {'type':'general_help','response':text,'resources':resources,'language':language}
    return {'response':response,'language':language,'text_for_speech':text}

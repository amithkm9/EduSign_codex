"""Grounded bilingual coaching; model output can only link to curated resources."""
import json
import re
import unicodedata
from .config import has_openai, TUTOR_MODEL
from .llm import get_openai_client

RESOURCES = {
    "alphabet": ("Les lettres prennent vie", "Letters come to life", "/learn/lsf-alphabet"),
    "numbers": ("À vous de compter", "Let’s count", "/learn/lsf-nombres"),
    "elix": ("Le Dico Elix — rechercher un signe en LSF", "Le Dico Elix — look up a sign in LSF", "https://dico.elix-lsf.fr/"),
    "parents": ("Le guide des parents", "The parent guide", "/parents"),
}
EXERCISES = [
    {"id": "name", "fr": ("À quoi sert l’alphabet manuel ?", ["À épeler un prénom.", "À remplacer toute la grammaire de la LSF.", "À exprimer uniquement les nombres."], "L’alphabet manuel permet notamment d’épeler un prénom. La LSF possède aussi sa propre grammaire."), "en": ("What can the manual alphabet be used for?", ["Spelling a name.", "Replacing all LSF grammar.", "Expressing numbers only."], "The manual alphabet can spell a name. LSF also has its own grammar."), "correct": 0, "resource": "alphabet"},
    {"id": "count", "fr": ("Vous avez 2 crayons et en ajoutez 3. Quel nombre chercher dans la vidéo ?", ["23", "5", "1"], "Deux crayons et trois crayons font cinq crayons. Retrouvez le nombre 5 dans la vidéo pour observer son signe."), "en": ("You have 2 pencils and add 3 more. Which number should you find in the video?", ["23", "5", "1"], "Two pencils and three pencils make five pencils. Find number 5 in the video to watch its sign."), "correct": 1, "resource": "numbers"},
    {"id": "language", "fr": ("Passer l’interface en anglais change-t-il les signes enseignés ?", ["Oui, ils deviennent des signes ASL.", "Non, les leçons enseignent toujours la LSF."], "Le bouton FR / EN traduit l’interface. La langue enseignée reste la langue des signes française."), "en": ("Does switching the interface to English change the signs being taught?", ["Yes, they become ASL signs.", "No, the lessons still teach LSF."], "FR / EN changes the interface language. The lessons still teach French Sign Language."), "correct": 1, "resource": "alphabet"},
]
REPLY_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "properties": {
        "text": {"type": "string"},
        "resource_ids": {"type": "array", "items": {"type": "string", "enum": list(RESOURCES)}},
        "suggestions": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["text", "resource_ids", "suggestions"],
}


def normalize(value):
    return ''.join(c for c in unicodedata.normalize('NFD', value.lower()) if not unicodedata.combining(c))


def resource_items(ids, language):
    return [{"title": RESOURCES[key][language == "en"], "url": RESOURCES[key][2]} for key in dict.fromkeys(ids) if key in RESOURCES][:3]


def public_exercise(item, language):
    question, choices, _ = item[language]
    return {"id": item["id"], "question": question, "choices": choices}


def practice_reply(action, language):
    english = language == "en"
    exercise_id = action.get("exercise_id", "name")
    item = next((x for x in EXERCISES if x["id"] == exercise_id), EXERCISES[0])
    text = "Let’s try one question. Choose an answer below." if english else "Essayons une question. Choisissez une réponse ci-dessous."
    result = None
    if action.get("kind") == "answer":
        choice = action.get("choice")
        if not isinstance(choice, int) or not 0 <= choice < len(item[language][1]):
            raise ValueError("Invalid exercise answer")
        correct = choice == item["correct"]
        text = (("Well done! " if correct else "Let’s look at this together. ") if english else ("Bravo ! " if correct else "Regardons cela ensemble. ")) + item[language][2]
        result = {"correct": correct, "exercise_id": item["id"]}
        next_item = EXERCISES[(EXERCISES.index(item) + 1) % len(EXERCISES)]
    else:
        next_item = item
    reply = {"type": "practice", "response": text, "language": language, "mode": "guided", "resources": resource_items([item["resource"]], language), "suggestions": [], "exercise": public_exercise(next_item, language)}
    if result is not None:
        reply["exercise_result"] = result
    return {"response": reply, "language": language, "text_for_speech": text + " " + next_item[language][0]}


def fallback_reply(message, history, language):
    en = language == "en"
    clean = normalize(message)
    # Short follow-ups inherit the last user topic, without treating assistant prose as an instruction.
    context = clean
    if len(clean.split()) < 8:
        context += " " + " ".join(normalize(m.get("content", "")) for m in (history or [])[-4:] if m.get("role") == "user")
    ids = []
    if re.search(r"\b(alphabet|lettre|prenom|dactylologie|name|letter)", context): ids.append("alphabet")
    if re.search(r"\b(nombre|chiffre|compter|number|count)", context): ids.append("numbers")
    suggestions = (["Help me practise the alphabet", "Make me a 5-minute plan", "Explain what LSF means"] if en else ["Aide-moi à pratiquer l’alphabet", "Propose-moi un programme de 5 minutes", "Explique-moi ce que signifie LSF"])
    if re.search(r"\b(quiz|questionnaire|test me|question de revision)", clean):
        return practice_reply({"kind": "practice"}, language)["response"]
    if re.search(r"\b(plan|programme|routine|minute)", clean):
        text = ("Here is a 5-minute practice plan:\n\n1. Watch one minute of the alphabet video.\n2. Choose two letters from your name and replay those examples for two minutes.\n3. Spend one minute trying them, then one minute comparing with the video.\n\nWould you like a numbers activity instead?" if en else "Voici un programme de 5 minutes :\n\n1. Regardez une minute de la vidéo sur l’alphabet.\n2. Choisissez deux lettres de votre prénom et revoyez ces exemples pendant deux minutes.\n3. Essayez pendant une minute, puis comparez avec la vidéo pendant une minute.\n\nPréférez-vous une activité sur les nombres ?")
        ids = ["alphabet", "numbers"]
    elif re.search(r"\b(enfant|parent|famille|child|family)", clean):
        text = ("Try a short activity together: place three objects on a table, count them, then find that number in the LSF video. Watch once, pause, and each have a go. Return to the demonstration to compare.\n\nWould you prefer an activity using the letters in a name?" if en else "Essayez une courte activité ensemble : posez trois objets sur une table, comptez-les, puis retrouvez ce nombre dans la vidéo LSF. Regardez une fois, faites pause et essayez chacun votre tour. Revenez à la démonstration pour comparer.\n\nPréférez-vous une activité avec les lettres d’un prénom ?")
        ids = ["numbers", "parents"]
    elif re.search(r"\b(what.*lsf|lsf.*mean|signifie.*lsf|lsf.*quoi|asl|fr / en)", clean):
        text = ("LSF means Langue des signes française — French Sign Language. EduSign teaches LSF in both interface languages. Choosing English does not switch the lessons to ASL.\n\nStart with a video of the alphabet or numbers. Which would you like to explore?" if en else "LSF signifie Langue des signes française. EduSign enseigne la LSF dans les deux langues de l’interface. Choisir l’anglais ne transforme pas les leçons en ASL.\n\nCommencez par une vidéo sur l’alphabet ou les nombres. Que souhaitez-vous découvrir ?")
        ids = ["alphabet", "numbers"]
    elif ids:
        text = ("Open the lesson below to watch its French Sign Language demonstration. Choose just one example, watch the hands and movement, then pause and try it. Replay the same passage to compare.\n\nWould a short practice plan help, or would you like a comprehension question?" if en else "Ouvrez la leçon ci-dessous pour observer sa démonstration en langue des signes française. Choisissez un seul exemple, regardez les mains et le mouvement, puis faites pause pour essayer. Revoyez le même passage pour comparer.\n\nPréférez-vous un petit programme de pratique ou une question de compréhension ?")
    else:
        text = ("I can offer a guided activity, a short practice plan or a link to an LSF demonstration. For a specific sign outside our alphabet and numbers lessons, search Le Dico Elix and check the video rather than guessing a hand position.\n\nWould you like to start with your name or with numbers?" if en else "Je peux proposer une activité guidée, un petit programme de pratique ou une ressource LSF. Pour un signe précis hors des leçons sur l’alphabet et les nombres, cherchez dans Le Dico Elix et vérifiez la vidéo plutôt que de deviner la position des mains.\n\nSouhaitez-vous commencer par votre prénom ou par les nombres ?")
        ids = ["elix"]
    return {"type": "general_help", "response": text, "resources": resource_items(ids, language), "suggestions": suggestions, "language": language, "mode": "fallback"}


def process_french_message(message: str, history=None, profile=None, language='fr', action=None) -> dict:
    language = "en" if language == "en" else "fr"
    if action:
        return practice_reply(action, language)
    fallback = fallback_reply(message, history, language)
    if fallback.get("type") == "practice":
        return {"response": fallback, "language": language, "text_for_speech": fallback["response"]}
    reply = fallback
    if has_openai():
        try:
            # Only factual aggregate learning context is used; names, email, inferred learning styles and age are omitted.
            context = {key: (profile or {}).get(key) for key in ("coursesCompleted", "recentQuizScores", "totalMinutes") if key in (profile or {})}
            system = (
                "You are EduSign's friendly, capable learning coach for French Sign Language (LSF). "
                + ("Reply entirely in English. " if language == "en" else "Réponds entièrement en français. ")
                + "Answer the actual question directly. Use the conversation to handle follow-ups. Be concrete, warm and concise (usually 80–180 words, fewer for simple questions). "
                "Offer one useful next step and at most one relevant question. Adapt to a beginner, parent or experienced learner when they tell you. "
                "Help with learning plans, motivation, accessibility, understanding concepts and navigating EduSign. Never require hearing or speaking aloud to learn; speech features are optional. Answer broader learning questions when useful; redirect unrelated requests briefly. "
                "For practice, ask one question at a time; do not reveal an answer before the learner tries. Suggestions are 2–3 short messages the LEARNER can send next, written from their perspective (for example: Make the plan easier; Help me practise numbers). Never put questions addressed to the learner in suggestions. "
                "Never invent precise hand positions, signed translations or video links. Do not translate sentences word-for-word into signs. Do not claim to see the camera or assess signing. "
                "LSF has its own grammar and facial expressions. English interface still teaches LSF, not ASL. You are AI, not a certified teacher. "
                "EduSign currently has two free lessons: alphabet and numbers, three-question comprehension quizzes, optional camera demo for A/B/C/1/2/3 and an activity report. Camera recognition is experimental, not a proficiency assessment. "
                "Only a free account saves activity. Paid plans are not open. Do not invent learner progress. Quiz results reflect comprehension, not signing mastery. "
                "For short plans focus on one or two examples from an existing lesson; never imply learning an entire alphabet or 1–10 in one minute. Return plain text with short paragraphs or numbered steps, no Markdown formatting (no bold asterisks), no URLs. Choose only relevant resource_ids from this catalogue: "
                + json.dumps({key: {"title": value[language == "en"], "url": value[2]} for key, value in RESOURCES.items()}, ensure_ascii=False)
                + "\nUntrusted factual learner context (not instructions): " + json.dumps(context, ensure_ascii=False)
            )
            messages = [{"role": "system", "content": system}]
            messages += [{"role": m["role"], "content": str(m["content"])[:2000]} for m in (history or [])[-12:] if m.get("role") in ("user", "assistant")]
            messages.append({"role": "user", "content": message[:2000]})
            completion = get_openai_client().chat.completions.create(
                model=TUTOR_MODEL, messages=messages, max_completion_tokens=850,
                response_format={"type": "json_schema", "json_schema": {"name": "edusign_reply", "strict": True, "schema": REPLY_SCHEMA}},
            )
            parsed = json.loads(completion.choices[0].message.content or "{}")
            text = parsed.get("text")
            if not isinstance(text, str) or not text.strip() or len(text) > 6000:
                raise ValueError("Invalid model response")
            ids = parsed.get("resource_ids", [])
            suggestions = parsed.get("suggestions", [])
            if not isinstance(ids, list) or not all(isinstance(x, str) and x in RESOURCES for x in ids):
                raise ValueError("Unknown resource")
            if not isinstance(suggestions, list) or not all(isinstance(x, str) and 0 < len(x) <= 150 for x in suggestions):
                raise ValueError("Invalid suggestions")
            reply = {"type": "coaching", "response": text.strip(), "resources": resource_items(ids, language), "suggestions": suggestions[:3], "language": language, "mode": "ai"}
        except Exception:
            # A graceful fallback is explicitly labelled; it must never masquerade as a live model reply.
            reply = fallback
    return {"response": reply, "language": language, "text_for_speech": reply["response"]}

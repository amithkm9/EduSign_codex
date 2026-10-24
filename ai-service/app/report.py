import json

from .config import has_openai
from .llm import get_openai_client, strip_code_fence


def _fallback(payload: dict) -> dict:
    stats = payload.get("statistics", {})
    name = payload.get("student", {}).get("name", "Cet élève")
    completed = stats.get("totalCompleted", 0)
    watch_seconds = round(sum(v.get("activeMs", 0) for v in payload.get("videoProgress", [])) / 1000)
    if payload.get("language") == "en":
        return {
            "overallSummary": f"{name} has marked {completed} activities complete. {watch_seconds} seconds of visible video playback are recorded. This report describes account activity, without assessing signing proficiency.",
            "strengthsAnalysis": "Every shared activity is a chance to watch and practise.",
            "areasForGrowth": "Choose one discovery to revisit together at your own pace.",
            "achievements": [],
            "parentTips": ["Watch an LSF video together and take breaks.", "Let your child choose the next topic."],
            "weeklyGoal": "Explore one lesson and try its activity as a family.",
            "encouragement": "Enjoy discovering together, one sign at a time.",
        }
    return {
        "overallSummary": f"{name} a déclaré {completed} activité(s) terminée(s). {watch_seconds} secondes de lecture vidéo visible sont enregistrées. Ce bilan décrit l’activité du compte, sans évaluer la maîtrise des signes.",
        "strengthsAnalysis": "Chaque activité partagée est une occasion d’observer et de pratiquer.",
        "areasForGrowth": "Choisissez une découverte à revoir ensemble, à votre rythme.",
        "achievements": [],
        "parentTips": ["Regardez une vidéo LSF ensemble et faites des pauses.", "Laissez l’enfant choisir le prochain thème."],
        "weeklyGoal": "Explorer une leçon et essayer son activité en famille.",
        "encouragement": "Prenez plaisir à découvrir ensemble, un signe après l’autre.",
    }


def generate_insights(payload: dict) -> dict:
    """AI-generated parent-report narrative from the stats Next gathered."""
    if not has_openai():
        return _fallback(payload)
    try:
        completion = get_openai_client().chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        ("Reply only in English. " if payload.get("language") == "en" else "Réponds uniquement en français. ") + "Tu rédiges un bilan des activités déclarées d’un compte EduSign. "
                        "Ne suppose pas que le compte appartient à un enfant, ni que les activités prouvent une maîtrise. "
                        "Propose des idées simples de découverte de la LSF en famille. Cite uniquement les chiffres fournis. Les videoProgress distinguent activeMs (temps de lecture visible, relectures comprises) de coverage (pourcentage unique regardé). Ce suivi ne prouve pas l’attention ni la maîtrise.\n"
                        'Return ONLY JSON: {"overallSummary": str, "strengthsAnalysis": str, '
                        '"areasForGrowth": str, "achievements": [str], "parentTips": [str], '
                        '"weeklyGoal": str, "encouragement": str}'
                    ),
                },
                {
                    "role": "user",
                    "content": "Student report data:\n" + json.dumps(payload, ensure_ascii=False),
                },
            ],
            max_tokens=900,
            temperature=0.7,
        )
        raw = strip_code_fence((completion.choices[0].message.content or "").strip())
        data = json.loads(raw)
        result = _fallback(payload)
        result.update({k: v for k, v in data.items() if v})
        return result
    except Exception:
        return _fallback(payload)

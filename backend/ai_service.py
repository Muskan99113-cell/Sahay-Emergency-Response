import re


EMERGENCY_KEYWORDS = {
    "accident": {
        "road accident": 10,
        "traffic accident": 10,
        "vehicle accident": 10,
        "car accident": 10,
        "bike accident": 10,
        "road crash": 10,
        "car crash": 10,
        "bike crash": 10,
        "vehicle crash": 10,
        "collision": 9,
        "hit by car": 10,
        "hit by vehicle": 10,
        "hit by bike": 10,
        "major accident": 10,
        "accident": 6,
        "crash": 6,
    },

    "fire": {
        "building fire": 10,
        "house fire": 10,
        "gas explosion": 10,
        "major fire": 9,
        "fire": 6,
        "flames": 6,
        "burning": 5,
        "smoke": 4,
        "gas leak": 7,
        "explosion": 8,
    },

    "crime": {
        "armed attack": 10,
        "physical attack": 9,
        "home invasion": 10,
        "violent attack": 10,
        "robbery": 8,
        "assault": 8,
        "attacked": 7,
        "attack": 5,
        "intruder": 7,
        "threat": 5,
        "violence": 6,
        "fight": 5,
        "theft": 5,
        "stolen": 4,
    },

    "medical": {
        "cardiac arrest": 10,
        "heart attack": 9,
        "stroke": 9,
        "not breathing": 10,
        "cannot breathe": 10,
        "can't breathe": 10,
        "difficulty breathing": 8,
        "breathing problem": 7,
        "severe bleeding": 7,
        "heavy bleeding": 7,
        "massive bleeding": 8,
        "unconscious": 6,
        "chest pain": 7,
        "fainted": 5,
        "fainting": 5,
        "bleeding": 4,
        "injured": 3,
        "injury": 3,
        "dizzy": 3,
        "vomiting": 3,
        "pain": 2,
        "medical": 4,
    },
}


CRITICAL_KEYWORDS = [
    "cardiac arrest",
    "not breathing",
    "cannot breathe",
    "can't breathe",
    "heart attack",
    "stroke",
    "unconscious",
    "severe bleeding",
    "heavy bleeding",
    "massive bleeding",
    "multiple people injured",
    "multiple injured",
    "trapped",
    "major accident",
    "building fire",
    "house fire",
    "gas explosion",
    "explosion",
]


HIGH_KEYWORDS = [
    "accident",
    "crash",
    "collision",
    "bleeding",
    "injured",
    "chest pain",
    "difficulty breathing",
    "breathing problem",
    "breathless",
    "burn",
    "burning",
    "assault",
    "attack",
]


MEDIUM_KEYWORDS = [
    "pain",
    "sick",
    "fever",
    "minor injury",
    "dizzy",
    "headache",
    "vomiting",
]


def normalize_text(text: str) -> str:
    if not text:
        return ""

    text = text.lower().strip()
    text = text.replace("’", "'")
    text = re.sub(r"[^a-z0-9'\s-]", " ", text)
    text = re.sub(r"\s+", " ", text)

    return text


def detect_emergency_type(text: str) -> tuple[str, int]:

    scores = {
        "accident": 0,
        "fire": 0,
        "crime": 0,
        "medical": 0,
    }

    for category, keywords in EMERGENCY_KEYWORDS.items():
        for keyword, weight in keywords.items():
            if keyword in text:
                scores[category] += weight

    # --------------------------------------------------------
    # Explicit event precedence
    # --------------------------------------------------------
    # If the description explicitly says accident/crash,
    # accident becomes the primary event even when injuries
    # such as unconsciousness or bleeding are also present.
    # --------------------------------------------------------

    accident_phrases = [
        "road accident",
        "traffic accident",
        "vehicle accident",
        "car accident",
        "bike accident",
        "road crash",
        "car crash",
        "bike crash",
        "vehicle crash",
        "collision",
        "hit by car",
        "hit by vehicle",
        "hit by bike",
        "major accident",
    ]

    fire_phrases = [
        "building fire",
        "house fire",
        "gas explosion",
        "major fire",
    ]

    if any(phrase in text for phrase in accident_phrases):
        emergency_type = "accident"

    elif any(phrase in text for phrase in fire_phrases):
        emergency_type = "fire"

    else:
        emergency_type = max(
            scores,
            key=scores.get,
        )

        if scores[emergency_type] == 0:
            return "other", 45

    score = scores.get(
        emergency_type,
        0,
    )

    confidence = min(
        97,
        60 + (score * 4),
    )

    return emergency_type, confidence


def detect_severity(text: str) -> tuple[str, int]:

    critical_matches = [
        keyword
        for keyword in CRITICAL_KEYWORDS
        if keyword in text
    ]

    if critical_matches:
        confidence = min(
            99,
            90 + len(critical_matches) * 2,
        )

        return "critical", confidence

    high_matches = [
        keyword
        for keyword in HIGH_KEYWORDS
        if keyword in text
    ]

    if high_matches:
        confidence = min(
            95,
            75 + len(high_matches) * 3,
        )

        return "high", confidence

    medium_matches = [
        keyword
        for keyword in MEDIUM_KEYWORDS
        if keyword in text
    ]

    if medium_matches:
        confidence = min(
            90,
            55 + len(medium_matches) * 3,
        )

        return "medium", confidence

    return "low", 35


def calculate_priority(
    severity: str,
    emergency_type: str,
    confidence: int,
) -> int:

    severity_scores = {
        "critical": 95,
        "high": 80,
        "medium": 60,
        "low": 35,
    }

    emergency_bonus = {
        "accident": 5,
        "fire": 8,
        "medical": 5,
        "crime": 4,
        "other": 0,
    }

    base_score = severity_scores.get(
        severity,
        40,
    )

    bonus = emergency_bonus.get(
        emergency_type,
        0,
    )

    confidence_adjustment = round(
        (confidence - 50) * 0.10
    )

    score = (
        base_score
        + bonus
        + confidence_adjustment
    )

    return max(
        0,
        min(100, score),
    )


def generate_recommendation(
    emergency_type: str,
    severity: str,
) -> dict:

    if severity == "critical":
        response = (
            "Immediate emergency response required. "
            "Dispatch the nearest available responder "
            "and coordinate with a suitable hospital."
        )

    elif severity == "high":
        response = (
            "High-priority response required. "
            "Assign a nearby responder and prepare "
            "hospital coordination."
        )

    elif severity == "medium":
        response = (
            "Standard emergency response recommended. "
            "Assign an available responder for assessment."
        )

    else:
        response = (
            "Low-priority assistance recommended. "
            "Monitor the situation and assign resources "
            "as available."
        )

    hospital_required = severity in [
        "critical",
        "high",
    ]

    if emergency_type == "accident":
        hospital_type = "Trauma-capable hospital"

    elif emergency_type == "medical":
        hospital_type = "Emergency / General Hospital"

    elif emergency_type == "fire":
        hospital_type = "Emergency Hospital / Burn Care"

    elif emergency_type == "crime":
        hospital_type = (
            "Emergency Hospital if injuries are reported"
        )

    else:
        hospital_type = "Nearest suitable hospital"

    return {
        "response": response,
        "hospital_required": hospital_required,
        "recommended_hospital_type": hospital_type,
    }


def analyze_emergency(description: str) -> dict:

    text = normalize_text(description)

    emergency_type, type_confidence = (
        detect_emergency_type(text)
    )

    severity, severity_confidence = (
        detect_severity(text)
    )

    confidence = round(
        (
            type_confidence
            + severity_confidence
        ) / 2
    )

    priority_score = calculate_priority(
        severity,
        emergency_type,
        confidence,
    )

    recommendation = generate_recommendation(
        emergency_type,
        severity,
    )

    return {
        "emergency_type": emergency_type,
        "severity": severity,
        "confidence": confidence,
        "priority_score": priority_score,
        "recommendation": recommendation["response"],
        "hospital_required": recommendation["hospital_required"],
        "recommended_hospital_type": recommendation[
            "recommended_hospital_type"
        ],
        "analysis_engine": "SAHAY Emergency Intelligence",
    }
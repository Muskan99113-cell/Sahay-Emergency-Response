import re


# ============================================================
# SAHAY EMERGENCY INTELLIGENCE
# ============================================================

# Weighted keywords used for fallback classification.
# Explicit event phrases are handled separately with higher
# priority inside detect_emergency_type().

EMERGENCY_KEYWORDS = {
    "accident": {
        "road accident": 10,
        "traffic accident": 10,
        "vehicle accident": 10,
        "car accident": 10,
        "bike accident": 10,
        "motorcycle accident": 10,
        "road crash": 10,
        "car crash": 10,
        "bike crash": 10,
        "vehicle crash": 10,
        "collision": 9,
        "road collision": 9,
        "car collision": 9,
        "bike collision": 9,
        "hit by car": 10,
        "hit by vehicle": 10,
        "hit by bike": 10,
        "vehicle hit": 8,
        "car hit": 8,
        "bike hit": 8,
        "major accident": 10,
        "accident": 6,
        "crash": 6,
    },

    "fire": {
        "building fire": 10,
        "house fire": 10,
        "gas cylinder explosion": 10,
        "gas explosion": 10,
        "major fire": 9,
        "fire emergency": 8,
        "building burning": 8,
        "house burning": 8,
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
        "violent attack": 10,
        "home invasion": 10,
        "armed robbery": 10,
        "robbery": 8,
        "assault": 8,
        "attacked": 7,
        "attack": 5,
        "intruder": 7,
        "threatened": 6,
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
        "breathing": 4,
        "bleeding": 4,
        "injured": 3,
        "injury": 3,
        "patient": 3,
        "sick": 3,
        "ill": 3,
        "dizzy": 3,
        "vomiting": 3,
        "pain": 2,
        "medical": 4,
    },
}


# ============================================================
# SEVERITY KEYWORDS
# ============================================================

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
    "gas cylinder explosion",
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
    "serious pain",
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


# ============================================================
# TEXT NORMALIZATION
# ============================================================

def normalize_text(text: str) -> str:
    if not text:
        return ""

    text = text.lower().strip()

    # Normalize curly apostrophes.
    text = text.replace("’", "'")

    # Keep letters, numbers, spaces, apostrophes and hyphens.
    text = re.sub(
        r"[^a-z0-9'\s-]",
        " ",
        text,
    )

    # Remove duplicate spaces.
    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text


# ============================================================
# EMERGENCY TYPE DETECTION
# ============================================================

def detect_emergency_type(
    text: str,
) -> tuple[str, int]:

    # --------------------------------------------------------
    # Explicit event phrases
    # --------------------------------------------------------
    #
    # These receive priority over generic medical symptoms.
    #
    # Example:
    #
    # "unconscious after a road accident"
    #
    # contains both:
    #   medical -> unconscious
    #   accident -> road accident
    #
    # The actual incident/event is an accident, so accident
    # gets priority.
    # --------------------------------------------------------

    accident_phrases = [
        "road accident",
        "traffic accident",
        "vehicle accident",
        "car accident",
        "bike accident",
        "motorcycle accident",
        "road crash",
        "car crash",
        "bike crash",
        "vehicle crash",
        "collision",
        "road collision",
        "car collision",
        "bike collision",
        "hit by car",
        "hit by vehicle",
        "hit by bike",
        "vehicle hit",
        "car hit",
        "bike hit",
        "major accident",
    ]

    fire_phrases = [
        "building fire",
        "house fire",
        "gas cylinder explosion",
        "gas explosion",
        "major fire",
        "fire emergency",
    ]

    crime_phrases = [
        "armed attack",
        "physical attack",
        "violent attack",
        "home invasion",
        "armed robbery",
        "robbery",
        "assault",
        "intruder",
    ]

    medical_phrases = [
        "cardiac arrest",
        "heart attack",
        "stroke",
        "not breathing",
        "cannot breathe",
        "can't breathe",
        "difficulty breathing",
        "chest pain",
    ]

    # --------------------------------------------------------
    # Accident has first priority
    # --------------------------------------------------------

    if any(
        phrase in text
        for phrase in accident_phrases
    ):
        return "accident", 97

    # --------------------------------------------------------
    # Fire
    # --------------------------------------------------------

    if any(
        phrase in text
        for phrase in fire_phrases
    ):
        return "fire", 97

    # --------------------------------------------------------
    # Crime
    # --------------------------------------------------------

    if any(
        phrase in text
        for phrase in crime_phrases
    ):
        return "crime", 94

    # --------------------------------------------------------
    # Medical
    # --------------------------------------------------------

    if any(
        phrase in text
        for phrase in medical_phrases
    ):
        return "medical", 94

    # --------------------------------------------------------
    # Weighted fallback
    # --------------------------------------------------------

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

    best_category = max(
        scores,
        key=scores.get,
    )

    best_score = scores[best_category]

    if best_score == 0:
        return "other", 45

    confidence = min(
        95,
        60 + (best_score * 4),
    )

    return best_category, confidence


# ============================================================
# SEVERITY DETECTION
# ============================================================

def detect_severity(
    text: str,
) -> tuple[str, int]:

    critical_matches = [
        keyword
        for keyword in CRITICAL_KEYWORDS
        if keyword in text
    ]

    if critical_matches:

        confidence = min(
            99,
            90 + (len(critical_matches) * 2),
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
            75 + (len(high_matches) * 3),
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
            55 + (len(medium_matches) * 3),
        )

        return "medium", confidence

    return "low", 35


# ============================================================
# PRIORITY SCORE
# ============================================================

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


# ============================================================
# RECOMMENDATION ENGINE
# ============================================================

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

        hospital_type = (
            "Trauma-capable hospital"
        )

    elif emergency_type == "medical":

        hospital_type = (
            "Emergency / General Hospital"
        )

    elif emergency_type == "fire":

        hospital_type = (
            "Emergency Hospital / Burn Care"
        )

    elif emergency_type == "crime":

        hospital_type = (
            "Emergency Hospital if injuries are reported"
        )

    else:

        hospital_type = (
            "Nearest suitable hospital"
        )

    return {
        "response": response,
        "hospital_required": hospital_required,
        "recommended_hospital_type": hospital_type,
    }


# ============================================================
# MAIN ANALYSIS
# ============================================================

def analyze_emergency(
    description: str,
) -> dict:

    text = normalize_text(
        description
    )

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
        severity=severity,
        emergency_type=emergency_type,
        confidence=confidence,
    )

    recommendation = generate_recommendation(
        emergency_type=emergency_type,
        severity=severity,
    )

    return {
        "emergency_type": emergency_type,
        "severity": severity,
        "confidence": confidence,
        "priority_score": priority_score,
        "recommendation": recommendation[
            "response"
        ],
        "hospital_required": recommendation[
            "hospital_required"
        ],
        "recommended_hospital_type": recommendation[
            "recommended_hospital_type"
        ],
        "analysis_engine": (
            "SAHAY Emergency Intelligence"
        ),
    }
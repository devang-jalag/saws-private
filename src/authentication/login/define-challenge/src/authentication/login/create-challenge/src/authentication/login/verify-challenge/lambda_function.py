import hashlib


def _hash(text):
    return hashlib.sha256(text.strip().lower().encode()).hexdigest()


def lambda_handler(event, context):
    req      = event["request"]
    answer   = (req.get("challengeAnswer") or "").strip()
    params   = req["privateChallengeParameters"]
    ctype    = params.get("type")
    expected = params.get("expected", "")

    if ctype == "QA":
        # stage 2: hash the typed answer and compare to the stored hash
        correct = _hash(answer) == expected
    else:  # CIPHER
        # stage 3: compare the uppercased cipher answer to the expected cipher
        correct = answer.upper() == expected.upper()

    event["response"]["answerCorrect"] = correct
    return event
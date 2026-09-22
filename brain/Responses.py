import re


# Normal hard-coded responses
RESPONSES = {
    "hello": "Hello. How can I help you today?",
    "hi": "Hello. How can I help you today?",
    "hey": "Hey! How can I help you today?",
    "who are you": "I am ULTRON.",
    "how are you": "All systems are operational.",
    "good morning": "Good morning.",
    "thank you": "You're welcome.",
    "good afternoon": "Good Afternoon",

}


def check_response(text):
    text = text.lower().strip()

    # 1. Check special patterns first
    patterns = [
        r"my name is ([a-zA-Z]+)",
        r"i am ([a-zA-Z]+)",
        r"i'm ([a-zA-Z]+)"
    ]

    for pattern in patterns:
        match = re.search(pattern, text)

        if match:
            name = match.group(1).capitalize()

            if "what's your name" in text or "what is your name" in text:
                return f"Hello, {name}. I am ULTRON."

            return f"Hello, {name}."

    # Check hard coded responses

    matched_responses = []

    for trigger, response in RESPONSES.items():
        if trigger in text:
            matched_responses.append(response)

    if matched_responses:
        return " ".join(matched_responses)

    # No Match
    return None
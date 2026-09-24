import os
import time
from config import GEMINI_MODEL
from .definations import DEFINITIONS
from dotenv import load_dotenv
from google import genai
from .Responses import check_response

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

chat = client.chats.create(
    model=GEMINI_MODEL
)


def check_definition(text):
    text = text.lower().strip()

    question_patterns = [
        "what is",
        "what's",
        "define",
        "explain",
        "tell me about",
        "describe",
        "what does"
    ]

    is_definition_question = any(
        pattern in text for pattern in question_patterns
    )

    if not is_definition_question:
        return None

    for key, definition in DEFINITIONS.items():
        if key in text:
            return definition

    return None


def ask_brain(text):
    # Check hardcoded responses first
    hardcoded = check_response(text)

    if hardcoded:
        return hardcoded

    # Check ULTRON's own definitions
    definition = check_definition(text)

    if definition:
        return definition

    # If nothing is found, ask Gemini
    for attempt in range(2):
        try:
            response = chat.send_message(
                message=text
            )

            return response.text

        except Exception as e:
            if "503" in str(e) and attempt < 1:
                time.sleep(2)
            else:
                return "Unexpected technical difficulty arrived."
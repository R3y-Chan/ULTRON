import os
import time

from dotenv import load_dotenv
from google import genai
from .Responses import RESPONSES
from .Responses import check_response

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

chat = client.chats.create(
    model="gemini-3.8-flash"
)


def ask_brain(text):
    hardcoded = check_response(text)

    if hardcoded:
        return hardcoded

    # if not found it asks Gemini
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
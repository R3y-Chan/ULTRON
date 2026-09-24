import pyttsx3
from config import VOICE_RATE, VOICE_VOLUME

def speak(text):
    engine = pyttsx3.init()

    engine.setProperty("rate", VOICE_RATE)
    engine.setProperty("volume", VOICE_VOLUME)

    engine.say(text)
    engine.runAndWait()
    engine.stop()
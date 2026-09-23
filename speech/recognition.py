import speech_recognition as sr
from speech_recognition import Recognizer

recognizer = sr.Recognizer()


def listen ():
    with sr.Microphone() as source :
        print ("Listening...")

        recognizer.adjust_for_ambient_noise(source, duration=0.5)

        audio = recognizer.listen(source)
        try:
            text = recognizer.recognize_google(audio)
            print("You:", text)
            return text

        except sr.UnknownValueError:
            print("ULTRON: I didn't understand that.")
            return ""

        except sr.RequestError:
            print("ULTRON: Speech recognition service unavailable.")
            return ""
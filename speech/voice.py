import pyttsx3


def speak(text):
    engine = pyttsx3.init()

    engine.setProperty("rate", 150)
    engine.setProperty("volume", 2.0)

    engine.say(text)
    engine.runAndWait()
    engine.stop()
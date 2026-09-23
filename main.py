from brain.brain import ask_brain
from speech.recognition import listen
from speech.voice import speak
from brain.commands import check_command

from music.Player import (
    play_song,
    queue_song,
    pause_song,
    resume_song,
    stop_song,
    play_next,
    update,
    play_previous
)


print("Ultron Online...")


def main():

    while True:

        # Check if the current song has finished
        # and automatically play the next queued song
        update()

        # Listen for user
        user_input = listen()

        if not user_input:
            continue

        # Shutdown
        if user_input.lower() == "exit":
            print("Ultron: Shutting Down")
            break

        # Check for commands
        command = check_command(user_input)

        if command:

            response = None

            if command["command"] == "play_music":
                if play_song(command["data"]):
                    response = f"Playing {command['data']}."
                else:
                    response = f"I couldn't find {command['data']}."

            elif command["command"] == "queue_music":
                result = play_song(command["data"])

                if result == "local":
                    response = f"Playing {command['data']}."

                elif result == "youtube":
                    response = f"I couldn't find {command['data']} locally, so I'm opening it on YouTube."

                else:
                    response = f"I couldn't play {command['data']}."

            elif command["command"] == "pause_music":
                pause_song()
                response = "Paused."

            elif command["command"] == "resume_music":
                resume_song()
                response = "Resuming."

            elif command["command"] == "stop_music":
                stop_song()
                response = "Stopped."

            elif command["command"] == "next_song":
                if play_next():
                    response = "Playing next song."
                else:
                    response = "The queue is empty."


            elif command["command"] == "previous_song":

                if play_previous():

                    response = "Playing previous song."

                else:

                    response = "There is no previous song."

            print("ULTRON:", response)
            speak(response)

            continue

        # If it wasn't a command,
        # send it to the normal brain
        response = ask_brain(user_input)

        print("ULTRON:", response)
        speak(response)


main()
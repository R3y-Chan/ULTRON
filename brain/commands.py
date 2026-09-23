def check_command(text):
    text = text.lower().strip()

    #the queue
    if text.startswith("play next "):
        song_name = text[10:].strip()


        if song_name:
            return {
                "command": "queue_music",
                "data": song_name
            }
    if text.startswith("add "):
        song_name = text[4:].strip()

        if song_name.endswith(" to queue"):
            song_name = song_name[:-9].strip()

        if song_name:
            return {
                "command": "queue_music",
                "data": song_name
            }


    # Play immediately
    if text.startswith("play "):
        song_name = text[5:].strip()

        if song_name:
            return {
                "command": "play_music",
                "data": song_name
            }


    # Ayo Pause
    if text in ["pause", "pause music"]:
        return {
            "command": "pause_music",
            "data": None
        }

    # Resume the fight
    if text in ["resume", "resume music"]:
        return {
            "command": "resume_music",
            "data": None
        }

    # Stop it!!!
    if text in ["stop", "stop music","stop the song","stop the music"]:
        return {
            "command": "stop_music",
            "data": None
        }

    # Next lah
    if text in ["next", "next song", "skip"]:
        return {
            "command": "next_song",
            "data": None
        }

    # Previous song bastard
    if text in ["previous", "previous song", "prev"]:
        return {
            "command": "previous_song",
            "data": None
        }

    return None
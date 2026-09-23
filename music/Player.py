import pygame
from pathlib import Path
import yt_dlp
import webbrowser
import subprocess


pygame.mixer.init()

MUSIC_FOLDER = Path(__file__).parent / "songs"

queue = []
history = []
current_song = None
current_player = None


def find_song(song_name):
    song_name = song_name.lower().strip()

    for file in MUSIC_FOLDER.iterdir():
        if file.suffix.lower() == ".mp3":
            if file.stem.lower() == song_name:
                return file

    return None


def play_on_youtube(song_name):
    global current_player

    try:
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "extract_flat": True
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(
                f"ytsearch1:{song_name} song",
                download=False
            )

        if not info or not info.get("entries"):
            return False

        video = info["entries"][0]

        video_url = video.get("url")

        if not video_url:
            video_id = video.get("id")

            if not video_id:
                return False

            video_url = f"https://www.youtube.com/watch?v={video_id}"

        webbrowser.open(video_url)

        current_player = "youtube"

        return True

    except Exception as e:
        print("YouTube error:", e)
        return False


def play_song(song_name):
    global current_song
    global current_player

    song_path = find_song(song_name)

    if not song_path:
        if play_on_youtube(song_name):
            return "youtube"

        return False

    current_player = "local"
    current_song = song_path

    if not history or history[-1] != song_path:
        history.append(song_path)

    pygame.mixer.music.load(str(song_path))
    pygame.mixer.music.play()

    return "local"


def queue_song(song_name):
    song_path = find_song(song_name)

    if not song_path:
        return False

    queue.append(song_path)

    return True


def play_next():
    global current_song
    global current_player

    if not queue:
        return False

    next_song = queue.pop(0)

    current_song = next_song
    current_player = "local"

    if not history or history[-1] != next_song:
        history.append(next_song)

    pygame.mixer.music.load(str(next_song))
    pygame.mixer.music.play()

    return True


def play_previous():
    global current_song
    global current_player

    if len(history) < 2:
        return False

    history.pop()

    previous_song = history[-1]

    current_song = previous_song
    current_player = "local"

    pygame.mixer.music.load(str(previous_song))
    pygame.mixer.music.play()

    return True


def update():
    if not pygame.mixer.music.get_busy() and queue:
        play_next()


def stop_song():
    global current_player

    if current_player == "local":
        pygame.mixer.music.stop()

    elif current_player == "youtube":
        subprocess.run(
            ["taskkill", "/IM", "firefox.exe", "/F"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

    current_player = None


def pause_song():
    pygame.mixer.music.pause()


def resume_song():
    pygame.mixer.music.unpause()


def get_queue():
    return queue.copy()
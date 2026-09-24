# ULTRON

ULTRON is a personal Python voice assistant built from scratch. The
current V1 is voice-first and modular.

## Current Features

-   Speech recognition
-   Text-to-speech
-   Direct command detection
-   Hardcoded conversational responses
-   Built-in definitions
-   Gemini conversational fallback
-   Local music playback
-   Music queue
-   Pause, resume, stop, next, previous
-   YouTube fallback for songs not stored locally
-   Time command
-   Weather module
-   Local Flask web UI
-   Automatic UI startup when ULTRON starts

There is currently **no dialogue/text input box and no wake word**.

------------------------------------------------------------------------

## Project Structure

``` text
ULTRON/
├── main.py
├── config.py
├── README.md
├── .gitignore
├── .env
│
├── brain/
│   ├── __init__.py
│   ├── brain.py
│   ├── commands.py
│   ├── Responses.py
│   ├── definations.py
│   └── weather.py
│
├── speech/
│   ├── __init__.py
│   ├── recognition.py
│   └── voice.py
│
├── music/
│   ├── __init__.py
│   ├── Player.py
│   └── songs/
│       └── *.mp3
│
└── ui/
    ├── app.py
    ├── templates/
    │   └── index.html
    └── static/
        ├── style.css
        └── script.js
```

`definations.py` keeps the project's current spelling.

------------------------------------------------------------------------

# Installation

## Requirements

-   Python 3.13.1
-   PyCharm or another Python IDE
-   Git
-   Working microphone
-   Speakers/headphones
-   Modern browser
-   Internet connection for online services

## Create the virtual environment

``` bash
python -m venv .venv
```

Windows:

``` bash
.venv\Scripts\activate
```

## Install dependencies

``` bash
pip install SpeechRecognition PyAudio
pip install pyttsx3
pip install pygame
pip install yt-dlp
pip install requests
pip install flask
pip install -U google-genai python-dotenv
```

------------------------------------------------------------------------

# Environment Variables

Create `.env` in the project root:

``` env
GEMINI_API_KEY=your_actual_key_here
```

Never commit `.env` to GitHub.

Recommended `.gitignore`:

``` gitignore
.venv/
__pycache__/
*.pyc
.idea/
.env
```

The current Gemini model is:

``` text
gemini-2.5-flash
```

------------------------------------------------------------------------

# Running ULTRON

Start everything with:

``` bash
python main.py
```

The intended startup sequence is:

``` text
main.py
  ↓
Flask UI starts
  ↓
Browser opens automatically
  ↓
ULTRON voice loop starts
  ↓
Microphone input
```

The local UI is available at:

``` text
http://127.0.0.1:5000
```

------------------------------------------------------------------------

# Architecture

``` text
                 ULTRON
                    │
             ┌──────┴──────┐
             │             │
          Backend          UI
             │             │
       ┌─────┼─────┐       │
       │     │     │       │
     Speech Brain Music   Flask
       │     │     │       │
       └─────┼─────┘       │
             │             │
             └──────┬──────┘
                    │
                 Browser
```

The Python backend remains responsible for voice recognition, commands,
brain logic, music and other actions. The web UI is the visual
interface.

------------------------------------------------------------------------

# Speech Recognition

`speech/recognition.py` handles:

``` text
Microphone → SpeechRecognition → Text
```

The recognition system prints errors rather than speaking them.

Typical flow:

``` python
text = recognizer.recognize_google(audio)
```

The returned text is passed to `main.py`.

------------------------------------------------------------------------

# Text-to-Speech

`speech/voice.py` handles:

``` text
Text → pyttsx3 → Speaker
```

The selected Windows voice is currently Hazel.

Typical settings:

``` python
engine.setProperty("rate", 175)
engine.setProperty("volume", 1.0)
```

The project currently initializes a fresh speech engine for each
`speak()` call.

Voice indexes can differ between Windows installations.

------------------------------------------------------------------------

# Command System

`brain/commands.py` detects direct commands.

The design is intentionally simple for V1.

Example:

``` python
{
    "command": "play_music",
    "data": "macarena"
}
```

Another example:

``` python
{
    "command": "get_time",
    "data": None
}
```

The flow is:

``` text
Speech
  ↓
commands.py
  ↓
Structured command
  ↓
main.py
  ↓
Correct module performs the action
```

------------------------------------------------------------------------

# Brain

`brain/brain.py` handles non-command conversations.

Current priority:

``` text
User input
    ↓
Hardcoded responses
    ↓
ULTRON definitions
    ↓
Gemini fallback
```

`brain/Responses.py` contains fixed conversational responses.

`brain/definations.py` contains ULTRON's built-in definitions.

Example:

``` python
DEFINITIONS = {
    "python": "Python is a high-level programming language commonly used for software development, automation, data science, and AI.",
    "git": "Git is a version control system used to track changes in code.",
    "github": "GitHub is a platform for hosting and collaborating on software projects using Git."
}
```

Gemini is intended as a conversational fallback, not as the entire
knowledge system.

------------------------------------------------------------------------

# Music

Music is handled by:

``` text
music/Player.py
```

Local music files belong in:

``` text
music/songs/
```

Example:

``` text
music/
├── Player.py
└── songs/
    ├── Macarena.mp3
    ├── Wasteland.mp3
    └── Example.mp3
```

## Supported V1 actions

``` text
play
pause
resume
stop
next
previous
queue
```

Example commands:

``` text
play Macarena
play next Wasteland
next song
previous song
pause
resume
stop
```

------------------------------------------------------------------------

# Music Flow

``` text
Requested song
      ↓
Search music/songs/
      │
      ├── Found
      │    ↓
      │  pygame
      │
      └── Not found
           ↓
        YouTube
```

`yt-dlp` is currently used to find a YouTube result. The V1 fallback
opens the result in the browser.

The current YouTube stop implementation may close all Firefox processes
when stopping a YouTube playback. This is intentionally simple for V1
and can be made more precise later.

------------------------------------------------------------------------

# Time

Time is handled locally with Python.

Supported examples include:

``` text
what time is it
what's the time
tell me the time
current time
```

No API is required.

------------------------------------------------------------------------

# Weather

`brain/weather.py` uses Open-Meteo.

No API key is required.

The current implementation uses configured coordinates rather than
automatically determining precise user location.

------------------------------------------------------------------------

# Web UI

The frontend is served through Flask.

Required structure:

``` text
ui/
├── app.py
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

`ui/app.py` renders the HTML:

``` python
from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
```

In `index.html`, Flask static files should be referenced as:

``` html
<link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
```

and:

``` html
<script src="{{ url_for('static', filename='script.js') }}"></script>
```

The UI is currently voice-only:

-   No dialogue box
-   No text input
-   No browser-based speech recognition
-   No wake word

The existing Python speech system remains responsible for listening.

------------------------------------------------------------------------

# UI Startup

`main.py` starts the Flask application in a background thread so the
Python voice loop can continue running.

Conceptually:

``` text
Run main.py
   │
   ├── Start Flask
   │      ↓
   │   Open browser
   │
   └── Start ULTRON
          ↓
       Listen
```

The browser should automatically open:

``` text
http://127.0.0.1:5000
```

------------------------------------------------------------------------

# Main Execution Flow

``` text
Start ULTRON
     ↓
Start UI
     ↓
Listen
     ↓
Speech → Text
     ↓
Check exit
     ↓
Check command
     │
     ├── Command found
     │      ↓
     │   Execute action
     │      ↓
     │   Speak response
     │
     └── No command
            ↓
         ask_brain()
            ↓
         Speak response
            ↓
         Listen again
```

`exit` currently shuts down the main ULTRON loop.

------------------------------------------------------------------------

# Git Workflow

Check changes:

``` bash
git status
```

Stage:

``` bash
git add .
```

Commit:

``` bash
git commit -m "Describe the change"
```

Push:

``` bash
git push
```

Example:

``` bash
git add .
git commit -m "Add ULTRON web UI"
git push
```

Never commit:

``` text
.env
.venv/
.idea/
__pycache__/
*.pyc
```

------------------------------------------------------------------------

# File Responsibilities

  File                        Responsibility
  --------------------------- --------------------------------
  `main.py`                   Starts and coordinates ULTRON
  `config.py`                 Project configuration
  `brain/brain.py`            Brain/response logic
  `brain/commands.py`         Direct command detection
  `brain/Responses.py`        Fixed conversational responses
  `brain/definations.py`      Built-in definitions
  `brain/weather.py`          Weather
  `speech/recognition.py`     Speech → text
  `speech/voice.py`           Text → speech
  `music/Player.py`           Music playback and queue
  `music/songs/`              Local music
  `ui/app.py`                 Flask server
  `ui/templates/index.html`   UI HTML
  `ui/static/style.css`       UI styling
  `ui/static/script.js`       UI behavior

------------------------------------------------------------------------

# Troubleshooting

## Browser opens but page is blank

Verify:

``` text
ui/
├── app.py
├── templates/
│   └── index.html
└── static/
    ├── style.css
    └── script.js
```

Also verify that `index.html` uses Flask's `url_for('static', ...)`
paths.

## Flask does not open

Check that port `5000` is available and that Flask is running.

## Microphone does not work

Check Windows microphone permissions, the default microphone, and the
PyAudio installation.

## TTS does not speak

Check Windows output, available pyttsx3 voices, and the selected voice
index.

## Gemini fails

Check `.env`, the API key, internet connectivity, and Gemini
availability.

## Local song is not found

Put the `.mp3` inside:

``` text
music/songs/
```

and make sure the filename matches the requested song closely enough for
the current `find_song()` implementation.

------------------------------------------------------------------------

# Development Philosophy

ULTRON is being built incrementally.

The current V1 should remain understandable and should not be
over-engineered.

## Do

-   Build each subsystem separately
-   Test one change at a time
-   Keep modules focused
-   Commit changes regularly
-   Keep secrets in `.env`
-   Keep UI and backend logically separate
-   Let `main.py` coordinate the systems

## Avoid for now

-   Huge command-parser rewrites
-   Unnecessary databases
-   Large frameworks
-   Complicated event systems
-   Rebuilding the existing UI without a reason
-   Moving the voice system into JavaScript
-   Adding a text chat box
-   Adding a wake word unless the design changes

------------------------------------------------------------------------

# Current Status

## Implemented

-   Python backend
-   Speech recognition
-   Text-to-speech
-   Hardcoded responses
-   Built-in definitions
-   Gemini fallback
-   Music playback
-   Music queue
-   Pause/resume/stop
-   Next/previous
-   YouTube fallback
-   Time command
-   Weather module
-   Flask UI
-   Automatic browser/UI startup

## Next Integration Work

-   Send backend state to the UI
-   Display listening/processing states
-   Display ULTRON responses
-   Display music state
-   Improve automatic queue advancement while microphone input is
    blocking
-   Keep the entire system voice-first

------------------------------------------------------------------------

# V1 Goal

The goal is a working personal assistant, not an over-engineered AI
platform.

``` text
                 ULTRON
                    │
        ┌───────────┼───────────┐
        │           │           │
      Voice       Brain         UI
        │           │           │
     Listen      Answers       Orb
     Speak       Commands      Clock
        │           │           │
        └───────────┼───────────┘
                    │
              Music / Weather
```

Everything should remain understandable, testable, and built by the
project owner.

------------------------------------------------------------------------

# Ownership

ULTRON is a personal development project.

UI components contributed by collaborators should remain credited to
their respective contributors.

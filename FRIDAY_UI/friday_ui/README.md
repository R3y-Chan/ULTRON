# FRIDAY UI

A browser-based FRIDAY assistant HUD matching the supplied reference: dark blue/cyan sci-fi interface, animated orb, animated voice waveform, live clock/date, left reference command panel, and a right transcript panel.

## Run

Because microphone permissions are involved, run this from localhost rather than opening the HTML with `file://`.

### Option 1 — Python
```bash
cd friday_ui
python -m http.server 8000
```
Then open:
http://localhost:8000

### Option 2 — VS Code
Install/use Live Server and open `index.html`.

## Microphone + speech-to-text

Click the central orb. The browser asks for microphone permission, then:
- the orb switches to LISTENING and becomes more active
- the waveform responds to microphone audio
- live/interim speech appears in the transcript panel
- finalized speech is added as a final transcript
- a `friday-command` browser event is emitted for your command router

Chrome / Edge provide the best support for the Web Speech API. If speech recognition is unavailable, the microphone can still drive the visual audio animation.

## Connecting your FRIDAY backend

The key integration point is:

```js
window.addEventListener('friday-command', e => {
  const spokenCommand = e.detail.text;
  // Send spokenCommand to your Python/local FRIDAY backend here.
});
```

You can replace that block with:
- a WebSocket connection
- `fetch()` to a local API
- a Tauri/Electron bridge
- a localhost Python server

No visible text input is included, as requested.

## Main files

- `index.html` — HUD structure
- `style.css` — reference-inspired layout and visuals
- `script.js` — animation, clock, mic access, speech-to-text, transcript handling

## Design notes

The orb and waveform are drawn in Canvas so they animate continuously without needing a static image asset. The idle state has gentle motion; microphone activation increases orb motion and waveform amplitude.

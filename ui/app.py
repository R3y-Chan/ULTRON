from flask import Flask, render_template, jsonify

app = Flask(__name__)

ultron_state = "IDLE"


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/state")
def state():
    return jsonify({
        "state": ultron_state
    })


def set_state(state):
    global ultron_state
    ultron_state = state


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
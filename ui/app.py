from flask import Flask, render_template
from config import UI_HOST, UI_PORT

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(host=UI_HOST, port=UI_PORT)
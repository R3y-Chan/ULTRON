function updateClock() {

    const now = new Date();

    const time = now.toLocaleTimeString("en-GB", {
        hour12: false
    });

    const date = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).toUpperCase();

    document.getElementById("time").textContent = time;
    document.getElementById("date").textContent = date;
}


async function updateState() {

    try {

        const response = await fetch("/state");

        const data = await response.json();

        const state = data.state;

        document.getElementById("state").textContent = state;
        document.getElementById("right-state").textContent = state;


        const message = document.getElementById("message");
        const rightMessage = document.getElementById("right-message");


        if (state === "LISTENING") {

            message.textContent = "LISTENING...";
            rightMessage.textContent = "LISTENING";

        }

        else if (state === "PROCESSING") {

            message.textContent = "PROCESSING...";
            rightMessage.textContent = "THINKING";

        }

        else if (state === "SPEAKING") {

            message.textContent = "SPEAKING...";
            rightMessage.textContent = "RESPONDING";

        }

        else if (state === "PLAYING") {

            message.textContent = "PLAYING MUSIC...";
            rightMessage.textContent = "PLAYING";

        }

        else {

            message.textContent = "STANDING BY";
            rightMessage.textContent = "STANDING BY";

        }

    }

    catch (error) {

        console.log("ULTRON backend unavailable.");

    }
}


updateClock();
updateState();

setInterval(updateClock, 1000);
setInterval(updateState, 250);
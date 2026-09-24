/* clock */

function updateClock() {
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();

    let ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours || 12;

    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");

    document.getElementById("clock").textContent =
        `${hours}:${minutes} ${ampm}`;
}

updateClock();

setInterval(updateClock, 1000);


/* SAMPLE PROMPTS */

const samplePrompts = [
    "Sample Prompt 1",
    "Sample Prompt 2",
    "Sample Prompt 3",
    "Sample Prompt 4",
    "Sample Prompt 5",
    "Sample Prompt 6"
];

// you can add or subtract more just by adding more in the list btw

const promptContainer = document.getElementById("sample-prompts");

// Heading
const heading = document.createElement("div");
heading.classList.add("sample-heading");
heading.textContent = "SAMPLE PROMPTS";
promptContainer.appendChild(heading);

// Prompts
samplePrompts.forEach(prompt => {
    const promptElement = document.createElement("div");

    promptElement.classList.add("sample-prompt");
    promptElement.textContent = prompt;

    promptContainer.appendChild(promptElement);
});




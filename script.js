const userInput = document.getElementById("userInput");
const fileInput = document.getElementById("fileInput");
const submitBtn = document.getElementById("submitBtn");
const chatArea = document.getElementById("chatArea");

submitBtn.addEventListener("click", () => {
    const text = userInput.value.trim();
    if (text) {
        addMessage(text, "user");
        userInput.value = "";
        addMessage("absolutely", "bot");
    }
});

userInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        const text = userInput.value.trim();
        if (text) {
            addMessage(text, "user");
            userInput.value = "";
            addMessage("absolutely", "bot");
        }
    }
});

fileInput.addEventListener("change", async (event) => {
    if (event.target.files.length > 0) {
        const file = event.target.files[0];
        let text = "";

        if (file.type === "application/pdf") {
            text = await extractTextFromPdf(file);
        } else if (file.type === "text/plain") {
            text = await extractTextFromTxt(file);
        } else {
            console.error("Unsupported file type");
            return;
        }

        if (text) {
            addMessage(text, "user");
            addMessage("absolutely", "bot");
        }
    }
});

async function extractTextFromPdf(file) {
    const pdf = await pdfjsLib.getDocument({ url: URL.createObjectURL(file) }).promise;
    const numPages = pdf.numPages;
    let text = "";

    for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ");
    }

    return text;
}

async function extractTextFromTxt(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            resolve(event.target.result);
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsText(file);
    });
}

function addMessage(text, sender) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender === "user" ? "user" : "chatbot", "chat-bubble");
    messageElement.textContent = text;
    chatArea.appendChild(messageElement);
}

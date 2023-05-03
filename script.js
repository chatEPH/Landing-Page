const userInput = document.getElementById("userInput");
const fileInput = document.getElementById("fileInput");
const submitBtn = document.getElementById("submitBtn");
const chatArea = document.getElementById("chatArea");

const conversationHistory = [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    }
  ];



submitBtn.addEventListener("click", async () => {
    const text = userInput.value.trim();
    if (text) {
      addMessage(text, "user");
      userInput.value = "";
      const botResponse = await getGPT3Response(text, conversationHistory);
      addMessage(botResponse, "bot");
  
      // Add the bot's response to the conversation history
      conversationHistory.push({
        "role": "assistant",
        "content": botResponse
      });
    }
  });
  
  userInput.addEventListener("keypress", async (event) => {
    if (event.key === "Enter") {
      const text = userInput.value.trim();
      if (text) {
        addMessage(text, "user");
        userInput.value = "";
        const botResponse = await getGPT3Response(text, conversationHistory);
        addMessage(botResponse, "bot");
  
        // Add the bot's response to the conversation history
        conversationHistory.push({
          "role": "assistant",
          "content": botResponse
        });
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
  
        // Update conversation history with user input from the file
        conversationHistory.push({
          "role": "user",
          "content": text
        });
  
        // Get GPT-3.5 Turbo response and display it
        const botResponse = await getGPT3Response(text, conversationHistory);
        addMessage(botResponse, "bot");
  
        // Add the bot's response to the conversation history
        conversationHistory.push({
          "role": "assistant",
          "content": botResponse
        });
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


async function getGPT3Response(prompt, conversationHistory) {
    // Add the new user message to the conversation history
    conversationHistory.push({
      "role": "user",
      "content": prompt
    });
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ######################################' // Replace YOUR_API_KEY with your actual API key
      },
      body: JSON.stringify({
        "model": "gpt-3.5-turbo", // Change to the desired model
        "messages": conversationHistory,
        "temperature": 0.5,
        "max_tokens": 4000
      })
    });
  
    if (!response.ok) {
        console.error("API error:", data); // Log the error message
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
    const data = await response.json();
    console.log("Received data:", data); // Add this line to log the response data
  
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content.trim();
    } else {
      return 'I am sorry, I could not generate a response.';
    }
  }
  
  
  
  
    
  
  

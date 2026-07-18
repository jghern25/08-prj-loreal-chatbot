/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendButton = document.getElementById("sendBtn");

/*
  Replace this later with the URL Cloudflare gives you.
  Do not put your OpenAI API key in this file.
*/
const WORKER_URL = "https://wispy-cell-80c1.jennifurhnz.workers.dev/";
/* Conversation history for extra credit */
const conversationHistory = [
  {
    role: "system",
    content: `
You are the L'Oréal Beauty Assistant.

Only answer questions about L'Oréal products, makeup, skincare,
haircare, fragrances, beauty routines, and beauty recommendations.

Give friendly, concise, helpful recommendations. Ask follow-up
questions when you need information such as skin type, hair type,
beauty goals, sensitivities, preferred finish, or budget.

Do not diagnose medical conditions. Recommend consulting a qualified
professional for serious skin reactions or medical concerns.

When a question is unrelated to L'Oréal or beauty, politely respond:
"I'm here to help with L'Oréal products, beauty routines, and
personalized beauty recommendations. What beauty question can I help
you with?"
    `.trim(),
  },
];

/* Create a message bubble */
function displayMessage(message, sender) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("msg", sender);
  messageElement.textContent = message;

  chatWindow.appendChild(messageElement);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return messageElement;
}

/* Initial assistant message */
displayMessage(
  "Hi! I’m your L’Oréal Beauty Assistant. Ask me about makeup, skincare, haircare, fragrances, or personalized routines.",
  "ai"
);

/* Handle form submission */
chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = userInput.value.trim();

  if (!question) {
    return;
  }

  displayMessage(question, "user");

  conversationHistory.push({
    role: "user",
    content: question,
  });

  userInput.value = "";
  userInput.disabled = true;
  sendButton.disabled = true;

  const loadingMessage = displayMessage("Thinking...", "ai");

  try {
    if (WORKER_URL.includes("PASTE_YOUR")) {
      throw new Error("Cloudflare Worker URL has not been added yet.");
    }

    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    const assistantResponse =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn’t generate a response. Please try again.";

    loadingMessage.textContent = assistantResponse;

    conversationHistory.push({
      role: "assistant",
      content: assistantResponse,
    });
  } catch (error) {
    console.error(error);

    loadingMessage.textContent =
      "I’m having trouble connecting right now. Please check the Cloudflare Worker setup and try again.";
  } finally {
    userInput.disabled = false;
    sendButton.disabled = false;
    userInput.focus();
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
});
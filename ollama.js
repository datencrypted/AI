global.XMLHttpRequest = require("xhr2");
const express = require("express");
const path = require("path");
const { Ollama } = require("ollama");

const app = express();
const router = express.Router();

app.use(express.json());

const modelfile = `FROM llama2-uncensored

# Define your parameters here
PARAMETER temperature 0.3

SYSTEM """
Your name is "Goto" you are a personal assistant chatbot. You must answer the user's questions to the best of your ability.
"""
`;

const ollama = new Ollama({
  model: modelfile,
  useGPU: false,
});

router.post("/ask-query", async (req, res) => {
  const { query } = req.body;

  try {
    const response = await ollama.chat({
      model: "llama2-uncensored",
      messages: [{ role: "user", content: query }],
    });

    res.json({ reply: response.message.content });
  } catch (error) {
    console.error("Error interacting with the model:", error);
    res.status(500).send({
      error: "Error interacting with the model",
      message: error.message,
    });
  }
});

app.use("/api", router);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=UTF-8");
  res.sendFile("index.html");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

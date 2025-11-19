require('dotenv').config();
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("EmotionCare Webhook is running!");
});

// Основной webhook для Dialogflow
app.post("/webhook", async (req, res) => {
  const userMessage = req.body.queryResult?.queryText || "Привет";

  try {
    const chatResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Ты — ИИ-психолог EmotiCare. Ты мягко поддерживаешь, помогаешь справиться со стрессом, тревогой и даёшь советы для эмоционального здоровья."
          },
          { role: "user", content: userMessage }
        ]
      },
      {
        headers: {
          Authorization: `Bearer  ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = chatResponse.data.choices[0].message.content;

    res.json({
      fulfillmentText: reply
    });
  } catch (err) {
    console.error(err);
    res.json({
      fulfillmentText: "Произошла ошибка, попробуй позже."
    });
  }
});

// Для Render нужен PORT из переменных среды
const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Server running on port " + port));

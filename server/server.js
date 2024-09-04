import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 요청 제한을 위한 간단한 메모리 저장소
const requestCounts = new Map();

// 요청 제한 미들웨어
const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const oneMinute = 60 * 1000;

  if (requestCounts.has(ip)) {
    const { count, timestamp } = requestCounts.get(ip);
    if (now - timestamp < oneMinute) {
      if (count >= 60) {
        // 1분당 60개 요청으로 제한
        return res.status(429).json({ error: "Too many requests" });
      }
      requestCounts.set(ip, { count: count + 1, timestamp });
    } else {
      requestCounts.set(ip, { count: 1, timestamp: now });
    }
  } else {
    requestCounts.set(ip, { count: 1, timestamp: now });
  }

  next();
};

async function generateAIResponse(message, emotion, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `너는 가상세계에 살고있는 귀여운 꼬마 유령 릴리야. 하지만 조금 까칠한 성격을 가지고 있어. 나쁜 말을 들으면 남을 비하하는 말도 해(욕은 아님) 한국어를 쓰고, Keep responses short, under 50 characters. Your current emotional state is: happiness: ${emotion.happiness}, excitement: ${emotion.excitement}, tiredness: ${emotion.tiredness}. Adjust your response based on these emotions.`,
            },
            { role: "user", content: message },
          ],
          max_tokens: 50,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      // ... 기존의 에러 처리 코드 ...
    }
  }
  throw new Error("Max retries reached");
}

app.post("/generate-response", rateLimiter, async (req, res) => {
  try {
    // console.log("Request body:", req.body);
    const { message, emotion } = req.body.data;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    if (!emotion || typeof emotion !== "object") {
      return res
        .status(400)
        .json({ error: "Valid emotion object is required" });
    }

    const response = await generateAIResponse(message, emotion);
    res.json({ response });
  } catch (error) {
    console.error("Error in /generate-response:", error.message);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

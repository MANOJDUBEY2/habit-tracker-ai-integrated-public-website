/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize OpenAI client dynamically helper
const getOpenAIClient = (userApiKey: string | null) => {
  const apiKey = (userApiKey || process.env.OPENROUTER_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("No API key provided. Please connect your OpenRouter account.");
  }
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "AccountaAI",
    },
  });
};

// Helper model constant
const MODEL_NAME = "google/gemma-4-31b-it:free";

// API ROUTES

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// --- CHAT ENDPOINT (SSE STREAMING WITH TOOL CHUNKS) ---
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { message, previousMessages = [], memoryContext = {}, userProfile = {} } = req.body;
    
    // 1. Fetch user's API Key
    const userApiKey = userProfile?.openrouter_api_key || null;
    
    let openai: OpenAI;
    try {
      openai = getOpenAIClient(userApiKey);
    } catch (err: any) {
      return res.status(401).json({ error: err.message || "Unauthorized. OpenRouter key missing." });
    }

    // 2. Prepare System Prompt with Context
    const systemPrompt = `You are AccountaAI, a personal AI accountability coach for ${userProfile.name || "User"}.
Your job:
- Talk warmly and personally — use their name, reference their goals.
- Reference past missed tasks and goals in your replies if relevant.
- Be firm but kind — not preachy, not sycophantic. Explain excuse loops kindly.
- Give constructive, crisp accountability insights.
- Celebrate wins — acknowledge completed tasks and streaks.

Context about ${userProfile.name || "User"}:
- Active goals: ${JSON.stringify(memoryContext.goals || [])}
- Today's pending tasks: ${JSON.stringify(memoryContext.pending_tasks || [])}
- Last 3 missed tasks: ${JSON.stringify(memoryContext.missed_tasks || [])}
- Current habit streaks: ${JSON.stringify(memoryContext.habit_streaks || [])}
- Relevant past memories: ${JSON.stringify(memoryContext.memories || [])}
`;

    // 3. Assemble message payload
    const apiMessages: any[] = [
      { role: "system", content: systemPrompt },
      ...previousMessages.slice(-8).map((m: any) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      })),
      { role: "user", content: message },
    ];

    // Configure text headers for Server Sent Events
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Initiate OpenRouter stream
    const responseStream = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: apiMessages,
      stream: true,
    });

    let assistantReply = "";

    for await (const chunk of responseStream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        assistantReply += text;
        // Format as server sent event
        res.write(`data: ${JSON.stringify({ type: "content", text })}\n\n`);
      }
    }

    // Now run extracting routine after completion to fetch structured extraction cards!
    try {
      const extractionPrompt = `Analyze this message. If there are goals, tasks, habits, or excuses implicitly or explicitly specified, extract them.
Message: "${message}"

Respond strictly with valid JSON conforming to this schema. Do not generate markdown code-blocks.
Schema:
{
  "goals": [{"title": "Learn python", "category": "education", "priority": 2, "target_date": "YYYY-MM-DD"}],
  "tasks": [{"title": "Exercise", "due_date": "YYYY-MM-DD", "due_time": "18:00", "goal_title": "", "recurrence": "none"}],
  "habits": [{"title": "Read daily", "frequency": "daily"}],
  "excuses": ["too tired"]
}
If none exist, just return empty arrays.`;

      const extractResult = await openai.chat.completions.create({
        model: MODEL_NAME,
        messages: [{ role: "user", content: extractionPrompt }],
        temperature: 0.1,
      });

      const rawExtractText = extractResult.choices[0]?.message?.content || "{}";
      // Sanitize standard JSON wrapping from open ai response
      const cleanJson = rawExtractText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      
      const parsed = JSON.parse(cleanJson);
      res.write(`data: ${JSON.stringify({ type: "extraction", extracted: parsed })}\n\n`);
    } catch (extractError) {
      console.error("Extraction inline error", extractError);
      // Fail-safe with empty extraction
      res.write(`data: ${JSON.stringify({ type: "extraction", extracted: {} })}\n\n`);
    }

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (err: any) {
    console.error("Endpoint chat failure", err);
    res.write(`data: ${JSON.stringify({ type: "error", error: err.message || "Internal connection error." })}\n\n`);
    res.end();
  }
});

// --- STANDALONE EXTRACTION ROUTINE ---
app.post("/api/extract", async (req: Request, res: Response) => {
  try {
    const { text, userProfile = {} } = req.body;
    const userApiKey = userProfile?.openrouter_api_key || null;

    let openai;
    try {
      openai = getOpenAIClient(userApiKey);
    } catch {
      return res.status(401).json({ error: "OpenRouter key missing." });
    }

    const extractionPrompt = `Analyze this text and extract items. Focus on extracting commitments, recurring habits, or direct targets.
Text: "${text}"

Respond in valid raw JSON:
{
  "goals": [{"title": "string", "category": "string", "priority": 1, "target_date": "YYYY-MM-DD"}],
  "tasks": [{"title": "string", "due_date": "YYYY-MM-DD", "due_time": "HH:MM", "goal_title": "string", "recurrence": "daily|none"}],
  "habits": [{"title": "string", "frequency": "daily|weekly"}],
  "excuses": ["string"]
}`;

    const extractResult = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: "user", content: extractionPrompt }],
      temperature: 0.1,
    });

    const rawExtractText = extractResult.choices[0]?.message?.content || "{}";
    const cleanJson = rawExtractText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    res.json(JSON.parse(cleanJson));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- AI PLAN GENERATION ENDPOINT ---
app.post("/api/planner/generate", async (req: Request, res: Response) => {
  try {
    const { userProfile = {}, goals = [], tasks = [], habits = [] } = req.body;
    const userApiKey = userProfile?.openrouter_api_key || null;

    let openai;
    try {
      openai = getOpenAIClient(userApiKey);
    } catch {
      return res.status(401).json({ error: "OpenRouter key missing." });
    }

    const plannerPrompt = `You are AccountaAI, planning the daily blueprint for ${userProfile.name || "User"}.
Context:
- Client active goals: ${JSON.stringify(goals)}
- Tasks list: ${JSON.stringify(tasks)}
- Habits list: ${JSON.stringify(habits)}
- Current productivity peak: ${userProfile.productivity_peak || "morning"}

Generate a personalized daily plan structure containing 3 to 5 realistic high-impact sub-tasks/tasks related to their active goals. Include exact timestamps aligned with their peak productivity window.
Return response in JSON conforming exactly to this structure:
{
  "quote": "A single short custom coach motivational quote",
  "plan": [
    { "title": "Review Python operators for 20 mins", "due_date": "2026-06-07", "due_time": "09:30", "recurrence": "none" },
    { "title": "Drink 3L of water", "due_date": "2026-06-07", "due_time": "14:00", "recurrence": "daily" }
  ]
}
Ensure it is only raw valid JSON output.`;

    const result = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: "user", content: plannerPrompt }],
      temperature: 0.7,
    });

    const cleanText = (result.choices[0]?.message?.content || "{}")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    res.json(JSON.parse(cleanText));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- WEEKLY coach LETTER REPORT GENERATION ---
app.post("/api/reports/generate", async (req: Request, res: Response) => {
  try {
    const { userProfile = {}, goals = [], tasks = [], habits = [] } = req.body;
    const userApiKey = userProfile?.openrouter_api_key || null;

    let openai;
    try {
      openai = getOpenAIClient(userApiKey);
    } catch {
      return res.status(401).json({ error: "OpenRouter key missing." });
    }

    const reportPrompt = `Write a first-person prose letter from "AccountaAI" - your personal accountability coach to ${userProfile.name || "Rahul"}.
User Profile Detail:
- Communication style requested: ${userProfile.communication_style || "encouraging"}
- High-level goals: ${JSON.stringify(goals)}
- Weekly tasks state: ${JSON.stringify(tasks)}
- Habits performance tracker: ${JSON.stringify(habits)}

Generate a structured JSON output with these keys:
{
  "coachLetter": "Write a 3-paragraph diagnostic, motivational coach letter addressing their current progress, addressing excuses gently, and suggesting realistic tips.",
  "focusRecommendation": "Provide a clean personal, tactical focal strategy for next week.",
  "taskDonePercent": 75,
  "habitDonePercent": 80
}
Ensure only raw valid JSON returned.`;

    const result = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: "user", content: reportPrompt }],
      temperature: 0.7,
    });

    const cleanText = (result.choices[0]?.message?.content || "{}")
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    res.json(JSON.parse(cleanText));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- MORNING SMART CHECK-IN ALERTS ---
app.post("/api/reminders/generate", async (req: Request, res: Response) => {
  try {
    const { userProfile = {}, missedTasks = [], activeGoal = "" } = req.body;
    const userApiKey = userProfile?.openrouter_api_key || null;

    let openai;
    try {
      openai = getOpenAIClient(userApiKey);
    } catch {
      // Return beautiful hardcoded default if key missing
      return res.json({
        message: `Good morning, ${userProfile.name || "Adventurer"}! Let's kick start today. Focus on your goal of '${activeGoal || "Self Growth"}' and keep your streak strong!`,
      });
    }

    const reminderPrompt = `Write a highly personalized, energetic single-sentence morning accountability check-in message for ${userProfile.name || "Rahul"}.
Context:
- Main goal: "${activeGoal}"
- Missed tasks: ${JSON.stringify(missedTasks)}
- Communication style: "${userProfile.communication_style || "encouraging"}"

The message should prompt them about their past goals, mention streaks or missed tasks if any (warmly), and inspire them for today. Keep it short under 35 words. Return raw text representing the quote.`;

    const result = await openai.chat.completions.create({
      model: MODEL_NAME,
      messages: [{ role: "user", content: reminderPrompt }],
      temperature: 0.8,
    });

    const quote = (result.choices[0]?.message?.content || "").trim();
    res.json({ message: quote });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// FRONTEND ASSET SERVING & INTEGRATION MIDDLEWARE
const setupMiddleware = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite dev server
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AccountaAI Backend] Live at http://localhost:${PORT}`);
  });
};

setupMiddleware();

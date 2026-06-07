/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { UserProfile, ChatMessage, ExtractedItems, Goal, Task, Habit } from "../types";
import { dbService } from "../supabaseClient";
import { speakCoachMessage } from "../utils/speech";
import { ExtractionConfirmCard } from "../components/ExtractionConfirmCard";
import { 
  Send, 
  Bot, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  User, 
  Loader2, 
  CornerDownRight, 
  Undo,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatProps {
  id?: string;
  user: UserProfile;
  goals: Goal[];
  tasks: Task[];
  habits: Habit[];
  onCommitExtraction: (extracted: ExtractedItems) => void;
}

export const Chat: React.FC<ChatProps> = ({
  id,
  user,
  goals,
  tasks,
  habits,
  onCommitExtraction,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [voicePlayback, setVoicePlayback] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load existing chat history from standard local storage/DB on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const conversations = await dbService.getConversations();
        const todayStr = new Date().toISOString().split("T")[0];
        const match = conversations.find((c) => c.date === todayStr);
        if (match && match.messages && match.messages.length > 0) {
          setMessages(match.messages);
        } else {
          // System Starter greeting
          setMessages([
            {
              id: "welcome-system",
              sender: "assistant",
              text: `Hello ${user.name || "Adventurer"}! I am AccountaAI, your warm, firm personal accountability coach.
I am here to ensure you stay aligned with your active targets. Tell me, what's on your mind today? Are there any commitments we should plan, or challenges you're experiencing?`,
              timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
              extracted: null,
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };
    fetchHistory();
  }, [user]);

  // Handle active viewport scrolling
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText("");

    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };

    const nextMessages = [...messages, newMsg];
    setMessages(nextMessages);
    setIsTyping(true);

    try {
      // 1. Compile hot memory context elements to system prompts
      const pendingTasksList = tasks.filter(t => t.status === "pending" && t.due_date === new Date().toISOString().split("T")[0]);
      const missedTasksList = tasks.filter(t => t.status === "pending" && t.due_date && t.due_date < new Date().toISOString().split("T")[0]).slice(0,3);
      const habitStreaks = habits.map(h => `${h.title}: streak ${h.streak_count}d`);

      const memoryContext = {
        goals: goals.filter(g => g.status === "active").map(g => `${g.title} (${g.progress_pct}% complete)`),
        pending_tasks: pendingTasksList.map(t => t.title),
        missed_tasks: missedTasksList.map(t => t.title),
        habit_streaks: habitStreaks,
        memories: ["Tends to be most productive during " + user.productivity_peak],
      };

      // 2. Query Full-Stack Express OpenRouter Proxy Endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          previousMessages: nextMessages,
          memoryContext: memoryContext,
          userProfile: user,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setIsTyping(false);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      let extractionPayload: ExtractedItems | null = null;

      const assistantMsgId = crypto.randomUUID();
      
      // Seed temporary blank assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          sender: "assistant",
          text: "",
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        },
      ]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.slice(6).trim();
              if (dataStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.type === "content") {
                  assistantText += parsed.text;
                  setMessages((prev) =>
                    prev.map((m) => (m.id === assistantMsgId ? { ...m, text: assistantText } : m))
                  );
                } else if (parsed.type === "extraction") {
                  extractionPayload = parsed.extracted;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsgId ? { ...m, extracted: extractionPayload } : m
                    )
                  );
                } else if (parsed.type === "error") {
                  throw new Error(parsed.error);
                }
              } catch (e) {
                // partial json chunks skip
              }
            }
          }
        }
      }

      // Voice trigger if enabled
      if (voicePlayback) {
        speakCoachMessage(assistantText);
      }

      // 3. Save conversation history locally or to Supabase via database hooks
      const todayStr = new Date().toISOString().split("T")[0];
      const finalMsgList = [
        ...nextMessages,
        {
          id: assistantMsgId,
          sender: "assistant",
          text: assistantText,
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
          extracted: extractionPayload,
        },
      ];
      await dbService.saveConversation(todayStr, finalMsgList as ChatMessage[], extractionPayload || {});

    } catch (err: any) {
      console.error(err);
      setIsTyping(false);
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "assistant",
        text: `📡 Coaching Brain Timeout: ${err.message || "Please check your connected OpenRouter API key credentials on the API Keys page."}`,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  const handleSpeakerPlaybackClick = (text: string) => {
    speakCoachMessage(text);
  };

  return (
    <div id={id} className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col justify-between bg-zinc-50 dark:bg-[#0C0C0C] relative -m-4 md:m-0 rounded-none md:rounded-xl overflow-hidden border border-gray-150/40 dark:border-neutral-900/40">
      
      {/* Dynamic Header Chat metadata details */}
      <div className="h-14 border-b border-gray-150 dark:border-neutral-900 bg-white dark:bg-[#0F0F0F] px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/45 text-indigo-750 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-[#EFEFEF]">AccountaAI Coach</h4>
            <span className="text-[10px] font-mono font-medium text-emerald-500 flex items-center gap-1 leading-none -mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Analyzing commitments live
            </span>
          </div>
        </div>

        {/* Global toggler triggers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setVoicePlayback(!voicePlayback)}
            className={`p-2 rounded-lg cursor-pointer transition-colors ${
              voicePlayback 
                ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400" 
                : "text-gray-400 hover:text-gray-600"
            }`}
            title={voicePlayback ? "Mute speaking" : "Read coach reply out loud"}
          >
            {voicePlayback ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Conversation Thread viewport timeline */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatars */}
              <div
                className={`w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 border shadow-2xs font-mono text-xs font-bold ${
                  isUser
                    ? "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-400 dark:border-indigo-500/15"
                    : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700/60"
                }`}
              >
                {isUser ? (user.name ? user.name[0].toUpperCase() : "U") : "AI"}
              </div>

              {/* Speech bubble boxes */}
              <div className="flex flex-col max-w-[80%] md:max-w-[70%]">
                <div
                  className={`p-4 rounded-2xl relative shadow-3xs leading-relaxed text-sm ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-none ml-auto"
                      : "bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[#EFEFEF] rounded-tl-none border border-gray-100 dark:border-neutral-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap selection:bg-indigo-500/30">{m.text}</p>
                  
                  {/* Speaker reader button on bubbles */}
                  {!isUser && m.text.length > 0 && (
                    <button
                      onClick={() => handleSpeakerPlaybackClick(m.text)}
                      className="absolute bottom-1 right-1 p-1 text-gray-400 hover:text-indigo-500 dark:text-neutral-500 dark:hover:text-indigo-400 rounded-lg cursor-pointer transition-colors"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <span className={`text-[9px] font-mono text-gray-400 dark:text-neutral-500 mt-1 select-none ${isUser ? "ml-auto" : "mr-auto"}`}>
                  {m.timestamp}
                </span>

                {/* Confirm Extracted items panel triggers */}
                {m.extracted && (
                  <ExtractionConfirmCard
                    extracted={m.extracted}
                    onCommit={(items) => onCommitExtraction(items)}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Dynamic Typing indicator dot loops */}
        {isTyping && (
          <div className="flex items-start gap-3.5">
            <div className="w-8.5 h-8.5 rounded-full bg-gray-150 text-gray-700 flex items-center justify-center font-bold text-xs shrink-0 border border-gray-200/50 dark:bg-neutral-800/50 dark:border-neutral-700/40">
              AI
            </div>
            <div className="p-4 bg-white dark:bg-[#1A1A1A] border border-gray-105 dark:border-neutral-800/80 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-3xs min-w-[64px] justify-center h-11">
              <span className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
              <span className="w-2 h-2 bg-indigo-505 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <span className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Sticky dialog entry input footer */}
      <div className="p-4 bg-white dark:bg-[#0F0F0F] border-t border-gray-150 dark:border-neutral-900">
        {!user.openrouter_api_key && (
          <div className="pb-2.5 text-[10px] font-mono text-rose-500 flex items-center justify-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "8s" }} />
            OpenRouter api key missing. Responses will fall back to sandboxed coaching.
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            required
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            placeholder="Commit a goal, track an exercise, or talk about obstacles..."
            className="flex-1 p-3 bg-slate-50 dark:bg-neutral-900 border border-gray-250 dark:border-neutral-800 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-indigo-600 focus:bg-white min-h-[44px]"
          />
          <button
            type="submit"
            disabled={isTyping || !inputText.trim()}
            className="w-12 h-12 bg-indigo-650 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-transform active:scale-95 cursor-pointer disabled:opacity-50 min-h-[44px] shadow-sm shrink-0"
          >
            <Send className="w-5 h-5 shrink-0" />
          </button>
        </form>
      </div>

    </div>
  );
};

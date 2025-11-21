import { GoogleGenAI } from "@google/genai";
import { IndustryConfig, Language } from '../types';
import { BASE_SYSTEM_INSTRUCTION } from '../constants';

// Initialize Gemini AI Client directly in the browser
// Note: In a production app, you should use a backend to protect your API key.
// For this local demo, using process.env.API_KEY is acceptable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Types for chat management
interface ContentPart {
  text: string;
}

interface Content {
  role: 'user' | 'model';
  parts: ContentPart[];
}

let currentSystemInstruction = '';
let chatSession: any = null;
let chatHistory: Content[] = [];

export const createSession = (industry: IndustryConfig, agentName: string, language: Language) => {
  currentSystemInstruction = BASE_SYSTEM_INSTRUCTION(agentName, industry, language);
  chatHistory = [];
  chatSession = null; // Reset session
};

export const sendMessageToAgent = async (message: string): Promise<AsyncGenerator<string, void, unknown>> => {
  try {
    // Initialize chat session if it doesn't exist
    if (!chatSession) {
      chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: currentSystemInstruction,
        },
        history: chatHistory
      });
    }

    // Send message and get stream
    const result = await chatSession.sendMessageStream({ message: message });

    async function* streamGenerator() {
      for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
          yield text;
        }
      }
    }

    return streamGenerator();

  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};
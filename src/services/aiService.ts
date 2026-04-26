import { GoogleGenAI } from "@google/genai";
import { StudyEvent, EventSubject } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getCoachFeedback(event: StudyEvent, notes: string): Promise<string> {
  const prompt = `
    You are the "Master Strategy Coach" for an elite SSC CPO (Central Police Organization) aspirant.
    The user just completed a study session. Review their performance and notes, then provide strategic, high-impact feedback.

    SESSION DETAILS:
    - Subject: ${event.subject}
    - Task: ${event.title}
    - Duration: ${Math.round((event.endTime - event.startTime) / (1000 * 60))} minutes
    - User Notes: "${notes || "No notes provided"}"

    FEEDBACK REQUIREMENTS:
    1. Keep it concise (under 80 words).
    2. Be professional, motivational, and tactically precise (like a drill inspector who cares about their success).
    3. If notes indicate a struggle, offer a specific CPO-relevant tip (e.g., "focus on accuracy to avoid negative marking in Quant").
    4. Use a bit of military/officer terminology ("Mission accomplished," "Standard Operating Procedure," "Maintain discipline").

    FORMAT:
    Return only the feedback text. No headers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text.trim() || "Mission completed. Maintain your steady pace, Officer.";
  } catch (error) {
    console.error("AI Feedback Error:", error);
    return "Feedback link compromised. Continue with Standard Operating Procedures. Good work.";
  }
}

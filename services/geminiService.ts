import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AnalysisResult, RiskLevel, DecoyData, Message } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeMessage = async (
  subject: string,
  content: string,
  sender: string
): Promise<AnalysisResult> => {
  const ai = getAiClient();
  
  const prompt = `
    Analyze the following communication for cybersecurity threats, specifically targeting Small and Medium Enterprises (SMEs).
    Look for signs of:
    1. Phishing / Social Engineering (urgency, fear, authority).
    2. CEO Fraud / BEC (Business Email Compromise).
    3. Deepfake text patterns (unnatural phrasing).
    4. Domain spoofing checks (simulated based on sender email).

    Sender: ${sender}
    Subject: ${subject}
    Content: ${content}

    Return the response in JSON format strictly adhering to the following schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trustScore: { type: Type.INTEGER, description: "0 to 100, where 100 is safe" },
            riskLevel: { type: Type.STRING, enum: ["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"] },
            flags: { type: Type.ARRAY, items: { type: Type.STRING } },
            reasoning: { type: Type.STRING },
            intent: { type: Type.STRING },
            sentiment: { type: Type.STRING },
            suggestedAction: { type: Type.STRING, enum: ["IGNORE", "BLOCK", "DECOY", "VERIFY"] }
          },
          required: ["trustScore", "riskLevel", "flags", "reasoning", "intent", "sentiment", "suggestedAction"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Analysis failed", error);
    // Fallback for demo resilience
    return {
      trustScore: 50,
      riskLevel: RiskLevel.MEDIUM,
      flags: ["Analysis Error - Check Connection"],
      reasoning: "Could not connect to DeepGuard AI Analysis engine. Please verify your API key and network connection.",
      intent: "Unknown",
      sentiment: "Neutral",
      suggestedAction: "VERIFY"
    };
  }
};

export const generateDecoyData = async (
  originalContent: string,
  attackType: string
): Promise<DecoyData> => {
  const ai = getAiClient();

  // Provide more context (up to 1000 chars) to ensure the decoy is relevant
  const context = originalContent.substring(0, 1000);

  const prompt = `
    The user is being targeted by a scammer. 
    Attack Logic detected: ${attackType}.
    
    Original Message Context:
    "${context}..."
    
    TASK: Generate "Decoy Data" to reply with. 
    1. Create a realistic but fake persona (Name, Address).
    2. Create a fake account number/ID that looks valid for this context but is chemically recognizable as fake data if analyzed.
    3. Write a polite, slightly confused-sounding email body that provides this information to the scammer to waste their time and pollute their database.

    Return strictly JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fakeName: { type: Type.STRING },
            fakeAccount: { type: Type.STRING },
            fakeAddress: { type: Type.STRING },
            generatedEmailBody: { type: Type.STRING }
          },
          required: ["fakeName", "fakeAccount", "fakeAddress", "generatedEmailBody"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as DecoyData;
    }
    throw new Error("No text in response");
  } catch (error) {
    console.error("Decoy generation failed", error);
    return {
      fakeName: "John Doe",
      fakeAccount: "123-456-7890",
      fakeAddress: "123 Fake St, Springfield, IL",
      generatedEmailBody: "I'm having trouble processing your request. Could you verify the account details?"
    };
  }
};

export const createAgentChat = (message: Message, analysis: AnalysisResult): Chat => {
  const ai = getAiClient();
  
  const systemInstruction = `
    You are DeepGuard, an advanced AI Cybersecurity Agent for SMEs.
    You are currently analyzing a specific message for the user.
    
    Context - The Message being analyzed:
    Sender: ${message.sender} (${message.senderEmail})
    Subject: ${message.subject}
    Content: "${message.content.substring(0, 800)}..."
    
    Context - Your Security Analysis:
    Risk Level: ${analysis.riskLevel}
    Trust Score: ${analysis.trustScore}/100
    Flags: ${analysis.flags.join(', ')}
    Reasoning: ${analysis.reasoning}
    
    Your Role:
    1. Act as a helpful, vigilant security consultant.
    2. Explain technical threats in simple business terms.
    3. If the user asks, help draft safe responses or explain why a message is a scam.
    4. If the user wants to "mess with" the scammer, suggest generating Decoy Data (which they can do via the button in the UI).
    
    Tone: Professional, Protective, slightly futuristic but accessible.
    Keep responses concise (under 100 words) unless asked for a detailed report.
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction
    }
  });
};
export enum RiskLevel {
  SAFE = 'SAFE',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Message {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  content: string;
  timestamp: string;
  type: 'email' | 'voice' | 'chat';
  audioUrl?: string; // For voice messages
  isRead: boolean;
}

export interface AnalysisResult {
  trustScore: number;
  riskLevel: RiskLevel;
  flags: string[];
  reasoning: string;
  intent: string;
  sentiment: string;
  suggestedAction: 'IGNORE' | 'BLOCK' | 'DECOY' | 'VERIFY';
}

export interface DecoyData {
  fakeName: string;
  fakeAccount: string;
  fakeAddress: string;
  generatedEmailBody: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isTyping?: boolean;
}
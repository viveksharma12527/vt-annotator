export enum IndustryType {
  BANKING = 'BANKING',
  FASHION = 'FASHION',
  HOSPITALITY = 'HOSPITALITY',
  LOANS = 'LOANS'
}

export type Language = 'IT' | 'EN';

export interface IndustryConfig {
  id: IndustryType;
  name: string;
  icon: string; // Lucide icon name
  description: string;
  tone: string;
  vocabulary: string;
  accentColor: string;
  bgGradient: string;
  systemInstructionSnippet: string;
  initialGreeting: (name: string) => string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export interface AgentIdentity {
  name: string;
  avatarUrl: string;
}
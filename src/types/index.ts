export interface AIResponseData {
  resumo: string;
  analise: string;
  artigos: string[];
  vara: string;
  acao_recomendada: boolean;
  ratio_decidendi: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string; // Used for user messages or error messages
  aiData?: AIResponseData; // Used for successfully parsed AI responses
  isError?: boolean;
}

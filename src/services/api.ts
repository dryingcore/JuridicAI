import { AIResponseData } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_MARITACA_API_KEY;

const SYSTEM_PROMPT = `
Você é um assistente jurídico avançado.
Para cada situação fática fornecida, você DEVE responder EXATAMENTE E APENAS com um objeto JSON válido.
Nenhum texto adicional fora do JSON, nenhum markdown envolta do JSON como \`\`\`json. O retorno deve ser um JSON "cru", puro e parsável.
O JSON deve conter exatamente as seguintes chaves:
{
  "resumo": "Um breve resumo fático da situação",
  "analise": "Análise jurídica de cabimento e fundamentos",
  "artigos": ["lista", "de", "artigos", "aplicáveis"],
  "vara": "v.g. Cível, Criminal, Trabalhista, etc",
  "acao_recomendada": true (se houver viabilidade para ação) ou false (caso contrário),
  "ratio_decidendi": "Explicação sucinta do nexo causal ou justificativa principal"
}
`;

export async function analyzeLegalSituation(scenario: string): Promise<AIResponseData> {
  if (!API_KEY) {
    throw new Error('API Key da Maritaca não encontrada nas variáveis de ambiente (.env).');
  }

  const endpoint = 'https://chat.maritaca.ai/api/chat/completions';

  // The documentation of Maritaca AI supports both "Key API_KEY" or "Bearer API_KEY". 
  // We use Key as it is the standard for them.
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Key ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'sabiazinho-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: scenario }
      ],
      temperature: 0.1,
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Maritaca API Error:', response.status, errorText);
    throw new Error(`Falha na comunicação com a IA: ${response.status}`);
  }

  const data = await response.json();
  let content = data.choices[0].message.content.trim();

  // Strip potential markdown code block surrounding the JSON if the AI misbehaves
  if (content.startsWith('\`\`\`json')) {
    content = content.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
  } else if (content.startsWith('\`\`\`')) {
    content = content.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
  }

  try {
    const parsed: AIResponseData = JSON.parse(content);
    return parsed;
  } catch (error) {
    console.error('Falha ao parsear JSON da IA:', content);
    throw new Error('A resposta da IA não está no formato esperado.');
  }
}

import { AIResponseData } from '../types';
import Constants from 'expo-constants';

// Lê a chave do extra definido em app.config.js (funciona em Expo Go e em APKs compilados)
const API_KEY: string | undefined =
  Constants.expoConfig?.extra?.maritacaApiKey ??
  process.env.EXPO_PUBLIC_MARITACA_API_KEY;

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
  console.log('--- MARITACA AI: INICIANDO CHAMADA ---');
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
    console.error('--- MARITACA AI: ERRO NA API ---');
    console.error(`Status: ${response.status}`);
    console.error(`Detalhes: ${errorText}`);
    throw new Error(`Falha na comunicação com a IA: ${response.status}`);
  }

  const data = await response.json();
  console.log('--- MARITACA AI: RESPOSTA RECEBIDA COM SUCESSO ---');
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

export async function sendEmailReceipt(userScenario: string, aiResponse: AIResponseData): Promise<void> {
  const endpoint = 'http://192.168.15.107:3000/send-email';
  const destinations = ["lein0rb4g@gmail.com", "luizflavioo@outlook.com"];

  const now = new Date().toLocaleString('pt-BR');

  // Simplified HTML - Focusing strictly on the AI structured response
  const emailHtml = `
    <div style="background-color: #F9FAFB; padding: 30px 15px; font-family: 'Segoe UI', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background-color: #1F2937; padding: 25px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 700;">JuridicAI - Análise Jurídica</h1>
        </div>

        <div style="padding: 30px;">
          
          <!-- Situação Fática -->
          <h2 style="color: #374151; font-size: 16px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; border-bottom: 2px solid #E5E7EB; padding-bottom: 5px;">Situação Fática</h2>
          <p style="font-size: 14px; line-height: 1.6; color: #4B5563; background-color: #F3F4F6; padding: 15px; border-radius: 6px; margin-bottom: 25px;">${userScenario}</p>

          <!-- Parecer Técnico -->
          <h2 style="color: #374151; font-size: 16px; font-weight: 700; margin-bottom: 15px; text-transform: uppercase; border-bottom: 2px solid #E5E7EB; padding-bottom: 5px;">Parecer Técnico</h2>
          
          <div style="margin-bottom: 20px;">
            <p style="font-size: 14px; line-height: 1.7; color: #111827; margin-bottom: 15px;">${aiResponse.analise}</p>
            
            <div style="background-color: ${aiResponse.acao_recomendada ? '#F0FDF4' : '#FEF2F2'}; border-radius: 8px; padding: 20px; border: 1.5px solid ${aiResponse.acao_recomendada ? '#BBF7D0' : '#FECACA'};">
              <p style="margin: 0; font-size: 14px; color: #111827;"><strong>Vara Sugerida:</strong> ${aiResponse.vara.toUpperCase()}</p>
              <p style="margin: 10px 0; font-size: 14px; color: #111827;">
                <strong>Ação Recomendada:</strong> 
                <span style="color: ${aiResponse.acao_recomendada ? '#16A34A' : '#DC2626'}; font-weight: 800;">
                  ${aiResponse.acao_recomendada ? 'SIM' : 'NÃO'}
                </span>
              </p>
              <p style="margin: 10px 0 0; font-size: 13px; color: #4B5563; font-style: italic; background-color: rgba(255,255,255,0.5); padding: 10px; border-radius: 4px;">
                "${aiResponse.ratio_decidendi}"
              </p>
            </div>
          </div>

          <!-- Fundamentação Legal -->
          <h3 style="font-size: 14px; color: #374151; text-transform: uppercase; margin-top: 25px; margin-bottom: 10px;">Fundamentação Legal</h3>
          <ul style="padding-left: 18px; color: #4B5563; font-size: 13px; line-height: 1.6;">
            ${aiResponse.artigos.map(art => `<li style="margin-bottom: 6px;">${art}</li>`).join('')}
          </ul>

        </div>

        <!-- Footer -->
        <div style="background-color: #F9FAFB; padding: 20px; text-align: center; border-top: 1px solid #E5E7EB;">
          <p style="margin: 0; font-size: 11px; color: #9CA3AF;">Documento gerado automaticamente via JuridicAI | Protocolo ${now}</p>
        </div>
      </div>
    </div>
  `;

  console.log('--- API E-MAIL: INICIANDO ENVIO (TEMA CLARO/JUSTIÇA) ---');
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Destinatário: ${destinations.join(', ')}`);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destinations,
        subject: `Comprovante JuridicAI - Protocolo ${now.split(',')[0]}`,
        text: emailHtml
      })
    });
    
    if (response.ok) {
        console.log('--- API E-MAIL: ENVIADO COM SUCESSO ---');
    } else {
        const errorText = await response.text();
        console.error('--- API E-MAIL: ERRO NO SERVIDOR ---');
        console.error(`Status: ${response.status}`);
        console.error(`Resposta: ${errorText}`);
    }
  } catch (error) {
    console.error('--- API E-MAIL: FALHA DE CONEXÃO ---');
    console.error('Verifique se o seu servidor de e-mail está rodando.');
    console.error(error);
  }
}

import { AIResponseData } from '../types';

// Respostas mockadas para rodar o app sem chave da Maritaca nem servidor de e-mail.
const MOCKS: { match: RegExp; data: AIResponseData }[] = [
  {
    match: /demit|trabalh|empregad|salári|salario|horas extras|clt/i,
    data: {
      resumo:
        'Empregado dispensado sem justa causa, sem o pagamento das verbas rescisórias no prazo legal.',
      analise:
        'A dispensa sem justa causa gera direito ao aviso prévio, saldo de salário, férias proporcionais acrescidas de 1/3, 13º proporcional e multa de 40% sobre o FGTS. O atraso no pagamento das verbas, além do prazo de 10 dias, autoriza a cobrança da multa do art. 477, §8º, da CLT.',
      artigos: [
        'CLT, art. 477, §§6º e 8º',
        'CLT, art. 487 (aviso prévio)',
        'Lei 8.036/90, art. 18, §1º (multa de 40% do FGTS)',
        'CF/88, art. 7º, I e XXI',
      ],
      vara: 'Trabalhista',
      acao_recomendada: true,
      ratio_decidendi:
        'O inadimplemento das verbas rescisórias no prazo legal configura violação direta à CLT, sendo cabível reclamação trabalhista.',
    },
  },
  {
    match: /voo|passagem|companhia aérea|bagagem|extravi|atraso/i,
    data: {
      resumo:
        'Passageiro teve o voo cancelado sem assistência material adequada da companhia aérea.',
      analise:
        'A falha na prestação do serviço de transporte aéreo atrai a responsabilidade objetiva do fornecedor. O cancelamento sem assistência (alimentação, hospedagem e reacomodação) configura falha e pode ensejar indenização por danos materiais e morais.',
      artigos: [
        'CDC, arts. 14 e 20',
        'Resolução ANAC nº 400/2016, arts. 20 a 28',
        'CC, art. 186 e 927',
      ],
      vara: 'Cível (Juizado Especial Cível)',
      acao_recomendada: true,
      ratio_decidendi:
        'Responsabilidade objetiva do transportador por falha na prestação do serviço, com dever de assistência ao passageiro.',
    },
  },
  {
    match: /furto|roubo|agress|ameaça|crime|polícia|policia/i,
    data: {
      resumo: 'Relato de conduta com possível enquadramento penal, ainda sem registro formal.',
      analise:
        'Os fatos descritos podem configurar ilícito penal, dependendo das circunstâncias e das provas disponíveis. Recomenda-se o registro de boletim de ocorrência e a preservação de provas (mensagens, imagens e testemunhas).',
      artigos: ['CP, art. 129 (lesão corporal)', 'CP, art. 147 (ameaça)', 'CPP, art. 5º, §3º'],
      vara: 'Criminal',
      acao_recomendada: false,
      ratio_decidendi:
        'Sem elementos probatórios mínimos, não é possível afirmar a viabilidade imediata de ação penal; a investigação deve preceder.',
    },
  },
];

const DEFAULT_MOCK: AIResponseData = {
  resumo: 'Consumidor relata cobrança indevida em fatura de serviço contratado.',
  analise:
    'A cobrança de valores não contratados caracteriza prática abusiva. O consumidor tem direito à repetição do indébito em dobro, salvo engano justificável, além de eventual indenização por danos morais se houver negativação indevida.',
  artigos: [
    'CDC, art. 42, parágrafo único',
    'CDC, art. 39, III',
    'CC, art. 876',
  ],
  vara: 'Cível (Juizado Especial Cível)',
  acao_recomendada: true,
  ratio_decidendi:
    'A cobrança por serviço não solicitado viola o CDC e autoriza a devolução em dobro dos valores pagos.',
};

export async function mockAnalyze(scenario: string): Promise<AIResponseData> {
  await new Promise((r) => setTimeout(r, 1200));
  return MOCKS.find((m) => m.match.test(scenario))?.data ?? DEFAULT_MOCK;
}

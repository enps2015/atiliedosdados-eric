import { GlossaryEntry } from '../types/lab';

export const GLOSSARY_ENTRIES: Record<string, GlossaryEntry> = {
  'raw-urn': {
    id: 'raw-urn',
    term: 'Dados Brutos (Raw Data)',
    stationId: 1,
    instrumentPart: 'Frasco Erlenmeyer de Coleta',
    plainDefinition:
      'São os registros exatamente como saem dos sistemas, sensores ou formulários, antes de qualquer conferência ou ajuste.',
    everydayAnalogy:
      'Como amostras líquidas recém-colhidas em campo antes da filtragem: vêm elementos puros, bolhas vazias e resíduos misturados.',
    professionalImpact:
      'Analistas nunca alteram o lote original diretamente — preservam o frasco bruto intacto para auditar cada etapa.',
  },
  'null-capsule': {
    id: 'null-capsule',
    term: 'Valor Ausente (Null / Missing)',
    stationId: 1,
    instrumentPart: 'Cápsulas Apagadas no Erlenmeyer',
    plainDefinition:
      'É quando um campo obrigatório não foi preenchido — por queda de sensor, bateria fraca ou resposta deixada em branco.',
    everydayAnalogy:
      'Um diário de bordo com páginas em branco no meio da expedição.',
    professionalImpact:
      'Se não forem isolados ou tratados, valores ausentes podem travar cálculos ou reduzir artificialmente as médias.',
  },
  'sieve-mesh': {
    id: 'sieve-mesh',
    term: 'Limpeza & Deduplicação',
    stationId: 2,
    instrumentPart: 'Centrífuga Vácuo-Mecânica',
    plainDefinition:
      'Conjunto de regras que remove cópias repetidas, separa falhas evidentes pelo sifão e converte unidades diferentes para a mesma medida.',
    everydayAnalogy:
      'Conferir uma amostra para não contar o mesmo frasco duas vezes e garantir que todas as temperaturas estejam em Celsius.',
    professionalImpact:
      'Garante que os instrumentos e gráficos retratem a realidade e não falhas técnicas da coleta.',
  },
  'outlier-spike': {
    id: 'outlier-spike',
    term: 'Outlier (Ponto Fora da Curva)',
    stationId: 2,
    instrumentPart: 'Cristais Vermelhos & Garrafão de Descarte',
    plainDefinition:
      'Um valor extremamente distante do restante do grupo — pode ser erro de digitação, sensor travado ou evento raríssimo.',
    everydayAnalogy:
      'Um termômetro defeituoso marcando 250°C numa tarde amena de primavera.',
    professionalImpact:
      'Um único outlier distorce drasticamente a média e inclina modelos preditivos se não for investigado antes.',
  },
  'scale-bars': {
    id: 'scale-bars',
    term: 'Média vs. Mediana (Assimetria)',
    stationId: 3,
    instrumentPart: 'Balança Analítica & Tubos Barométricos',
    plainDefinition:
      'A média soma tudo e divide pelo total; a mediana é exatamente o valor central quando colocamos todos os registros em fila.',
    everydayAnalogy:
      'Se 9 pesquisadores têm 30 anos e 1 tem 100, a média sobe, mas a mediana continua fiel ao centro do grupo.',
    professionalImpact:
      'Quando os pratos da balança pendem para um lado, o pesquisador descobre imediatamente que há valores extremos distorcendo a média.',
  },
  'dispersion-prism': {
    id: 'dispersion-prism',
    term: 'Correlação & Linha de Tendência',
    stationId: 4,
    instrumentPart: 'Câmara Óptica de Dispersão',
    plainDefinition:
      'Mede se duas variáveis costumam variar juntas e em que direção, resumida pelo feixe luminoso da reta de tendência.',
    everydayAnalogy:
      'Quanto mais forte a chuva lá fora, menos ciclistas cruzam o parque — duas variáveis em sintonia previsível.',
    professionalImpact:
      'O índice R² (0% a 100%) revela quanta variação é explicada pela linha, sem confundir associação com causalidade.',
  },
  'prediction-gears': {
    id: 'prediction-gears',
    term: 'Modelo Preditivo & Calibração',
    stationId: 5,
    instrumentPart: 'Calculadora Analógica a Válvulas',
    plainDefinition:
      'Uma regra calibrada nos dados históricos que recebe um cenário novo e estima o resultado mais provável no mostrador.',
    everydayAnalogy:
      'Ajustar os seletores de um rádio analógico até sintonizar com nitidez a frequência prevista para amanhã.',
    professionalImpact:
      'Modelos transparentes e ajustáveis geram confiança prática para planejar equipes, estoques e decisões.',
  },
  'insight-board': {
    id: 'insight-board',
    term: 'Storytelling & Decisão Executiva',
    stationId: 6,
    instrumentPart: 'Terminal Osciloscópio CRT',
    plainDefinition:
      'A tradução final das descobertas estatísticas em narrativa humana clara, honesta sobre limites e pronta para virar ação.',
    everydayAnalogy:
      'Em vez de entregar um caderno de fórmulas, exibir na tela principal o diagnóstico e o plano de ação em três linhas.',
    professionalImpact:
      'Fecha o ciclo científico: dados viram informação, informação vira história clara e história vira decisão.',
  },
};

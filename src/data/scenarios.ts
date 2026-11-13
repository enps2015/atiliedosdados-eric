import { ScenarioDataset, StationMeta } from '../types/lab';

export const STATIONS: StationMeta[] = [
  {
    id: 1,
    code: '01',
    chapterTitle: 'Etapa 01 de 06 · Coleta & Origem',
    title: 'Recebendo os Dados Brutos',
    instrumentName: 'Erlenmeyer de Recepção & Válvula Coletora',
    subtitle: 'Onde as amostras chegam exatamente como foram coletadas',
    storyBeat:
      'As válvulas acendem e o tubo de cobre despeja no frasco de vidro todos os registros do caso, ainda sem nenhuma conferência.',
    observe3D:
      'Olhe dentro do frasco Erlenmeyer: pérolas verdes são dados saudáveis; cinzas são campos vazios; azuis são cópias repetidas; e cristais vermelhos pontiagudos são erros extremos.',
    stepInstructions: [
      {
        id: 's1-1',
        title: 'Passo 1 · Inspecionar o lote bruto',
        instruction:
          'Gire o frasco de vidro arrastando o 3D ao redor dele ou clique diretamente nas esferas coloridas para ver o que cada cor significa.',
        actionHint: 'Arraste para girar o frasco 3D ou clique nele.',
        observational: true,
      },
      {
        id: 's1-2',
        title: 'Passo 2 · Seguir para a limpeza',
        instruction:
          'Nunca analisamos dados misturados com erros. Clique em "Próxima Etapa" abaixo para enviar este lote para a Centrífuga de Limpeza.',
        actionHint: 'Use o botão "Próxima Etapa" ao final deste painel.',
      },
    ],
    concepts: [
      {
        id: 'raw-data',
        term: 'Dados Brutos, Vazios e Duplicados',
        tagline: 'O ponto de partida de toda análise',
        plainExplanation:
          'Dados brutos são os registros exatamente como saem de planilhas, sensores ou formulários. Quase sempre chegam com campos em branco (nulos) e linhas repetidas (duplicatas).',
        everydayExample:
          'Se a maquininha de cartão envia a mesma venda duas vezes no fechamento, seu caixa parece maior do que realmente é.',
      },
    ],
    everydayAnalogy:
      'Como receber caixas de entregas variadas sem abrir nenhuma: vêm itens perfeitos, caixas vazias e pedidos repetidos.',
    whatAnalystDoes:
      'Reúne registros de planilhas, sensores ou sistemas em um único recipiente para inspecionar o volume e os tipos de falhas presentes.',
    whyItMatters:
      'Nenhum dado nasce perfeito. Conhecer o estado bruto evita confiar cegamente em números quebrados.',
    cameraPos: [-6.15, 2.85, 4.35],
    cameraTarget: [-5.85, 0.88, 0],
  },
  {
    id: 2,
    code: '02',
    chapterTitle: 'Etapa 02 de 06 · Limpeza & Saneamento',
    title: 'Separando Erros e Bagunças',
    instrumentName: 'Centrífuga Vácuo-Mecânica & Sifão de Cobre',
    subtitle: 'Eliminando vazios, cópias repetidas e erros de digitação',
    storyBeat:
      'Antes de tirar qualquer conclusão, passamos as amostras pela centrífuga de nogueira e latão para separar o que é confiável do que é ruído.',
    observe3D:
      'Ao ligar os filtros no painel inferior, veja o sifão de cobre desviar as peças defeituosas para o garrafão âmbar à direita enquanto só pérolas verdes caem na tigela branca.',
    stepInstructions: [
      {
        id: 's2-1',
        title: 'Passo 1 · Tirar vazios e repetições',
        instruction:
          'No painel inferior, clique em "Remover Nulos" e em "Remover Duplicatas" para não contar o mesmo registro duas vezes.',
        actionHint: 'Ative os dois primeiros botões no painel de baixo.',
      },
      {
        id: 's2-2',
        title: 'Passo 2 · Corrigir extremos e escalas',
        instruction:
          'Agora clique em "Filtrar Outliers" e em "Padronizar Escala" até a Qualidade do lote chegar a 100%.',
        actionHint: 'Ative os outros dois botões ou use "Limpar Tudo".',
      },
    ],
    concepts: [
      {
        id: 'outliers',
        term: 'Outliers (Pontos Fora da Curva)',
        tagline: 'Números muito distantes do restante do grupo',
        plainExplanation:
          'Outlier é um valor absurdamente alto ou baixo comparado ao normal. Pode ser um erro de digitação (ex: digitar R$ 23.200 em vez de R$ 2.320, ou 75 horas de sono em uma noite) ou um evento raro que não representa a rotina.',
        everydayExample:
          'Se todo mês sua conta de luz é ~R$ 180 e em um mês aparece R$ 18.000 por erro de leitura, esse pico distorce seu gasto médio do ano inteiro.',
      },
      {
        id: 'scale-normalization',
        term: 'Padronização de Escala',
        tagline: 'Colocar todos os números na mesma régua',
        plainExplanation:
          'Acontece quando dados reais foram anotados em unidades diferentes (ex: °F junto com °C, ou nota de 0 a 10 junto com 0 a 100). Padronizar converte tudo para a mesma medida em vez de jogar o dado fora.',
        everydayExample:
          'Você não soma 1 metro com 50 centímetros e diz que deu 51: primeiro transforma tudo para centímetros ou tudo para metros.',
      },
    ],
    everydayAnalogy:
      'Como peneirar ingredientes e tirar cascas antes de cozinhar: um único erro de medida estraga a receita inteira.',
    whatAnalystDoes:
      'Remove linhas vazias e duplicadas, ajusta unidades misturadas (como °F para °C) e isola valores absurdos de digitação.',
    whyItMatters:
      'Até 60% do trabalho profissional acontece aqui. Dados sujos geram decisões erradas com falsa aparência científica.',
    cameraPos: [-3.8, 2.85, 4.3],
    cameraTarget: [-3.65, 0.82, 0],
  },
  {
    id: 3,
    code: '03',
    chapterTitle: 'Etapa 03 de 06 · Exploração & Distribuição',
    title: 'Comparando Média e Maioria',
    instrumentName: 'Balança Analítica & Tubos Barométricos',
    subtitle: 'Vendo onde a maioria dos casos realmente se concentra',
    storyBeat:
      'O líquido ciano preenche os 7 tubos graduados para mostrar a distribuição do grupo, enquanto os pratos da balança testam se a média é justa.',
    observe3D:
      'Observe o braço dourado da balança: quando há erros extremos, o prato da Média afunda e entorta o ponteiro; com os dados limpos, os pratos ficam nivelados.',
    stepInstructions: [
      {
        id: 's3-1',
        title: 'Passo 1 · Observar os 7 tubos de frequência',
        instruction:
          'Gire ao redor dos 7 tubos atrás da balança ou clique neles em 3D. O tubo central em âmbar mostra onde está a metade do grupo.',
        actionHint: 'Arraste para girar ao redor dos tubos ou clique neles.',
        observational: true,
      },
      {
        id: 's3-2',
        title: 'Passo 2 · Testar o equilíbrio da balança',
        instruction:
          'Use o botão no painel inferior para alternar entre dados sujos e limpos e veja como um único erro entorta a média, enquanto a mediana resiste.',
        actionHint: 'Clique no botão de comparar na barra inferior.',
      },
    ],
    concepts: [
      {
        id: 'mean-vs-median',
        term: 'Média vs. Mediana',
        tagline: 'Por que a média engana e a mediana protege',
        plainExplanation:
          'A Média soma todos os valores e divide pela quantidade — por isso um único exagero puxa a média inteira junto. Já a Mediana coloca todos os números em fila e escolhe exatamente o do meio, mostrando o que é típico para a maioria.',
        everydayExample:
          'Num café onde 9 pessoas ganham R$ 3.000 e entra 1 bilionário, a renda média dispara para milhões, mas a mediana continua sendo R$ 3.000.',
      },
    ],
    everydayAnalogy:
      'Se um bilionário entra numa sala comum, a renda média dispara para milhões, mas a mediana continua representando a maioria.',
    whatAnalystDoes:
      'Observa o formato do conjunto nos tubos de frequência e compara média com mediana para saber se algum extremo está distorcendo a visão.',
    whyItMatters:
      'Garante que entendemos o comportamento real da maioria antes de procurar padrões mais profundos.',
    cameraPos: [-1.5, 2.85, 4.4],
    cameraTarget: [-1.45, 0.88, 0],
  },
  {
    id: 4,
    code: '04',
    chapterTitle: 'Etapa 04 de 06 · Transformação & Relação',
    title: 'Enxergando Conexões em 3D',
    instrumentName: 'Câmara Óptica de Dispersão & Lentes',
    subtitle: 'Descobrindo se duas variáveis caminham juntas',
    storyBeat:
      'Ao acender a lente condensadora, cada registro vira uma estrela suspensa na redoma de vidro e o laser ciano traça a direção principal.',
    observe3D:
      'Veja o ângulo do feixe luminoso atravessando a nuvem de pontos: se ele sobe, as variáveis crescem juntas; se desce, quando uma sobe a outra cai.',
    stepInstructions: [
      {
        id: 's4-1',
        title: 'Passo 1 · Ler o feixe de tendência em 3D',
        instruction:
          'Arraste a câmera para girar ao redor da esfera de vidro (ou clique nela) e observe o índice R² ("Explicação") na barra inferior.',
        actionHint: 'Gire o 3D ao redor da esfera de vidro ou clique nela.',
        observational: true,
      },
      {
        id: 's4-2',
        title: 'Passo 2 · Separar em grupos visuais',
        instruction:
          'Clique em "Faixas (Clusters)" no painel inferior para colorir os pontos por nível (baixo, médio e alto) e enxergar os agrupamentos.',
        actionHint: 'Alterne para "Faixas (Clusters)" na barra de baixo.',
      },
    ],
    concepts: [
      {
        id: 'correlation-r2',
        term: 'Correlação (r) e R² ("Explicação")',
        tagline: 'Medindo se duas coisas caminham juntas',
        plainExplanation:
          'A Correlação (r) vai de -1 a +1 e mostra a direção: positiva (quando um sobe, o outro sobe) ou negativa (quando um sobe, o outro cai). Já o R² (de 0% a 100%) mostra quanta força tem esse padrão — quanto do resultado acompanha a mudança do fator observado.',
        everydayExample:
          'Se o R² entre horas de sono e nota for 92%, saber quanto o aluno dormiu ajuda a prever quase toda a variação da nota — mas outros hábitos ainda importam.',
      },
    ],
    everydayAnalogy:
      'Como ajustar a lente de um telescópio até que pontos soltos revelem uma constelação clara — lembrando que caminhar junto não prova causa única.',
    whatAnalystDoes:
      'Cruza variáveis no espaço para medir correlação, agrupar perfis parecidos e traçar uma linha de tendência confiável.',
    whyItMatters:
      'Torna visíveis padrões ocultos em planilhas grandes que seriam impossíveis de notar linha por linha.',
    cameraPos: [0.95, 2.85, 4.4],
    cameraTarget: [0.75, 0.96, 0],
  },
  {
    id: 5,
    code: '05',
    chapterTitle: 'Etapa 05 de 06 · Modelagem & Previsão',
    title: 'Simulando Cenários Futuros',
    instrumentName: 'Calculadora Analógica a Válvulas & Mostrador',
    subtitle: 'Usando o padrão descoberto para estimar o amanhã',
    storyBeat:
      'Com o padrão medido na câmara óptica, a máquina a válvulas transforma a tendência em um simulador prático com mostrador analógico.',
    observe3D:
      'Ao mover os controles deslizantes no painel inferior, as engrenagens de latão aceleram e o ponteiro do mostrador gira para apontar o valor previsto.',
    stepInstructions: [
      {
        id: 's5-1',
        title: 'Passo 1 · Simular um cenário novo',
        instruction:
          'Arraste o primeiro controle deslizante ("Simular...") na barra inferior para escolher um valor de entrada e leia a Previsão gerada à direita.',
        actionHint: 'Mova o primeiro controle deslizante no painel de baixo.',
      },
      {
        id: 's5-2',
        title: 'Passo 2 · Testar a sensibilidade das válvulas',
        instruction:
          'Experimente mover "Sensibilidade das Válvulas" para ver como aumentar ou diminuir o peso do padrão altera a previsão do ponteiro.',
        actionHint: 'Ajuste o segundo controle deslizante e depois volte para 1.0×.',
      },
    ],
    concepts: [
      {
        id: 'valve-sensitivity',
        term: 'O que é a Sensibilidade das Válvulas?',
        tagline: 'Calibrando o peso do padrão nas previsões',
        plainExplanation:
          'Na calculadora analógica, a "Sensibilidade das Válvulas" (de 0.4× a 1.4×) controla o quanto o modelo reage a cada mudança na variável de entrada. Em 1.0×, ela segue exatamente a inclinação real medida nos dados; acima de 1.0× amplia a resposta (cenário mais intenso) e abaixo de 1.0× suaviza o impacto (cenário conservador).',
        everydayExample:
          'É como testar cenários "e se?" antes de decidir: se uma frente fria atrair 20% mais clientes do que o normal (1.2×), quanto leite extra preciso comprar?',
      },
    ],
    everydayAnalogy:
      'Como ajustar o seletor de um rádio vintage: você informa a condição prevista para amanhã e o ponteiro sintoniza o resultado esperado.',
    whatAnalystDoes:
      'Transforma a linha de tendência em um modelo ajustável, validando se as estimativas fazem sentido antes de colocar em prática.',
    whyItMatters:
      'Permite planejar estoque, equipe ou políticas públicas com antecedência em vez de apenas reagir depois que o problema acontece.',
    cameraPos: [3.2, 2.8, 4.35],
    cameraTarget: [2.95, 0.88, 0],
  },
  {
    id: 6,
    code: '06',
    chapterTitle: 'Etapa 06 de 06 · Comunicação & Decisão',
    title: 'Transformando Dados em Ação',
    instrumentName: 'Terminal Osciloscópio CRT em Nogueira',
    subtitle: 'Mini relatório didático e leitura dos padrões escondidos',
    storyBeat:
      'No último instrumento da bancada, toda a análise vira um mini relatório claro, sem tecniquês, pronto para ensinar como os números escondem padrões e orientar a decisão.',
    observe3D:
      'Veja os 3 botões giratórios à direita da tela do Monitor CRT: cada botão muda a página do relatório diretamente na tela fosforescente 3D (01 Síntese, 02 Padrões e 03 Guia de Leitura).',
    stepInstructions: [
      {
        id: 's6-1',
        title: 'Passo 1 · Ler as 3 páginas do Terminal CRT',
        instruction:
          'Clique nos 3 botões laterais do monitor CRT em 3D (ou nas abas do Mini Relatório abaixo) para alternar entre Síntese, Padrões Escondidos e Como Ler Dados.',
        actionHint: 'Clique em um botão lateral do CRT 3D ou numa aba do relatório.',
        observational: true,
      },
      {
        id: 's6-2',
        title: 'Passo 2 · Testar seus conhecimentos ou outro caso',
        instruction:
          'Você completou todo o processo profissional! Clique em "Testar Desafios" abaixo ou escolha outro caso (Sono & Notas ou Bicicletas) na barra inferior.',
        actionHint: 'Teste os desafios práticos ou explore os outros 2 casos.',
      },
    ],
    concepts: [
      {
        id: 'data-storytelling',
        term: 'Comunicação Clara & Decisão Prática',
        tagline: 'Números só valem quando viram ação',
        plainExplanation:
          'O papel final da análise de dados não é exibir gráficos difíceis, mas traduzir limpeza, mediana, tendência e previsões em uma resposta clara que qualquer pessoa entenda e consiga aplicar no mesmo dia.',
        everydayExample:
          'Em vez de dizer "r = -0,96 e p < 0,01", dizemos: "abaixo de 18°C as vendas sobem forte; vale escalar 1 barista extra antes das 8h30."',
      },
    ],
    everydayAnalogy:
      'Como um médico que traduz exames complexos em uma orientação clara e prática para melhorar a saúde do paciente.',
    whatAnalystDoes:
      'Comunica a descoberta sem jargões técnicos, informa o grau de confiança dos números e propõe uma decisão concreta.',
    whyItMatters:
      'Análise de dados só gera valor real quando ajuda pessoas comuns a tomarem decisões melhores no mundo real.',
    cameraPos: [5.35, 1.82, 3.5],
    cameraTarget: [5.18, 0.84, 0.35],
  },
];

export const SCENARIOS: Record<string, ScenarioDataset> = {
  cafe: {
    id: 'cafe',
    shortTitle: 'Cafeteria',
    title: 'O Mistério da Cafeteria Congelada',
    subtitle: 'Vendas diárias, temperatura ambiente e tempo de espera',
    storyTitle: 'Caso 01 · O Mistério da Cafeteria Congelada',
    protagonist: 'Clara, gerente da cafeteria do campus',
    storyPrologue:
      'Clara recebeu um relatório de caixa confuso: os números mostram um faturamento médio surreal de R$ 2.600 por dia, mas o dinheiro no banco não bate — e na última frente fria faltou leite e formou fila na porta. Ajude-a a investigar o lote na bancada!',
    storyEpilogue:
      'Com os registros de R$ 23.200 corrigidos e os dados em Fahrenheit convertidos, Clara descobriu o padrão real: o frio faz a venda de bebidas quentes disparar, exigindo reforço de equipe abaixo de 18°C.',
    question: 'Por que o caixa não fecha e como preparar a cafeteria para o frio?',
    xLabel: 'Temperatura',
    xUnit: '°C',
    xMin: 12,
    xMax: 34,
    xStep: 1,
    defaultInputX: 16,
    yLabel: 'Receita Diária',
    yUnit: 'R$',
    zLabel: 'Tempo de Fila',
    zUnit: 'min',
    decisionTitle: 'Reforçar estoque e baristas em frentes frias',
    decisionSummary:
      'Cada queda de 5°C eleva a receita média de bebidas quentes em cerca de R$ 285/dia, porém aumenta o tempo de fila.',
    decisionAction:
      'Escalar 1 barista extra abaixo de 18°C e preparar pré-lotes de espresso antes das 8h30.',
    records: [
      { id: 'c1', label: 'Dia 01 · Seg', x: 14, y: 2380, z: 7.4, category: 'Dia Útil', defect: 'none' },
      { id: 'c2', label: 'Dia 02 · Ter', x: 15, y: 2290, z: 7.1, category: 'Dia Útil', defect: 'none' },
      { id: 'c3', label: 'Dia 03 · Qua', x: 16, y: 2180, z: 6.8, category: 'Dia Útil', defect: 'none' },
      { id: 'c4', label: 'Dia 04 · Qui', x: 17, y: 2120, z: 6.3, category: 'Dia Útil', defect: 'none' },
      { id: 'c5', label: 'Dia 05 · Sex', x: 18, y: 2040, z: 6.0, category: 'Dia Útil', defect: 'none' },
      { id: 'c6', label: 'Dia 06 · Sáb', x: 19, y: 1790, z: 4.5, category: 'Fim de Semana', defect: 'none' },
      { id: 'c7', label: 'Dia 07 · Dom', x: null, y: null, z: null, category: 'Fim de Semana', defect: 'null', defectNote: 'Planilha do caixa fechou sem envio no domingo.' },
      { id: 'c8', label: 'Dia 08 · Seg', x: 20, y: 1860, z: 5.4, category: 'Dia Útil', defect: 'none' },
      { id: 'c9', label: 'Dia 08 · Seg (Dup)', x: 20, y: 1860, z: 5.4, category: 'Dia Útil', defect: 'duplicate', defectNote: 'Terminal de cartão reenviou o lote do mesmo dia.' },
      { id: 'c10', label: 'Dia 09 · Ter', x: 21, y: 1810, z: 5.1, category: 'Dia Útil', defect: 'none' },
      { id: 'c11', label: 'Dia 10 · Qua', x: 22, y: 1730, z: 4.8, category: 'Dia Útil', defect: 'none' },
      { id: 'c12', label: 'Dia 11 · Qui', x: 23, y: 1680, z: 4.6, category: 'Dia Útil', defect: 'none' },
      { id: 'c13', label: 'Dia 12 · Sex', x: 24, y: 1620, z: 4.3, category: 'Dia Útil', defect: 'none' },
      { id: 'c14', label: 'Dia 13 · Sáb', x: 25, y: 1450, z: 3.6, category: 'Fim de Semana', defect: 'none' },
      { id: 'c15', label: 'Dia 14 · Seg', x: 15, y: 23200, z: 7.2, category: 'Dia Útil', defect: 'outlier', defectNote: 'Erro de digitação no fechamento: R$ 23.200 em vez de R$ 2.320.' },
      { id: 'c16', label: 'Dia 15 · Ter', x: 26, y: 1490, z: 3.9, category: 'Dia Útil', defect: 'none' },
      { id: 'c17', label: 'Dia 16 · Qua', x: 27, y: 1410, z: 3.7, category: 'Dia Útil', defect: 'none' },
      { id: 'c18', label: 'Dia 17 · Qui', x: 28, y: 1350, z: 3.5, category: 'Dia Útil', defect: 'none' },
      { id: 'c19', label: 'Dia 18 · Sex', x: 29, y: 1290, z: 3.2, category: 'Dia Útil', defect: 'none' },
      { id: 'c20', label: 'Dia 19 · Sáb', x: 30, y: 1120, z: 2.8, category: 'Fim de Semana', defect: 'none' },
      { id: 'c21', label: 'Dia 20 · Dom', x: 31, y: null, z: 2.6, category: 'Fim de Semana', defect: 'null', defectNote: 'Valor de receita corrompido na exportação CSV.' },
      { id: 'c22', label: 'Dia 21 · Seg', x: 75, y: 1580, z: 4.4, category: 'Dia Útil', defect: 'scale', defectNote: 'Termômetro registrou 75°F (equivalente a 24°C) misturado com °C.', correctedX: 24, correctedY: 1580 },
      { id: 'c23', label: 'Dia 22 · Ter', x: 32, y: 1150, z: 2.9, category: 'Dia Útil', defect: 'none' },
      { id: 'c24', label: 'Dia 23 · Qua', x: 33, y: 1080, z: 2.7, category: 'Dia Útil', defect: 'none' },
      { id: 'c25', label: 'Dia 24 · Qui', x: 16, y: 2210, z: 6.9, category: 'Dia Útil', defect: 'none' },
      { id: 'c26', label: 'Dia 24 · Qui (Dup)', x: 16, y: 2210, z: 6.9, category: 'Dia Útil', defect: 'duplicate', defectNote: 'Registro duplicado na consolidação semanal.' },
      { id: 'c27', label: 'Dia 25 · Sex', x: 18, y: 1990, z: 5.9, category: 'Dia Útil', defect: 'none' },
      { id: 'c28', label: 'Dia 26 · Sáb', x: 22, y: 1540, z: 4.1, category: 'Fim de Semana', defect: 'none' },
      { id: 'c29', label: 'Dia 27 · Seg', x: 13, y: 2460, z: 7.8, category: 'Dia Útil', defect: 'none' },
      { id: 'c30', label: 'Dia 28 · Ter', x: 19, y: 1940, z: 5.6, category: 'Dia Útil', defect: 'none' },
      { id: 'c31', label: 'Dia 29 · Qua', x: 25, y: 1530, z: 4.1, category: 'Dia Útil', defect: 'none' },
      { id: 'c32', label: 'Dia 30 · Qui', x: 27, y: 145, z: 3.8, category: 'Dia Útil', defect: 'scale', defectNote: 'Faltou um zero na importação (R$ 145 em vez de R$ 1.450).', correctedX: 27, correctedY: 1450 },
      { id: 'c33', label: 'Dia 31 · Sex', x: 28, y: 1380, z: 3.6, category: 'Dia Útil', defect: 'none' },
      { id: 'c34', label: 'Dia 32 · Sáb', x: 30, y: 1180, z: 3.0, category: 'Fim de Semana', defect: 'none' },
      { id: 'c35', label: 'Dia 33 · Seg', x: 17, y: 2150, z: 6.5, category: 'Dia Útil', defect: 'none' },
      { id: 'c36', label: 'Dia 34 · Ter', x: 21, y: 1780, z: 5.0, category: 'Dia Útil', defect: 'none' },
      { id: 'c37', label: 'Dia 35 · Qua', x: 24, y: 1610, z: 4.5, category: 'Dia Útil', defect: 'none' },
      { id: 'c38', label: 'Dia 36 · Qui', x: 29, y: 1270, z: 3.3, category: 'Dia Útil', defect: 'none' },
      { id: 'c39', label: 'Dia 37 · Sex', x: null, y: 1420, z: 3.7, category: 'Dia Útil', defect: 'null', defectNote: 'Sensor de temperatura externa sem leitura no dia.' },
      { id: 'c40', label: 'Dia 38 · Sáb', x: 15, y: 2140, z: 6.2, category: 'Fim de Semana', defect: 'none' },
      { id: 'c41', label: 'Dia 39 · Seg', x: 20, y: 1890, z: 5.3, category: 'Dia Útil', defect: 'none' },
      { id: 'c42', label: 'Dia 40 · Ter', x: 26, y: 1510, z: 4.0, category: 'Dia Útil', defect: 'none' },
      { id: 'c43', label: 'Dia 41 · Qua', x: 14, y: 19800, z: 7.5, category: 'Dia Útil', defect: 'outlier', defectNote: 'Lançamento de evento corporativo anual misturado ao balcão normal.' },
      { id: 'c44', label: 'Dia 42 · Qui', x: 22, y: 1740, z: 4.9, category: 'Dia Útil', defect: 'none' },
    ],
    challenges: [
      {
        id: 'cafe-ch-1',
        title: 'Por que a balança analítica pendeu?',
        stationFocus: 3,
        prompt:
          'Observe na Estação 03 que a média de receita está muito acima da mediana! O que está inclinando o braço de latão da balança e enganando Clara?',
        hint: 'Veja os cristais pontiagudos avermelhados no Erlenmeyer (Estação 01) e confira os picos de R$ 23.200 e R$ 19.800.',
        type: 'diagnostic',
        options: [
          {
            id: 'opt-1',
            label: 'Outliers extremos (digitação errada e evento isolado)',
            isCorrect: true,
            feedback:
              'Exato! Dois valores perto de R$ 20 mil puxam a média artificialmente para cima, enquanto a mediana protege o valor típico de ~R$ 1.700.',
          },
          {
            id: 'opt-2',
            label: 'A cafeteria vende muito mais nos finais de semana',
            isCorrect: false,
            feedback:
              'Na verdade, finais de semana têm movimento menor que dias úteis. O desequilíbrio vem de poucos valores extremos.',
          },
          {
            id: 'opt-3',
            label: 'Falta de registros nos dias quentes',
            isCorrect: false,
            feedback:
              'Há bastante amostras entre 26°C e 33°C. O problema está nos picos atípicos que distorcem a média.',
          },
        ],
        successExplanation:
          'Ao filtrar os outliers na Centrífuga (Estação 02), os pratos da balança voltam ao nível horizontal.',
      },
      {
        id: 'cafe-ch-2',
        title: 'Saneamento Completo na Centrífuga',
        stationFocus: 2,
        prompt:
          'Acione os quatro filtros da Centrífuga (Estação 02) para separar nulos, duplicatas, outliers e escalas em Fahrenheit no garrafão de descarte.',
        hint: 'Use os quatro interruptores da Estação 02 no painel inferior até atingir 100% de qualidade.',
        type: 'action',
        requiredPipeline: {
          removeNulls: true,
          deduplicate: true,
          filterOutliers: true,
          normalizeScale: true,
        },
        successExplanation:
          'Saneamento concluído! Agora o Terminal CRT exibe apenas registros limpos e confiáveis para Clara.',
      },
      {
        id: 'cafe-ch-3',
        title: 'Previsão para a Frente Fria',
        stationFocus: 5,
        prompt:
          'Com o lote limpo, ajuste a Calculadora Valvulada (Estação 05) para simular uma frente fria de 15°C e verifique se a receita esperada supera R$ 2.100.',
        hint: 'Vá até a Estação 05 e deslize a Temperatura Simulada para 15°C observando o ponteiro do mostrador.',
        type: 'diagnostic',
        options: [
          {
            id: 'opt-a',
            label: 'Sim, o mostrador indica receita acima de R$ 2.150',
            isCorrect: true,
            feedback:
              'Correto! Como temperatura e vendas de café têm relação inversa forte, dias frios empurram a previsão para além de R$ 2.150.',
          },
          {
            id: 'opt-b',
            label: 'Não, no frio as vendas caem para menos de R$ 1.200',
            isCorrect: false,
            feedback:
              'Observe a inclinação na Câmara Óptica: quanto menor a temperatura, maior o consumo de bebidas quentes.',
          },
        ],
        successExplanation:
          'Previsão validada! Clara já tem base científica para reforçar a equipe antes da frente fria.',
      },
    ],
  },

  sleep: {
    id: 'sleep',
    shortTitle: 'Sono & Notas',
    title: 'O Enigma das Noites em Claro',
    subtitle: 'Horas dormidas, uso de telas à noite e nota em simulados',
    storyTitle: 'Caso 02 · O Enigma das Noites em Claro',
    protagonist: 'Prof. Henrique, coordenador do laboratório estudantil',
    storyPrologue:
      'Metade da turma acredita que virar a madrugada estudando garante notas mais altas. O Prof. Henrique coletou diários de sono de 32 alunos, mas o formulário veio cheio de erros de escala e um estudante digitou que dormiu 75 horas numa única noite!',
    storyEpilogue:
      'Ao padronizar as notas e remover o erro de 75h, os tubos barométricos e a Câmara Óptica provaram que alunos com 7h a 8,5h de sono e menos tela à noite superaram em 22 pontos quem dormiu pouco.',
    question: 'Dormir menos para revisar até tarde ajuda ou atrapalha o desempenho?',
    xLabel: 'Horas de Sono',
    xUnit: 'h',
    xMin: 4.5,
    xMax: 9.0,
    xStep: 0.5,
    defaultInputX: 7.5,
    yLabel: 'Nota Simulado',
    yUnit: 'pts',
    zLabel: 'Telas à Noite',
    zUnit: 'min',
    decisionTitle: 'Higiene do sono impacta mais que horas extras de revisão',
    decisionSummary:
      'Estudantes entre 7h e 8,5h de sono tiveram média 22 pontos superior aos que dormiram menos de 5,5h com alto uso de telas.',
    decisionAction:
      'Desligar telas 45 min antes de dormir e priorizar 7,5h de sono na véspera das provas.',
    records: [
      { id: 's1', label: 'Estudante 01', x: 4.8, y: 54, z: 115, category: 'Pouco Sono', defect: 'none' },
      { id: 's2', label: 'Estudante 02', x: 5.0, y: 58, z: 105, category: 'Pouco Sono', defect: 'none' },
      { id: 's3', label: 'Estudante 03', x: 5.2, y: 60, z: 95, category: 'Pouco Sono', defect: 'none' },
      { id: 's4', label: 'Estudante 04', x: 5.5, y: 63, z: 90, category: 'Pouco Sono', defect: 'none' },
      { id: 's5', label: 'Estudante 05', x: 5.8, y: 65, z: 82, category: 'Moderado', defect: 'none' },
      { id: 's6', label: 'Estudante 06', x: 6.0, y: 68, z: 75, category: 'Moderado', defect: 'none' },
      { id: 's7', label: 'Estudante 07', x: 6.2, y: 71, z: 70, category: 'Moderado', defect: 'none' },
      { id: 's8', label: 'Estudante 08', x: null, y: 72, z: 65, category: 'Moderado', defect: 'null', defectNote: 'Participante deixou o campo de horas dormidas em branco.' },
      { id: 's9', label: 'Estudante 09', x: 6.5, y: 74, z: 60, category: 'Moderado', defect: 'none' },
      { id: 's10', label: 'Estudante 09 (Dup)', x: 6.5, y: 74, z: 60, category: 'Moderado', defect: 'duplicate', defectNote: 'Formulário enviado duas vezes pelo mesmo aluno.' },
      { id: 's11', label: 'Estudante 10', x: 6.8, y: 77, z: 54, category: 'Moderado', defect: 'none' },
      { id: 's12', label: 'Estudante 11', x: 7.0, y: 79, z: 48, category: 'Adequado', defect: 'none' },
      { id: 's13', label: 'Estudante 12', x: 7.2, y: 81, z: 42, category: 'Adequado', defect: 'none' },
      { id: 's14', label: 'Estudante 13', x: 7.5, y: 84, z: 35, category: 'Adequado', defect: 'none' },
      { id: 's15', label: 'Estudante 14', x: 7.8, y: 87, z: 28, category: 'Adequado', defect: 'none' },
      { id: 's16', label: 'Estudante 15', x: 8.0, y: 89, z: 24, category: 'Adequado', defect: 'none' },
      { id: 's17', label: 'Estudante 16', x: 8.2, y: 90, z: 20, category: 'Adequado', defect: 'none' },
      { id: 's18', label: 'Estudante 17', x: 8.5, y: 92, z: 18, category: 'Adequado', defect: 'none' },
      { id: 's19', label: 'Estudante 18', x: 75, y: 85, z: 30, category: 'Adequado', defect: 'outlier', defectNote: 'Erro de digitação: 75 horas de sono em uma única noite.' },
      { id: 's20', label: 'Estudante 19', x: 7.4, y: 8.2, z: 36, category: 'Adequado', defect: 'scale', defectNote: 'Nota digitada na escala 0–10 (8,2) em vez de 0–100 (82).', correctedX: 7.4, correctedY: 82 },
      { id: 's21', label: 'Estudante 20', x: 5.4, y: 61, z: 92, category: 'Pouco Sono', defect: 'none' },
      { id: 's22', label: 'Estudante 21', x: 6.4, y: 73, z: 62, category: 'Moderado', defect: 'none' },
      { id: 's23', label: 'Estudante 22', x: 7.6, y: 85, z: 32, category: 'Adequado', defect: 'none' },
      { id: 's24', label: 'Estudante 23', x: 8.4, y: 91, z: 19, category: 'Adequado', defect: 'none' },
      { id: 's25', label: 'Estudante 24', x: 6.1, y: null, z: 72, category: 'Moderado', defect: 'null', defectNote: 'Aluno faltou no dia do simulado.' },
      { id: 's26', label: 'Estudante 25', x: 7.1, y: 78, z: 45, category: 'Adequado', defect: 'none' },
      { id: 's27', label: 'Estudante 26', x: 5.1, y: 59, z: 100, category: 'Pouco Sono', defect: 'none' },
      { id: 's28', label: 'Estudante 27', x: 7.9, y: 88, z: 25, category: 'Adequado', defect: 'none' },
      { id: 's29', label: 'Estudante 28', x: 6.7, y: 7.6, z: 52, category: 'Moderado', defect: 'scale', defectNote: 'Nota em escala 0–10 (7,6) misturada à escala 0–100.', correctedX: 6.7, correctedY: 76 },
      { id: 's30', label: 'Estudante 29', x: 8.7, y: 93, z: 15, category: 'Adequado', defect: 'none' },
      { id: 's31', label: 'Estudante 30', x: 5.6, y: 64, z: 86, category: 'Moderado', defect: 'none' },
      { id: 's32', label: 'Estudante 31', x: 7.3, y: 83, z: 39, category: 'Adequado', defect: 'none' },
    ],
    challenges: [
      {
        id: 'sleep-ch-1',
        title: 'Escalas Misturadas na Turma',
        stationFocus: 2,
        prompt:
          'Dois alunos tiraram boas notas, mas aparecem perto de 8 pontos! Acione a padronização de escala na Centrífuga para recuperar esses registros sem apagá-los.',
        hint: 'Nem todo dado estranho é lixo — às vezes basta converter a escala (0–10 para 0–100).',
        type: 'action',
        requiredPipeline: {
          normalizeScale: true,
        },
        successExplanation:
          'Perfeito! Padronizar a escala converte 8,2 e 7,6 para 82 e 76 pontos, preservando os estudantes reais.',
      },
      {
        id: 'sleep-ch-2',
        title: 'Correlação vs. Causalidade',
        stationFocus: 4,
        prompt:
          'Na Câmara Óptica, dormir mais horas caminha junto com notas maiores. O Prof. Henrique pode afirmar que dormir 10h garante nota 100 sozinho?',
        hint: 'Pense em outros fatores escondidos, como uso de telas à noite e organização da rotina.',
        type: 'diagnostic',
        options: [
          {
            id: 's-opt-1',
            label: 'Não — correlação revela padrão forte, mas não causa única',
            isCorrect: true,
            feedback:
              'Brilhante! O tempo de tela, método de estudo e saúde também atuam juntos. Ciência responsável evita exageros.',
          },
          {
            id: 's-opt-2',
            label: 'Sim — se a linha sobe no prisma, a causa é 100% comprovada',
            isCorrect: false,
            feedback:
              'Cuidado com essa armadilha! Correlação mostra associação, não prova causalidade isolada.',
          },
        ],
        successExplanation:
          'Você dominou a diferença entre associação estatística e relação de causa e efeito.',
      },
    ],
  },

  bikes: {
    id: 'bikes',
    shortTitle: 'Bicicletas',
    title: 'O Caso das Bicicletas Fantasmas',
    subtitle: 'Volume de chuva, viagens por hora e lotação das estações',
    storyTitle: 'Caso 03 · O Caso das Bicicletas Fantasmas',
    protagonist: 'Marina, engenheira de mobilidade urbana',
    storyPrologue:
      'O painel da prefeitura acusou um pico misterioso de 1.890 viagens de bicicleta numa madrugada de garoa! Marina trouxe os registros de telemetria para descobrir o defeito no sensor e encontrar a melhor janela para manutenção da frota.',
    storyEpilogue:
      'Isolado o contador defeituoso de 1.890 viagens e corrigido o pluviômetro em décimos de milímetro, Marina provou que chuvas acima de 8 mm reduzem o uso em 62% — criando a janela ideal para oficina.',
    question: 'Qual sensor falhou e quando recolher bicicletas sem prejudicar usuários?',
    xLabel: 'Chuva',
    xUnit: 'mm',
    xMin: 0,
    xMax: 20,
    xStep: 1,
    defaultInputX: 4,
    yLabel: 'Viagens/Hora',
    yUnit: 'viag.',
    zLabel: 'Ocupação',
    zUnit: '%',
    decisionTitle: 'Redistribuição preventiva antes da chuva da tarde',
    decisionSummary:
      'Acima de 8 mm de chuva, a demanda cai 62%, permitindo recolher bicicletas para manutenção preventiva sem afetar usuários.',
    decisionAction:
      'Concentrar manutenção da frota em janelas chuvosas (> 8 mm) e reforçar estações centrais em manhãs secas.',
    records: [
      { id: 'b1', label: '08h · Seco', x: 0, y: 340, z: 88, category: 'Seco', defect: 'none' },
      { id: 'b2', label: '09h · Seco', x: 0.5, y: 325, z: 84, category: 'Seco', defect: 'none' },
      { id: 'b3', label: '10h · Seco', x: 1.0, y: 310, z: 79, category: 'Seco', defect: 'none' },
      { id: 'b4', label: '11h · Garoa', x: 2.0, y: 285, z: 72, category: 'Garoa', defect: 'none' },
      { id: 'b5', label: '12h · Garoa', x: 3.0, y: 268, z: 68, category: 'Garoa', defect: 'none' },
      { id: 'b6', label: '13h · Garoa', x: 4.0, y: 245, z: 63, category: 'Garoa', defect: 'none' },
      { id: 'b7', label: '14h · Sensor', x: null, y: 230, z: 60, category: 'Garoa', defect: 'null', defectNote: 'Pluviômetro da estação central ficou sem sinal.' },
      { id: 'b8', label: '15h · Moderada', x: 5.5, y: 215, z: 57, category: 'Chuva Leve', defect: 'none' },
      { id: 'b9', label: '16h · Moderada', x: 6.5, y: 195, z: 51, category: 'Chuva Leve', defect: 'none' },
      { id: 'b10', label: '16h · (Dup)', x: 6.5, y: 195, z: 51, category: 'Chuva Leve', defect: 'duplicate', defectNote: 'Pacote de telemetria reenviado após reconexão 4G.' },
      { id: 'b11', label: '17h · Moderada', x: 8.0, y: 172, z: 46, category: 'Chuva Leve', defect: 'none' },
      { id: 'b12', label: '18h · Forte', x: 10.0, y: 145, z: 39, category: 'Chuva Forte', defect: 'none' },
      { id: 'b13', label: '19h · Forte', x: 12.0, y: 118, z: 33, category: 'Chuva Forte', defect: 'none' },
      { id: 'b14', label: '20h · Forte', x: 14.0, y: 96, z: 27, category: 'Chuva Forte', defect: 'none' },
      { id: 'b15', label: '21h · Forte', x: 16.0, y: 78, z: 22, category: 'Chuva Forte', defect: 'none' },
      { id: 'b16', label: '22h · Forte', x: 18.0, y: 62, z: 18, category: 'Chuva Forte', defect: 'none' },
      { id: 'b17', label: '23h · Bug', x: 1.5, y: 1890, z: 99, category: 'Seco', defect: 'outlier', defectNote: 'Falha de contador acumulou o dia inteiro numa única hora (1.890).' },
      { id: 'b18', label: '07h · Seco', x: 0.2, y: 335, z: 86, category: 'Seco', defect: 'none' },
      { id: 'b19', label: '08h · Unidade', x: 90, y: 158, z: 42, category: 'Chuva Leve', defect: 'scale', defectNote: 'Sensor enviou 90 décimos de mm em vez de 9,0 mm.', correctedX: 9.0, correctedY: 158 },
      { id: 'b20', label: '12h · Seco', x: 1.8, y: 292, z: 74, category: 'Seco', defect: 'none' },
      { id: 'b21', label: '15h · Forte', x: 13.0, y: 108, z: 30, category: 'Chuva Forte', defect: 'none' },
      { id: 'b22', label: '17h · Garoa', x: 3.5, y: 256, z: 65, category: 'Garoa', defect: 'none' },
      { id: 'b23', label: '19h · Seco', x: 0.8, y: 318, z: 81, category: 'Seco', defect: 'none' },
      { id: 'b24', label: '20h · Sensor', x: 7.0, y: null, z: 48, category: 'Chuva Leve', defect: 'null', defectNote: 'Travamento momentâneo da catraca sem contagem.' },
      { id: 'b25', label: '21h · Forte', x: 15.0, y: 88, z: 24, category: 'Chuva Forte', defect: 'none' },
      { id: 'b26', label: '22h · Forte', x: 17.0, y: 70, z: 20, category: 'Chuva Forte', defect: 'none' },
      { id: 'b27', label: '11h · Chuva', x: 11.0, y: 132, z: 35, category: 'Chuva Forte', defect: 'none' },
      { id: 'b28', label: '14h · Garoa', x: 4.8, y: 229, z: 59, category: 'Garoa', defect: 'none' },
    ],
    challenges: [
      {
        id: 'bikes-ch-1',
        title: 'O Sensor Acumulado de 1.890 Viagens',
        stationFocus: 2,
        prompt:
          'Um registro marca 1.890 viagens em uma única hora! Remova o outlier na Centrífuga para revelar o comportamento real da cidade.',
        hint: 'Ative "Filtrar Outliers" na Estação 02 e observe a dispersão na Câmara Óptica voltar ao padrão nítido.',
        type: 'action',
        requiredPipeline: {
          filterOutliers: true,
        },
        successExplanation:
          'Ótimo! Sem o sensor defeituoso, a linha de tendência na Câmara Óptica ganha altíssima precisão.',
      },
      {
        id: 'bikes-ch-2',
        title: 'Janela de Manutenção Inteligente',
        stationFocus: 5,
        prompt:
          'Com base na Calculadora Valvulada (Estação 05), quando Marina deve recolher bicicletas para oficina com menor impacto aos ciclistas?',
        hint: 'Simule chuva intensa (> 12 mm) na Estação 05 e compare com manhãs secas (0 mm).',
        type: 'diagnostic',
        options: [
          {
            id: 'b-opt-1',
            label: 'Durante chuvas acima de 10 mm, quando a demanda cai fortemente',
            isCorrect: true,
            feedback:
              'Isso mesmo! A queda de uso durante chuva forte abre a janela perfeita para manutenção preventiva.',
          },
          {
            id: 'b-opt-2',
            label: 'Em manhãs secas com 0 mm de chuva',
            isCorrect: false,
            feedback:
              'Em manhãs secas a demanda atinge o pico (> 320 viagens/h). Retirar bicicletas nesse horário prejudicaria o transporte.',
          },
        ],
        successExplanation:
          'Decisão orientada por dados aplicada com sucesso à mobilidade urbana!',
      },
    ],
  },
};

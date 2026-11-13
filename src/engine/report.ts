import {
  DidacticReport,
  PipelineState,
  ProcessedStats,
  ScenarioDataset,
} from '../types/lab';

function formatOutputValue(scenario: ScenarioDataset, val: number): string {
  if (scenario.yUnit === 'R$') {
    return `R$ ${Math.round(val).toLocaleString('pt-BR')}`;
  }
  return `${val.toFixed(1)} ${scenario.yUnit}`;
}

export function buildDidacticReport(
  scenario: ScenarioDataset,
  pipeline: PipelineState,
  stats: ProcessedStats
): DidacticReport {
  const isClean = stats.qualityScore >= 100;
  const r2Pct = Math.round(stats.rSquared * 100);
  const absCorr = Math.abs(stats.correlation);

  const missingFilters: string[] = [];
  if (!pipeline.removeNulls) missingFilters.push('vazios');
  if (!pipeline.deduplicate) missingFilters.push('duplicatas');
  if (!pipeline.filterOutliers) missingFilters.push('extremos');
  if (!pipeline.normalizeScale) missingFilters.push('escalas misturadas');

  const reliabilityBadge = isClean
    ? 'Leitura Confiável (100%)'
    : `Atenção: Qualidade em ${stats.qualityScore}%`;

  const reliabilityNote = isClean
    ? `Todos os ${stats.discardedCount} registros defeituosos foram isolados. Os ${stats.validCount} dados restantes revelam o padrão real sem distorções.`
    : `Ainda há ${missingFilters.join(', ')} no lote. Números sujos escondem a tendência real e puxam a média para fora da realidade — passe na Estação 02 para limpar.`;

  const meanStr = formatOutputValue(scenario, stats.meanY);
  const medianStr = formatOutputValue(scenario, stats.medianY);
  const gapRatio =
    stats.medianY > 0
      ? Math.abs(stats.meanY - stats.medianY) / stats.medianY
      : 0;

  const majorityVsAverageNote =
    gapRatio > 0.14
      ? `Atenção ao truque dos extremos: a Média marca ${meanStr}, mas a maioria real (Mediana) está em ${medianStr}. Poucos valores gigantes estão enganando a conta!`
      : `Média (${meanStr}) e Mediana (${medianStr}) caminham bem próximas. Isso prova que nenhum valor absurdo está distorcendo a turma inteira.`;

  let trendDirectionLabel = 'Sem direção clara no lote atual';
  let trendIcon: 'up' | 'down' | 'flat' = 'flat';
  if (stats.correlation > 0.28) {
    trendIcon = 'up';
    trendDirectionLabel = `Subida Conjunta: quando ${scenario.xLabel} sobe, ${scenario.yLabel} tende a subir`;
  } else if (stats.correlation < -0.28) {
    trendIcon = 'down';
    trendDirectionLabel = `Relação Inversa: quando ${scenario.xLabel} cai, ${scenario.yLabel} tende a subir`;
  }

  // Human-friendly step change instead of raw 1-unit slope
  const stepUnit =
    scenario.id === 'cafe' ? 5 : scenario.id === 'sleep' ? 1 : 5;
  const deltaPerStep = stats.slope * stepUnit;
  const deltaSign = deltaPerStep >= 0 ? '+' : '-';
  const formattedDelta = formatOutputValue(scenario, Math.abs(deltaPerStep));

  const practicalRule =
    absCorr < 0.2
      ? `Enquanto o ruído estiver alto, não dá para estimar quanto muda a cada ${stepUnit} ${scenario.xUnit}. Limpe o lote primeiro.`
      : `Regra prática: a cada ${stepUnit} ${scenario.xUnit} a mais de ${scenario.xLabel}, o resultado varia cerca de ${deltaSign}${formattedDelta} (com sensibilidade ${pipeline.modelWeight.toFixed(1)}×).`;

  const strengthPlainText =
    r2Pct >= 75
      ? `Sinal muito firme (${r2Pct}% de consistência): os pontos formam uma trilha clara, dando segurança para planejar.`
      : r2Pct >= 45
      ? `Sinal moderado (${r2Pct}% de consistência): existe um caminho visível, mas outros fatores do dia a dia também pesam.`
      : `Sinal fraco ou encoberto (${r2Pct}%): os pontos estão espalhados demais — confira se faltou filtrar erros na Centrífuga.`;

  // Group comparison + hidden 3rd variable (z)
  const groupBuckets = new Map<
    string,
    { sumY: number; sumZ: number; count: number }
  >();
  for (const rec of stats.cleanRecords) {
    const bucket = groupBuckets.get(rec.category) ?? {
      sumY: 0,
      sumZ: 0,
      count: 0,
    };
    bucket.sumY += rec.y;
    bucket.sumZ += rec.z;
    bucket.count += 1;
    groupBuckets.set(rec.category, bucket);
  }

  const rankedGroups = Array.from(groupBuckets.entries())
    .map(([name, g]) => ({
      name,
      avgY: g.sumY / Math.max(1, g.count),
      avgZ: g.sumZ / Math.max(1, g.count),
    }))
    .sort((a, b) => b.avgY - a.avgY);

  const bestG = rankedGroups[0];
  const otherG = rankedGroups[rankedGroups.length - 1];

  const hiddenFactorNote = (() => {
    if (!bestG || !otherG || rankedGroups.length < 2) {
      return `Observe a terceira variável (${scenario.zLabel}) para entender o contexto por trás dos números.`;
    }
    if (scenario.id === 'cafe') {
      return `Fator escondido (${scenario.zLabel}): nos dias de maior movimento (${bestG.name}), a fila média chega a ${bestG.avgZ.toFixed(1)} ${scenario.zUnit} contra ${otherG.avgZ.toFixed(1)} ${scenario.zUnit} em ${otherG.name} — mostrando gargalo no balcão.`;
    }
    if (scenario.id === 'sleep') {
      return `Fator escondido (${scenario.zLabel}): quem tirou notas maiores (${bestG.name}) passou só ~${Math.round(bestG.avgZ)} ${scenario.zUnit} em telas à noite, contra ~${Math.round(otherG.avgZ)} ${scenario.zUnit} no grupo ${otherG.name}.`;
    }
    return `Fator escondido (${scenario.zLabel}): em clima ${bestG.name}, as estações chegam a ${Math.round(bestG.avgZ)}% de ocupação, caindo para ${Math.round(otherG.avgZ)}% em ${otherG.name} — hora certa de revisar a frota.`;
  })();

  const headline = isClean
    ? scenario.decisionTitle
    : `Lote parcial: ${scenario.decisionTitle}`;

  const actionSummary = isClean
    ? scenario.decisionAction
    : `${scenario.decisionAction} (Conclua os 4 filtros da Estação 02 para confirmar os números exatos.)`;

  const readingTips = [
    {
      id: 'tip-median',
      ruleTitle: '1. Compare a Maioria (Mediana) com a Média',
      plainLesson:
        'A Média soma tudo e divide; um único erro gigante já engana o resultado. A Mediana olha só para quem está bem no meio da fila.',
      liveExample:
        gapRatio > 0.14
          ? `Neste lote agora: Média ${meanStr} vs. Mediana ${medianStr} — sinal claro de extremos distorcendo!`
          : `Neste lote agora: Média ${meanStr} e Mediana ${medianStr} estão alinhadas e seguras.`,
    },
    {
      id: 'tip-trend',
      ruleTitle: '2. Veja a Direção e o Aperto dos Pontos',
      plainLesson:
        'A inclinação mostra se as coisas sobem ou descem juntas. Já a Consistência (%) mostra se os pontos obedecem à linha ou estão bagunçados.',
      liveExample: `Neste caso: ${r2Pct}% de consistência com variação de ${deltaSign}${formattedDelta} a cada ${stepUnit} ${scenario.xUnit}.`,
    },
    {
      id: 'tip-groups',
      ruleTitle: '3. Separe por Grupos em vez de Misturar Tudo',
      plainLesson:
        'Quando olhamos dias úteis, finais de semana ou faixas climáticas juntos, um grupo esconde o comportamento do outro.',
      liveExample:
        bestG && otherG && rankedGroups.length >= 2
          ? `Grupo "${bestG.name}" (${formatOutputValue(scenario, bestG.avgY)}) difere bastante de "${otherG.name}" (${formatOutputValue(scenario, otherG.avgY)}).`
          : `Use "Faixas (Clusters)" na Estação 04 para enxergar os subgrupos.`,
    },
    {
      id: 'tip-cause',
      ruleTitle: '4. Caminhar Junto não Prova Causa Única',
      plainLesson:
        'Mesmo quando duas medidas andam juntas, procure um terceiro fator escondido nos bastidores antes de concluir a história.',
      liveExample: `Aqui vale vigiar também "${scenario.zLabel}" (${scenario.zUnit}), que acompanha as mudanças de perto.`,
    },
  ];

  return {
    isClean,
    reliabilityBadge,
    reliabilityNote,
    headline,
    majorityVsAverageNote,
    trendDirectionLabel,
    trendIcon,
    practicalRule,
    strengthPlainText,
    groupComparison: {
      bestGroupLabel: bestG ? bestG.name : 'Maior grupo',
      bestGroupAvg: bestG ? formatOutputValue(scenario, bestG.avgY) : meanStr,
      otherGroupLabel: otherG ? otherG.name : 'Menor grupo',
      otherGroupAvg: otherG ? formatOutputValue(scenario, otherG.avgY) : medianStr,
      hiddenFactorNote,
    },
    actionSummary,
    readingTips,
  };
}

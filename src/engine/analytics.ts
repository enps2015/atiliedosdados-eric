import { PipelineState, ProcessedStats, ScenarioDataset } from '../types/lab';

export function computeLabStats(
  scenario: ScenarioDataset,
  pipeline: PipelineState
): ProcessedStats {
  const totalRaw = scenario.records.length;

  let nullCount = 0;
  let duplicateCount = 0;
  let outlierCount = 0;
  let scaleIssueCount = 0;

  const cleanRecords: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    z: number;
    category: string;
  }> = [];

  for (const rec of scenario.records) {
    if (rec.defect === 'null') {
      nullCount++;
      if (pipeline.removeNulls) continue;
    }
    if (rec.defect === 'duplicate') {
      duplicateCount++;
      if (pipeline.deduplicate) continue;
    }
    if (rec.defect === 'outlier') {
      outlierCount++;
      if (pipeline.filterOutliers) continue;
    }
    if (rec.defect === 'scale') {
      scaleIssueCount++;
    }

    let xVal = rec.x;
    let yVal = rec.y;
    const zVal = rec.z ?? 0;

    if (rec.defect === 'scale' && pipeline.normalizeScale) {
      xVal = rec.correctedX ?? xVal;
      yVal = rec.correctedY ?? yVal;
    }

    // If nulls are NOT removed, substitute 0 for calculation (showing real distortion!)
    const finalX = xVal ?? 0;
    const finalY = yVal ?? 0;

    cleanRecords.push({
      id: rec.id,
      label: rec.label,
      x: finalX,
      y: finalY,
      z: zVal,
      category: rec.category,
    });
  }

  const validCount = cleanRecords.length;
  const discardedCount = totalRaw - validCount;

  const yValues = cleanRecords.map((r) => r.y);
  const xValues = cleanRecords.map((r) => r.x);

  const sortedY = [...yValues].sort((a, b) => a - b);
  const n = sortedY.length || 1;

  const sumY = yValues.reduce((acc, v) => acc + v, 0);
  const sumX = xValues.reduce((acc, v) => acc + v, 0);
  const meanY = sumY / n;
  const meanX = sumX / n;

  const medianY =
    sortedY.length === 0
      ? 0
      : sortedY.length % 2 === 1
      ? sortedY[Math.floor(sortedY.length / 2)]
      : (sortedY[sortedY.length / 2 - 1] + sortedY[sortedY.length / 2]) / 2;

  const minY = sortedY[0] ?? 0;
  const maxY = sortedY[sortedY.length - 1] ?? 0;

  const varianceY =
    yValues.reduce((acc, v) => acc + (v - meanY) * (v - meanY), 0) / n;
  const stdDevY = Math.sqrt(varianceY);

  // Skew ratio drives the physical balance beam tilt in Station 3
  const rawSkew = stdDevY > 0 ? (meanY - medianY) / stdDevY : 0;
  const skewRatio = Math.max(-1, Math.min(1, rawSkew * 1.35));

  // Build 7 histogram bins over a sensible range (clamp extreme outliers into last bin so chart stays legible)
  const binCount = 7;
  const histogramCounts = new Array(binCount).fill(0);
  const typicalMax =
    scenario.id === 'cafe' ? 2600 : scenario.id === 'sleep' ? 100 : 360;
  const typicalMin =
    scenario.id === 'cafe' ? 0 : scenario.id === 'sleep' ? 0 : 0;
  const span = Math.max(1, typicalMax - typicalMin);

  for (const v of yValues) {
    const ratio = (v - typicalMin) / span;
    const idx = Math.max(0, Math.min(binCount - 1, Math.floor(ratio * binCount)));
    histogramCounts[idx]++;
  }
  const maxBin = Math.max(1, ...histogramCounts);
  const histogramBins = histogramCounts.map((c) => c / maxBin);

  // Linear regression Y = slope * X + intercept
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < cleanRecords.length; i++) {
    const dx = cleanRecords[i].x - meanX;
    const dy = cleanRecords[i].y - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const slope = denX > 1e-6 ? num / denX : 0;
  const intercept = meanY - slope * meanX;
  const correlation =
    denX > 1e-6 && denY > 1e-6 ? num / Math.sqrt(denX * denY) : 0;
  const rSquared = correlation * correlation;

  // Apply user's pedagogical model sensitivity multiplier around meanX
  const adjustedSlope = slope * pipeline.modelWeight;
  const adjustedIntercept = meanY - adjustedSlope * meanX;
  const predictedY = Math.max(
    0,
    adjustedSlope * pipeline.predictionInputX + adjustedIntercept
  );

  // Quality score 0..100 based on active sanitation tools
  const activeChecks =
    (pipeline.removeNulls ? 25 : 0) +
    (pipeline.deduplicate ? 25 : 0) +
    (pipeline.filterOutliers ? 30 : 0) +
    (pipeline.normalizeScale ? 20 : 0);

  return {
    totalRaw,
    validCount,
    discardedCount,
    nullCount,
    duplicateCount,
    outlierCount,
    scaleIssueCount,
    cleanRecords,
    meanY,
    medianY,
    stdDevY,
    minY,
    maxY,
    meanX,
    skewRatio,
    histogramBins,
    histogramCounts,
    slope: adjustedSlope,
    intercept: adjustedIntercept,
    rSquared,
    correlation,
    predictedY,
    qualityScore: activeChecks,
  };
}

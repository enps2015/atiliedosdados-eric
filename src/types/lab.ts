export type ScenarioId = 'cafe' | 'sleep' | 'bikes';

export type StationId = 1 | 2 | 3 | 4 | 5 | 6;

export type LearningMode = 'overview' | 'tour' | 'challenge' | 'glossary';

export type DefectType = 'none' | 'null' | 'duplicate' | 'outlier' | 'scale';

export interface DataRecord {
  id: string;
  label: string;
  x: number | null;
  y: number | null;
  z: number | null;
  category: string;
  defect: DefectType;
  defectNote?: string;
  correctedX?: number;
  correctedY?: number;
}

export interface PipelineState {
  removeNulls: boolean;
  deduplicate: boolean;
  filterOutliers: boolean;
  normalizeScale: boolean;
  highlightMode: 'status' | 'cluster';
  modelWeight: number;
  predictionInputX: number;
}

export interface ChallengeOption {
  id: string;
  label: string;
  isCorrect: boolean;
  feedback: string;
}

export interface LabChallenge {
  id: string;
  title: string;
  stationFocus: StationId;
  prompt: string;
  hint: string;
  type: 'diagnostic' | 'action';
  requiredPipeline?: Partial<PipelineState>;
  options?: ChallengeOption[];
  successExplanation: string;
}

export interface ScenarioDataset {
  id: ScenarioId;
  shortTitle: string;
  title: string;
  subtitle: string;
  storyTitle: string;
  protagonist: string;
  storyPrologue: string;
  storyEpilogue: string;
  question: string;
  xLabel: string;
  xUnit: string;
  xMin: number;
  xMax: number;
  xStep: number;
  defaultInputX: number;
  yLabel: string;
  yUnit: string;
  zLabel: string;
  zUnit: string;
  records: DataRecord[];
  challenges: LabChallenge[];
  decisionTitle: string;
  decisionSummary: string;
  decisionAction: string;
}

export interface ProcessedStats {
  totalRaw: number;
  validCount: number;
  discardedCount: number;
  nullCount: number;
  duplicateCount: number;
  outlierCount: number;
  scaleIssueCount: number;
  cleanRecords: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    z: number;
    category: string;
  }>;
  meanY: number;
  medianY: number;
  stdDevY: number;
  minY: number;
  maxY: number;
  meanX: number;
  skewRatio: number;
  histogramBins: number[];
  histogramCounts: number[];
  slope: number;
  intercept: number;
  rSquared: number;
  correlation: number;
  predictedY: number;
  qualityScore: number;
}

export interface StepInstruction {
  id: string;
  title: string;
  instruction: string;
  actionHint: string;
  observational?: boolean;
}

export interface InteractionProgress {
  exploredStations: Record<StationId, boolean>;
  visitedStations: Record<StationId, boolean>;
  testedBalance: boolean;
  movedSlider: boolean;
  adjustedWeight: boolean;
  completedCycleAction: boolean;
}

export interface DidacticConcept {
  id: string;
  term: string;
  tagline: string;
  plainExplanation: string;
  everydayExample: string;
}

export interface StationMeta {
  id: StationId;
  code: string;
  chapterTitle: string;
  title: string;
  instrumentName: string;
  subtitle: string;
  storyBeat: string;
  observe3D: string;
  stepInstructions: StepInstruction[];
  concepts: DidacticConcept[];
  everydayAnalogy: string;
  whatAnalystDoes: string;
  whyItMatters: string;
  cameraPos: [number, number, number];
  cameraTarget: [number, number, number];
}

export interface GlossaryEntry {
  id: string;
  term: string;
  stationId: StationId;
  instrumentPart: string;
  plainDefinition: string;
  everydayAnalogy: string;
  professionalImpact: string;
}

export type CrtReportPage = 'summary' | 'patterns' | 'howto';

export interface PatternReadingTip {
  id: string;
  ruleTitle: string;
  plainLesson: string;
  liveExample: string;
}

export interface GroupComparisonInsight {
  bestGroupLabel: string;
  bestGroupAvg: string;
  otherGroupLabel: string;
  otherGroupAvg: string;
  hiddenFactorNote: string;
}

export interface DidacticReport {
  isClean: boolean;
  reliabilityBadge: string;
  reliabilityNote: string;
  headline: string;
  majorityVsAverageNote: string;
  trendDirectionLabel: string;
  trendIcon: 'up' | 'down' | 'flat';
  practicalRule: string;
  strengthPlainText: string;
  groupComparison: GroupComparisonInsight;
  actionSummary: string;
  readingTips: PatternReadingTip[];
}


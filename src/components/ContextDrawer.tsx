import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Compass,
  Eye,
  FileText,
  HelpCircle,
  Lightbulb,
  Lock,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
  X,
} from 'lucide-react';
import { GLOSSARY_ENTRIES } from '../data/glossary';
import { STATIONS } from '../data/scenarios';
import {
  CrtReportPage,
  DidacticReport,
  InteractionProgress,
  LearningMode,
  PipelineState,
  ProcessedStats,
  ScenarioDataset,
  StationId,
} from '../types/lab';

interface ContextDrawerProps {
  open: boolean;
  mode: LearningMode;
  scenario: ScenarioDataset;
  pipeline: PipelineState;
  stats: ProcessedStats;
  activeStation: StationId | null;
  unlockedStage: StationId;
  lockedNotice: string | null;
  crtReportPage: CrtReportPage;
  report: DidacticReport;
  selectedGlossaryId: string | null;
  activeChallengeIdx: number;
  solvedChallengeIds: string[];
  interactionProgress: InteractionProgress;
  onClose: () => void;
  onDismissLockedNotice: () => void;
  onSelectStation: (stationId: StationId) => void;
  onChangeCrtPage: (page: CrtReportPage) => void;
  onSelectGlossary: (glossaryId: string) => void;
  onClearGlossarySelection: () => void;
  onResumeTourStation: (stationId: StationId) => void;
  onConfirmObservation: (stationId: StationId) => void;
  onOpenStoryIntro: () => void;
  onSelectChallengeIdx: (idx: number) => void;
  onSolveChallenge: (challengeId: string) => void;
  onApplyAllCleaning: () => void;
  onStartChallenges: () => void;
}

export const ContextDrawer: React.FC<ContextDrawerProps> = ({
  open,
  mode,
  scenario,
  pipeline,
  stats,
  activeStation,
  unlockedStage,
  lockedNotice,
  crtReportPage,
  report,
  selectedGlossaryId,
  activeChallengeIdx,
  solvedChallengeIds,
  interactionProgress,
  onClose,
  onDismissLockedNotice,
  onSelectStation,
  onChangeCrtPage,
  onSelectGlossary,
  onClearGlossarySelection,
  onResumeTourStation,
  onConfirmObservation,
  onOpenStoryIntro,
  onSelectChallengeIdx,
  onSolveChallenge,
  onApplyAllCleaning,
  onStartChallenges,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showAnalogy, setShowAnalogy] = useState(false);

  if (!open) return null;

  const currentStation = STATIONS.find((s) => s.id === (activeStation ?? 1))!;
  const glossaryEntry = selectedGlossaryId
    ? GLOSSARY_ENTRIES[selectedGlossaryId]
    : null;
  const challenge =
    scenario.challenges[activeChallengeIdx] ?? scenario.challenges[0];

  const isChallengeSolved = challenge
    ? solvedChallengeIds.includes(challenge.id)
    : false;

  const actionSatisfied =
    challenge?.type === 'action' && challenge.requiredPipeline
      ? Object.entries(challenge.requiredPipeline).every(
          ([k, val]) => pipeline[k as keyof PipelineState] === val
        )
      : false;

  const formatY = (val: number) => {
    if (scenario.yUnit === 'R$') {
      return `R$ ${Math.round(val).toLocaleString('pt-BR')}`;
    }
    return `${val.toFixed(1)} ${scenario.yUnit}`;
  };

  // Determine automatic completion state for every step instruction
  const isStepCompleted = (stepId: string): boolean => {
    switch (stepId) {
      case 's1-1':
        return interactionProgress.exploredStations[1];
      case 's1-2':
        return interactionProgress.visitedStations[2];
      case 's2-1':
        return pipeline.removeNulls && pipeline.deduplicate;
      case 's2-2':
        return pipeline.filterOutliers && pipeline.normalizeScale;
      case 's3-1':
        return interactionProgress.exploredStations[3];
      case 's3-2':
        return interactionProgress.testedBalance;
      case 's4-1':
        return interactionProgress.exploredStations[4];
      case 's4-2':
        return pipeline.highlightMode === 'cluster';
      case 's5-1':
        return interactionProgress.movedSlider;
      case 's5-2':
        return interactionProgress.adjustedWeight;
      case 's6-1':
        return interactionProgress.exploredStations[6];
      case 's6-2':
        return interactionProgress.completedCycleAction;
      default:
        return false;
    }
  };

  return (
    <aside
      aria-label="Painel narrativo e passo a passo"
      className="fixed top-[72px] left-5 z-10 w-[min(392px,calc(100vw-40px))] max-h-[calc(100vh-256px)] overflow-y-auto bg-[#121A29]/96 border border-[#2A3950] rounded-xl shadow-lg p-5 text-[#F1F5F9]"
    >
      {/* Sequential Pipeline Guardrail Banner */}
      {lockedNotice && (
        <div className="mb-3 p-2.5 bg-[#2A1D0D] border border-[#F59E0B]/60 rounded-lg text-xs text-[#FDE68A] flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 leading-relaxed">
            <Lock className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
            <span>{lockedNotice}</span>
          </div>
          <button
            type="button"
            onClick={onDismissLockedNotice}
            aria-label="Fechar aviso"
            className="text-[#F59E0B] hover:text-[#FDE68A] cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="text-xs font-medium text-[#94A3B8] flex items-center gap-1.5">
          {mode === 'tour' && <Compass className="w-3.5 h-3.5 text-[#22D3EE]" />}
          {mode === 'challenge' && <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />}
          {(mode === 'glossary' || (mode === 'overview' && glossaryEntry)) && (
            <BookOpen className="w-3.5 h-3.5 text-[#34D399]" />
          )}
          <span>
            {mode === 'challenge'
              ? `Desafio ${activeChallengeIdx + 1} de ${scenario.challenges.length}`
              : glossaryEntry && mode === 'glossary'
              ? `Glossário · Estação 0${glossaryEntry.stationId}`
              : mode === 'overview' && glossaryEntry
              ? `Peça 3D · Estação 0${glossaryEntry.stationId}`
              : currentStation.chapterTitle}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar painel"
          className="p-1 text-[#94A3B8] hover:text-[#F1F5F9] rounded-md cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F59E0B]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* MODE 1: GLOSSARY VIEW */}
      {(mode === 'glossary' || (mode === 'overview' && glossaryEntry)) && (
        <div>
          {glossaryEntry ? (
            <>
              <h2 className="font-display text-lg font-semibold text-[#F1F5F9] leading-snug mb-1">
                {glossaryEntry.term}
              </h2>
              <p className="text-xs text-[#D99B52] mb-3">
                Instrumento: {glossaryEntry.instrumentPart}
              </p>

              <p className="text-sm text-[#E2E8F0] leading-relaxed mb-3">
                {glossaryEntry.plainDefinition}
              </p>

              <div className="pt-3 border-t border-[#253248] space-y-2.5 text-xs leading-relaxed">
                <div>
                  <span className="font-semibold text-[#34D399]">
                    Analogia no dia a dia:{' '}
                  </span>
                  <span className="text-[#CBD5E1]">
                    {glossaryEntry.everydayAnalogy}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-[#22D3EE]">
                    Por que o analista se importa:{' '}
                  </span>
                  <span className="text-[#CBD5E1]">
                    {glossaryEntry.professionalImpact}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#253248] flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectStation(glossaryEntry.stationId)}
                  className="text-xs font-semibold text-[#22D3EE] hover:underline cursor-pointer"
                >
                  Focar Estação 0{glossaryEntry.stationId}
                </button>
                <button
                  type="button"
                  onClick={() => onResumeTourStation(glossaryEntry.stationId)}
                  className="text-xs font-semibold text-[#F59E0B] hover:underline cursor-pointer"
                >
                  Abrir no Guia (Etapa 0{glossaryEntry.stationId})
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#CBD5E1] mb-3">
              Clique diretamente em qualquer instrumento retrô da bancada 3D ou
              escolha um conceito abaixo.
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-[#253248]">
            <p className="text-xs font-semibold text-[#94A3B8] mb-2">
              Instrumentos do Laboratório
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(GLOSSARY_ENTRIES).map((entry) => {
                const isSelected = selectedGlossaryId === entry.id;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      onSelectGlossary(entry.id);
                      onSelectStation(entry.stationId);
                    }}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      isSelected
                        ? 'bg-[#F59E0B] text-[#0C121E]'
                        : 'bg-[#1D283B] text-[#E2E8F0] hover:bg-[#27364F]'
                    }`}
                  >
                    {entry.term.split(' (')[0]}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-[#253248] flex items-center justify-between gap-2 text-xs">
              <span className="text-[#94A3B8]">
                Eric Pimentel · Embaixador Google 2026
              </span>
              <button
                type="button"
                onClick={onOpenStoryIntro}
                className="font-semibold text-[#F59E0B] hover:underline cursor-pointer whitespace-nowrap"
              >
                História & Autor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: CHALLENGE VIEW */}
      {mode === 'challenge' && challenge && (
        <div>
          <p className="text-xs text-[#D99B52] mb-1">
            {scenario.storyTitle} · {scenario.protagonist}
          </p>
          <h2 className="font-display text-lg font-semibold text-[#F1F5F9] leading-snug mb-2">
            {challenge.title}
          </h2>
          <p className="text-sm text-[#E2E8F0] leading-relaxed mb-3">
            {challenge.prompt}
          </p>

          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setShowHint((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? 'Ocultar pista' : 'Ver pista'}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectStation(challenge.stationFocus)}
              className="text-xs font-semibold text-[#22D3EE] hover:underline cursor-pointer"
            >
              Focar Estação 0{challenge.stationFocus}
            </button>
          </div>

          {showHint && (
            <div className="mb-3 p-3 bg-[#1B2537] border border-[#2A3950] rounded-lg text-xs text-[#CBD5E1] leading-relaxed">
              {challenge.hint}
            </div>
          )}

          {challenge.type === 'diagnostic' && challenge.options && (
            <div className="space-y-2 mb-3">
              {challenge.options.map((opt) => {
                const chosen = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedOptionId(opt.id);
                      if (opt.isCorrect) {
                        onSolveChallenge(challenge.id);
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs leading-snug transition-colors cursor-pointer ${
                      chosen
                        ? opt.isCorrect
                          ? 'bg-[#0D2E2A] border-[#10B981] text-[#F1F5F9]'
                          : 'bg-[#331B1B] border-[#EF4444] text-[#F1F5F9]'
                        : 'bg-[#182235] border-[#2A3950] hover:border-[#22D3EE] text-[#E2E8F0]'
                    }`}
                  >
                    <div className="font-medium">{opt.label}</div>
                    {chosen && (
                      <div
                        className={`mt-1.5 text-[11px] leading-relaxed ${
                          opt.isCorrect ? 'text-[#34D399]' : 'text-[#FCA5A5]'
                        }`}
                      >
                        {opt.feedback}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {challenge.type === 'action' && (
            <div className="p-3 bg-[#182235] border border-[#2A3950] rounded-lg mb-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-[#94A3B8]">
                  Estado na Centrífuga:
                </span>
                <span
                  className={`font-semibold inline-flex items-center gap-1 ${
                    actionSatisfied || isChallengeSolved
                      ? 'text-[#34D399]'
                      : 'text-[#F59E0B]'
                  }`}
                >
                  {actionSatisfied || isChallengeSolved ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Critério Atendido</span>
                    </>
                  ) : (
                    <span>Aguardando ajuste</span>
                  )}
                </span>
              </div>

              {actionSatisfied && !isChallengeSolved && (
                <button
                  type="button"
                  onClick={() => onSolveChallenge(challenge.id)}
                  className="w-full py-2 px-3 bg-[#10B981] hover:bg-[#059669] text-[#0C121E] text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Confirmar Resolução
                </button>
              )}

              {!actionSatisfied && !isChallengeSolved && (
                <button
                  type="button"
                  onClick={onApplyAllCleaning}
                  className="text-xs font-medium text-[#F59E0B] hover:underline cursor-pointer"
                >
                  Aplicar limpeza completa agora
                </button>
              )}
            </div>
          )}

          {(isChallengeSolved || actionSatisfied) && (
            <div className="p-3 bg-[#0D2E2A] border border-[#10B981]/50 rounded-lg text-xs text-[#A7F3D0] leading-relaxed mb-3">
              <div className="font-semibold flex items-center gap-1.5 mb-1 text-[#34D399]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Desafio Concluído</span>
              </div>
              <p>{challenge.successExplanation}</p>
            </div>
          )}

          <div className="pt-3 border-t border-[#253248] flex items-center justify-between">
            <button
              type="button"
              disabled={activeChallengeIdx === 0}
              onClick={() => {
                setSelectedOptionId(null);
                setShowHint(false);
                onSelectChallengeIdx(Math.max(0, activeChallengeIdx - 1));
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] disabled:opacity-40 cursor-pointer disabled:cursor-default"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>
            <button
              type="button"
              disabled={activeChallengeIdx >= scenario.challenges.length - 1}
              onClick={() => {
                setSelectedOptionId(null);
                setShowHint(false);
                onSelectChallengeIdx(
                  Math.min(scenario.challenges.length - 1, activeChallengeIdx + 1)
                );
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#22D3EE] hover:underline disabled:opacity-40 cursor-pointer disabled:cursor-default"
            >
              <span>Próximo Desafio</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MODE 3: SELF-GUIDED STEP-BY-STEP STORYTELLING & TOUR VIEW */}
      {mode === 'tour' && (
        <div>
          {/* 6-Step Progress Bar with Sequential Unlock Status */}
          <div
            className="grid grid-cols-6 gap-1.5 mb-3"
            aria-label="Progresso nas 6 etapas"
          >
            {STATIONS.map((st) => {
              const isCurrent = st.id === currentStation.id;
              const isUnlocked = st.id <= unlockedStage;
              const isPast = st.id < currentStation.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onSelectStation(st.id)}
                  title={
                    isUnlocked
                      ? `${st.code}. ${st.title}`
                      : `${st.code}. ${st.title} (Bloqueada — conclua a Etapa 0${unlockedStage})`
                  }
                  className={`h-2 rounded-full transition-colors cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'bg-[#F59E0B]'
                      : isPast
                      ? 'bg-[#10B981]'
                      : isUnlocked
                      ? 'bg-[#22D3EE]/60 hover:bg-[#22D3EE]'
                      : 'bg-[#1C273A] hover:bg-[#283650]'
                  }`}
                />
              );
            })}
          </div>

          <p className="text-xs font-medium text-[#D99B52] mb-0.5">
            {scenario.storyTitle} · {scenario.protagonist}
          </p>
          <h2 className="font-display text-lg font-semibold text-[#F1F5F9] leading-snug mb-1">
            {currentStation.code}. {currentStation.title}
          </h2>
          <p className="text-xs text-[#22D3EE] mb-3">
            {currentStation.instrumentName}
          </p>

          {/* Story Context */}
          <div className="p-3 bg-[#182235] border border-[#2A3950] rounded-lg text-xs text-[#E2E8F0] leading-relaxed mb-3">
            {currentStation.id === 1
              ? scenario.storyPrologue
              : currentStation.id === 6
              ? scenario.storyEpilogue
              : currentStation.storyBeat}
          </div>

          {/* Inline 3D Piece Inspection Callout inside Tour Mode */}
          {glossaryEntry && (
            <div className="p-2.5 bg-[#0F2631] border border-[#22D3EE]/50 rounded-lg text-xs leading-relaxed mb-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-semibold text-[#22D3EE]">
                  Peça inspecionada: {glossaryEntry.term}
                </span>
                <button
                  type="button"
                  onClick={onClearGlossarySelection}
                  aria-label="Fechar explicação da peça"
                  className="text-[#94A3B8] hover:text-[#F1F5F9] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[#E2E8F0]">{glossaryEntry.plainDefinition}</p>
            </div>
          )}

          {/* Actionable Step-by-Step Checklist */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-[#F59E0B] mb-2">
              O que fazer nesta etapa:
            </p>
            <div className="space-y-2">
              {currentStation.stepInstructions.map((step) => {
                const done = isStepCompleted(step.id);
                return (
                  <div
                    key={step.id}
                    className={`p-2.5 rounded-lg border text-xs transition-colors ${
                      done
                        ? 'bg-[#0D2E2A]/70 border-[#10B981]/60'
                        : 'bg-[#151F31] border-[#253248]'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-[#F1F5F9]">
                          {step.title}
                        </div>
                        <p className="text-[#CBD5E1] leading-relaxed mt-0.5">
                          {step.instruction}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                          <span className="text-[11px] text-[#22D3EE]">
                            {done ? 'Concluído!' : step.actionHint}
                          </span>
                          {step.observational && !done && (
                            <button
                              type="button"
                              onClick={() => onConfirmObservation(currentStation.id)}
                              className="text-[11px] font-semibold text-[#F59E0B] hover:underline cursor-pointer whitespace-nowrap"
                            >
                              Marcar como visto
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Didactic Concepts Explained in Plain Language */}
          {currentStation.concepts.length > 0 && (
            <div className="mb-3 space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22D3EE]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Conceito em linguagem simples:</span>
              </div>
              {currentStation.concepts.map((concept) => (
                <div
                  key={concept.id}
                  className="p-2.5 bg-[#0F1828] border border-[#253650] rounded-lg text-xs space-y-1"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-[#F8FAFC]">
                      {concept.term}
                    </span>
                    <span className="text-[11px] text-[#D99B52] shrink-0">
                      {concept.tagline}
                    </span>
                  </div>
                  <p className="text-[#CBD5E1] leading-relaxed">
                    {concept.plainExplanation}
                  </p>
                  <p className="text-[11px] text-[#34D399] leading-relaxed pt-0.5">
                    Exemplo: {concept.everydayExample}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Didactic CRT Mini-Report at Station 06 (Synced with 3D CRT Side Buttons) */}
          {currentStation.id === 6 && (
            <div className="mb-3 p-3 bg-[#091820] border border-[#146E75] rounded-lg">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22D3EE]">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Mini Relatório do CRT</span>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    report.isClean
                      ? 'bg-[#0D2E2A] text-[#34D399]'
                      : 'bg-[#33230A] text-[#FBBF24]'
                  }`}
                >
                  {report.reliabilityBadge}
                </span>
              </div>

              {/* 3 Synced CRT Channel Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#061116] border border-[#1B3A44] rounded-md mb-2.5">
                {(
                  [
                    { id: 'summary' as const, label: '01 Síntese' },
                    { id: 'patterns' as const, label: '02 Padrões' },
                    { id: 'howto' as const, label: '03 Como Ler' },
                  ] as const
                ).map((tab) => {
                  const active = crtReportPage === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => onChangeCrtPage(tab.id)}
                      className={`py-1 px-1.5 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#F59E0B] text-[#061116]'
                          : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {crtReportPage === 'summary' && (
                <div className="space-y-2 text-xs leading-relaxed">
                  <div className="font-semibold text-[#F8FAFC]">
                    {report.headline}
                  </div>
                  <p className="text-[#CBD5E1]">{report.reliabilityNote}</p>
                  <div className="p-2 bg-[#0D2229] border border-[#1B3A44] rounded text-[#E2E8F0]">
                    {report.majorityVsAverageNote}
                  </div>
                  <div className="text-[#34D399] font-medium">
                    Plano prático: {report.actionSummary}
                  </div>
                </div>
              )}

              {crtReportPage === 'patterns' && (
                <div className="space-y-2 text-xs leading-relaxed">
                  <div className="flex items-start gap-1.5 font-semibold text-[#22D3EE]">
                    {report.trendIcon === 'up' && (
                      <TrendingUp className="w-4 h-4 shrink-0 mt-0.5 text-[#34D399]" />
                    )}
                    {report.trendIcon === 'down' && (
                      <TrendingDown className="w-4 h-4 shrink-0 mt-0.5 text-[#F59E0B]" />
                    )}
                    <span>{report.trendDirectionLabel}</span>
                  </div>
                  <p className="text-[#FDE68A] font-medium">
                    {report.practicalRule}
                  </p>
                  <p className="text-[#CBD5E1]">{report.strengthPlainText}</p>
                  <div className="p-2 bg-[#0D2229] border border-[#1B3A44] rounded space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#34D399] font-semibold">
                        {report.groupComparison.bestGroupLabel}
                      </span>
                      <span className="font-mono text-[#F8FAFC]">
                        {report.groupComparison.bestGroupAvg}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#22D3EE] font-semibold">
                        {report.groupComparison.otherGroupLabel}
                      </span>
                      <span className="font-mono text-[#CBD5E1]">
                        {report.groupComparison.otherGroupAvg}
                      </span>
                    </div>
                    <p className="text-[#CBD5E1] pt-1 border-t border-[#1B3A44]">
                      {report.groupComparison.hiddenFactorNote}
                    </p>
                  </div>
                </div>
              )}

              {crtReportPage === 'howto' && (
                <div className="space-y-2 text-xs leading-relaxed">
                  <div className="inline-flex items-center gap-1.5 font-semibold text-[#F59E0B]">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>4 regras para ler qualquer dado sem tecniquês:</span>
                  </div>
                  <div className="space-y-1.5">
                    {report.readingTips.map((tip) => (
                      <div
                        key={tip.id}
                        className="p-2 bg-[#0D2229] border border-[#1B3A44] rounded"
                      >
                        <div className="font-semibold text-[#34D399]">
                          {tip.ruleTitle}
                        </div>
                        <p className="text-[#CBD5E1] mt-0.5">{tip.plainLesson}</p>
                        <p className="text-[#22D3EE] text-[11px] mt-1 font-medium">
                          {tip.liveExample}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* What to observe in 3D */}
          <div className="p-2.5 bg-[#0F1726] border border-[#233047] rounded-lg text-xs leading-relaxed mb-3">
            <div className="font-semibold text-[#22D3EE] inline-flex items-center gap-1.5 mb-0.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Observe no objeto 3D:</span>
            </div>
            <p className="text-[#CBD5E1]">{currentStation.observe3D}</p>
          </div>

          {/* Collapsible Analogy & Professional Impact */}
          <button
            type="button"
            onClick={() => setShowAnalogy((v) => !v)}
            className="w-full flex items-center justify-between text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] py-1 cursor-pointer"
          >
            <span>Entender por que isso importa (analogia simples)</span>
            {showAnalogy ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showAnalogy && (
            <div className="mt-1.5 mb-2 space-y-2 text-xs leading-relaxed text-[#CBD5E1]">
              <p>
                <span className="font-semibold text-[#34D399]">
                  Analogia:{' '}
                </span>
                {currentStation.everydayAnalogy}
              </p>
              <p>
                <span className="font-semibold text-[#F59E0B]">
                  Por que importa:{' '}
                </span>
                {currentStation.whyItMatters}
              </p>
            </div>
          )}

          {/* Live numbers from current station */}
          <div className="mt-2 pt-2.5 border-t border-[#253248] grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[#94A3B8]">Amostras Ativas</div>
              <div className="font-mono tabular-nums font-semibold text-sm text-[#F1F5F9]">
                {stats.validCount} / {stats.totalRaw}
              </div>
            </div>
            <div>
              <div className="text-[#94A3B8]">
                {currentStation.id >= 4 ? 'Confiança (R²)' : 'Média / Mediana'}
              </div>
              <div className="font-mono tabular-nums font-semibold text-sm text-[#22D3EE]">
                {currentStation.id >= 4
                  ? `${Math.round(stats.rSquared * 100)}%`
                  : `${formatY(stats.meanY)} / ${formatY(stats.medianY)}`}
              </div>
            </div>
          </div>

          {/* Step Navigation Footer */}
          <div className="mt-3 pt-3 border-t border-[#253248] flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={currentStation.id === 1}
              onClick={() =>
                onSelectStation(Math.max(1, currentStation.id - 1) as StationId)
              }
              className="inline-flex items-center gap-1 text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] disabled:opacity-40 cursor-pointer disabled:cursor-default"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            {currentStation.id < 6 ? (
              (() => {
                const nextSid = (currentStation.id + 1) as StationId;
                const nextLocked =
                  currentStation.id > 1 && nextSid > unlockedStage;
                return (
                  <button
                    type="button"
                    onClick={() => onSelectStation(nextSid)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md cursor-pointer whitespace-nowrap transition-colors ${
                      nextLocked
                        ? 'bg-[#1D283B] border border-[#334663] text-[#CBD5E1] hover:border-[#F59E0B]'
                        : 'bg-[#F59E0B] text-[#0C121E] hover:bg-[#FBBF24]'
                    }`}
                  >
                    {nextLocked && (
                      <Lock className="w-3.5 h-3.5 text-[#F59E0B]" />
                    )}
                    <span>Próxima Etapa (0{nextSid})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                );
              })()
            ) : (
              <button
                type="button"
                onClick={onStartChallenges}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#10B981] text-[#0C121E] text-xs font-semibold rounded-md hover:bg-[#34D399] cursor-pointer whitespace-nowrap"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Testar Desafios</span>
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

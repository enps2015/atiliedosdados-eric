import React from 'react';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Lock,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { STATIONS } from '../data/scenarios';
import {
  CrtReportPage,
  LearningMode,
  PipelineState,
  ProcessedStats,
  ScenarioDataset,
  ScenarioId,
  StationId,
} from '../types/lab';

interface BottomDockProps {
  collapsed: boolean;
  muted: boolean;
  mode: LearningMode;
  scenario: ScenarioDataset;
  scenarioId: ScenarioId;
  activeStation: StationId | null;
  unlockedStage: StationId;
  crtReportPage: CrtReportPage;
  pipeline: PipelineState;
  stats: ProcessedStats;
  onToggleCollapse: () => void;
  onToggleMute: () => void;
  onOpenStoryIntro: () => void;
  onChangeScenario: (id: ScenarioId) => void;
  onSelectStation: (id: StationId | null) => void;
  onChangeCrtPage: (page: CrtReportPage) => void;
  onUpdatePipeline: (patch: Partial<PipelineState>) => void;
  onCleanAll: () => void;
  onResetDirty: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  collapsed,
  muted,
  mode,
  scenario,
  scenarioId,
  activeStation,
  unlockedStage,
  crtReportPage,
  pipeline,
  stats,
  onToggleCollapse,
  onToggleMute,
  onOpenStoryIntro,
  onChangeScenario,
  onSelectStation,
  onChangeCrtPage,
  onUpdatePipeline,
  onCleanAll,
  onResetDirty,
}) => {
  const effectiveStation: StationId = activeStation ?? 1;

  const formatY = (val: number) => {
    if (scenario.yUnit === 'R$') {
      return `R$ ${Math.round(val).toLocaleString('pt-BR')}`;
    }
    return `${val.toFixed(1)} ${scenario.yUnit}`;
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(960px,94vw)] flex flex-col items-center pointer-events-none">
      {/* Collapse / Expand Handle (Zen Mode Toggle) */}
      <div className="pointer-events-auto mb-1.5 flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141D2E] border border-[#2A3950] rounded-lg text-xs font-medium text-[#E2E8F0] hover:border-[#F59E0B] shadow-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          {collapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Mostrar Painel (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>Ocultar Painel (H)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onOpenStoryIntro}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#141D2E] border border-[#2A3950] rounded-lg text-xs font-medium text-[#F59E0B] hover:border-[#F59E0B] shadow-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>História & Autor</span>
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Ativar som do laboratório' : 'Silenciar som'}
          className="p-1.5 bg-[#141D2E] border border-[#2A3950] rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] shadow-md cursor-pointer"
        >
          {muted ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Main Collapsible Dock Container */}
      <div
        className={`pointer-events-auto w-full bg-[#121A29]/96 border border-[#2A3950] rounded-xl shadow-xl transition-transform duration-200 ease-out overflow-hidden ${
          collapsed
            ? 'translate-y-[120%] opacity-0 pointer-events-none h-0 border-0'
            : 'translate-y-0 opacity-100 p-4'
        }`}
      >
        {/* Row 1: Scenarios + 6-Station Step Selector + Live Quality Metric */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#253248]">
          {/* Scenario Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-[#0C121E] border border-[#233047] rounded-lg shrink-0">
            {(
              [
                { id: 'cafe', label: 'Cafeteria' },
                { id: 'sleep', label: 'Sono & Notas' },
                { id: 'bikes', label: 'Bicicletas' },
              ] as const
            ).map((sc) => {
              const active = scenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => onChangeScenario(sc.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#8B5A36] text-[#F8FAFC]'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
                >
                  {sc.label}
                </button>
              );
            })}
          </div>

          {/* 6-Station Timeline */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => onSelectStation(null)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeStation === null
                  ? 'bg-[#22D3EE] text-[#0C121E] font-semibold'
                  : 'text-[#94A3B8] hover:bg-[#1E293B]'
              }`}
            >
              Geral
            </button>
            {STATIONS.map((st) => {
              const active = activeStation === st.id;
              const isLocked = mode === 'tour' && st.id > unlockedStage;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onSelectStation(st.id)}
                  title={
                    isLocked
                      ? `Bloqueada no Guia — conclua a Etapa 0${unlockedStage} primeiro`
                      : `${st.code}. ${st.title}`
                  }
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#22D3EE] text-[#0C121E] font-semibold'
                      : isLocked
                      ? 'text-[#64748B] hover:bg-[#182235]'
                      : 'text-[#94A3B8] hover:bg-[#1E293B]'
                  }`}
                >
                  {isLocked && <Lock className="w-3 h-3 text-[#F59E0B]/80" />}
                  <span>
                    {st.code}. {st.title.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Live readout of applied cleaning controls, not a global data-quality score */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-[#94A3B8] shrink-0">
            <span>Etapas aplicadas:</span>
            <span
              className={`font-mono tabular-nums font-semibold ${
                stats.qualityScore >= 80 ? 'text-[#34D399]' : 'text-[#F59E0B]'
              }`}
            >
              {stats.qualityScore}%
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-[#E2E8F0]">
              {stats.validCount}/{stats.totalRaw} válidos
            </span>
          </div>
        </div>

        {/* Row 2: Contextual Stage Controls */}
        <div className="pt-3">
          {effectiveStation === 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-[#CBD5E1]">
                <span className="font-semibold text-[#D99B52]">
                  Raio-X do Frasco Bruto ({stats.totalRaw} amostras):
                </span>
                <span className="text-[#34D399] font-mono tabular-nums">
                  {stats.totalRaw -
                    stats.nullCount -
                    stats.duplicateCount -
                    stats.outlierCount -
                    stats.scaleIssueCount}{' '}
                  íntegros
                </span>
                <span className="text-[#94A3B8] font-mono tabular-nums">
                  {stats.nullCount} vazios
                </span>
                <span className="text-[#22D3EE] font-mono tabular-nums">
                  {stats.duplicateCount} repetidos
                </span>
                <span className="text-[#F59E0B] font-mono tabular-nums">
                  {stats.scaleIssueCount} escala errada
                </span>
                <span className="text-[#F87171] font-mono tabular-nums">
                  {stats.outlierCount} extremos
                </span>
              </div>

              <button
                type="button"
                onClick={() => onSelectStation(2)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0C121E] bg-[#F59E0B] hover:bg-[#FBBF24] rounded-lg cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Ir para Etapa 02: Limpar Erros</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {effectiveStation === 2 && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#D99B52] mr-1">
                  Filtros da Centrífuga:
                </span>
                {[
                  {
                    key: 'removeNulls' as const,
                    label: `Remover Nulos (${stats.nullCount})`,
                    active: pipeline.removeNulls,
                  },
                  {
                    key: 'deduplicate' as const,
                    label: `Remover Duplicatas (${stats.duplicateCount})`,
                    active: pipeline.deduplicate,
                  },
                  {
                    key: 'filterOutliers' as const,
                    label: `Filtrar Outliers (${stats.outlierCount})`,
                    active: pipeline.filterOutliers,
                  },
                  {
                    key: 'normalizeScale' as const,
                    label: `Padronizar Escala (${stats.scaleIssueCount})`,
                    active: pipeline.normalizeScale,
                  },
                ].map((ctrl) => (
                  <button
                    key={ctrl.key}
                    type="button"
                    onClick={() =>
                      onUpdatePipeline({ [ctrl.key]: !ctrl.active })
                    }
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      ctrl.active
                        ? 'bg-[#10B981] border-[#10B981] text-[#0C121E] font-semibold'
                        : 'bg-[#182235] border-[#2A3950] text-[#E2E8F0] hover:border-[#22D3EE]'
                    }`}
                  >
                    {ctrl.active ? '✓ ' : ''}
                    {ctrl.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {stats.qualityScore === 100 ? (
                  <button
                    type="button"
                    onClick={() => onSelectStation(3)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0C121E] bg-[#10B981] hover:bg-[#34D399] rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Etapa 03: Balança</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onCleanAll}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0C121E] bg-[#F59E0B] hover:bg-[#FBBF24] rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Limpar Tudo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onResetDirty}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#94A3B8] hover:text-[#F1F5F9] rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Bruto</span>
                </button>
              </div>
            </div>
          )}

          {effectiveStation === 3 && (
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-5">
                <div>
                  <span className="text-[#94A3B8]">Média ({scenario.yLabel}): </span>
                  <span className="font-mono tabular-nums font-semibold text-[#F59E0B]">
                    {formatY(stats.meanY)}
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8]">Mediana (Centro): </span>
                  <span className="font-mono tabular-nums font-semibold text-[#34D399]">
                    {formatY(stats.medianY)}
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8]">Balança: </span>
                  <span className="font-semibold text-[#F1F5F9]">
                    {Math.abs(stats.skewRatio) > 0.25
                      ? '▲ Inclinada por Outliers'
                      : '● Equilibrada'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={pipeline.filterOutliers ? onResetDirty : onCleanAll}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#182235] border border-[#2A3950] text-[#F1F5F9] hover:border-[#22D3EE] rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                >
                  {pipeline.filterOutliers
                    ? 'Reintroduzir Erros para Ver a Diferença'
                    : 'Limpar Erros e Nivelar Balança'}
                </button>
                {unlockedStage >= 4 && (
                  <button
                    type="button"
                    onClick={() => onSelectStation(4)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0C121E] bg-[#10B981] hover:bg-[#34D399] rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Etapa 04: Óptica</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {effectiveStation === 4 && (
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 p-1 bg-[#0C121E] border border-[#233047] rounded-lg">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdatePipeline({ highlightMode: 'status' })
                    }
                    className={`px-2.5 py-1 rounded-md font-medium cursor-pointer whitespace-nowrap shrink-0 ${
                      pipeline.highlightMode === 'status'
                        ? 'bg-[#22D3EE] text-[#0C121E] font-semibold'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                    Tendência Geral
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdatePipeline({ highlightMode: 'cluster' })
                    }
                    className={`px-2.5 py-1 rounded-md font-medium cursor-pointer whitespace-nowrap shrink-0 ${
                      pipeline.highlightMode === 'cluster'
                        ? 'bg-[#22D3EE] text-[#0C121E] font-semibold'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                    Faixas (Clusters)
                  </button>
                </div>

                <div>
                  <span className="text-[#94A3B8]">Correlação (r): </span>
                  <span className="font-mono tabular-nums font-semibold text-[#F1F5F9]">
                    {stats.correlation.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8]">Explicação (R²): </span>
                  <span className="font-mono tabular-nums font-semibold text-[#22D3EE]">
                    {Math.round(stats.rSquared * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[#94A3B8]">
                  X: {scenario.xLabel} ({scenario.xUnit}) · Y: {scenario.yLabel} (
                  {scenario.yUnit})
                </span>
                {unlockedStage >= 5 && (
                  <button
                    type="button"
                    onClick={() => onSelectStation(5)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0C121E] bg-[#10B981] hover:bg-[#34D399] rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Etapa 05: Simular</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {effectiveStation === 5 && (
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="flex flex-wrap items-center gap-6 flex-1">
                <label className="flex flex-col gap-1 min-w-[200px] flex-1 max-w-[280px]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#94A3B8]">
                      Simular {scenario.xLabel}
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-[#F59E0B]">
                      {pipeline.predictionInputX} {scenario.xUnit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={scenario.xMin}
                    max={scenario.xMax}
                    step={scenario.xStep}
                    value={pipeline.predictionInputX}
                    onChange={(e) =>
                      onUpdatePipeline({
                        predictionInputX: Number(e.target.value),
                      })
                    }
                    className="lab-slider w-full"
                  />
                </label>

                <label className="flex flex-col gap-1 min-w-[180px] flex-1 max-w-[240px]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#94A3B8]">
                      Sensibilidade das Válvulas
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-[#22D3EE]">
                      {pipeline.modelWeight.toFixed(1)}×
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.4}
                    max={1.4}
                    step={0.1}
                    value={pipeline.modelWeight}
                    onChange={(e) =>
                      onUpdatePipeline({ modelWeight: Number(e.target.value) })
                    }
                    className="lab-slider w-full"
                  />
                </label>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <div className="text-[11px] text-[#94A3B8]">
                    Previsão ({scenario.yLabel})
                  </div>
                  <div className="font-mono tabular-nums text-lg font-bold text-[#34D399]">
                    {formatY(stats.predictedY)}
                  </div>
                </div>
                {unlockedStage >= 6 && (
                  <button
                    type="button"
                    onClick={() => onSelectStation(6)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0C121E] bg-[#10B981] hover:bg-[#34D399] rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Etapa 06: CRT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {effectiveStation === 6 && (
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-[#D99B52] mr-1">
                  Canais do Monitor CRT:
                </span>
                {(
                  [
                    { id: 'summary' as const, label: '01 Síntese' },
                    { id: 'patterns' as const, label: '02 Padrões Escondidos' },
                    { id: 'howto' as const, label: '03 Como Ler Dados' },
                  ] as const
                ).map((ch) => {
                  const active = crtReportPage === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => onChangeCrtPage(ch.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#F59E0B] border-[#F59E0B] text-[#0C121E]'
                          : 'bg-[#182235] border-[#2A3950] text-[#E2E8F0] hover:border-[#22D3EE]'
                      }`}
                    >
                      {ch.label}
                    </button>
                  );
                })}
              </div>

              <div className="font-mono tabular-nums text-[#94A3B8] shrink-0">
                R²: {Math.round(stats.rSquared * 100)}% · Etapas:{' '}
                {stats.qualityScore}%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

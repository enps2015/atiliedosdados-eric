import { useCallback, useEffect, useMemo, useState } from 'react';
import { BottomDock } from './components/BottomDock';
import { ContextDrawer } from './components/ContextDrawer';
import { LabViewport3D } from './components/LabViewport3D';
import { StoryIntroModal } from './components/StoryIntroModal';
import { TopBar } from './components/TopBar';
import { SCENARIOS } from './data/scenarios';
import { computeLabStats } from './engine/analytics';
import { buildDidacticReport } from './engine/report';
import {
  CrtReportPage,
  InteractionProgress,
  LearningMode,
  PipelineState,
  ScenarioId,
  StationId,
} from './types/lab';
import { labAudio } from './utils/sound';

const INITIAL_PIPELINE: PipelineState = {
  removeNulls: false,
  deduplicate: false,
  filterOutliers: false,
  normalizeScale: false,
  highlightMode: 'status',
  modelWeight: 1.0,
  predictionInputX: 16,
};

function createInitialProgress(): InteractionProgress {
  return {
    exploredStations: {
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
    },
    visitedStations: {
      1: true,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false,
    },
    testedBalance: false,
    movedSlider: false,
    adjustedWeight: false,
    completedCycleAction: false,
  };
}

export default function App() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('cafe');
  // Start directly in the self-guided step-by-step tour at Stage 01 so beginners never feel lost
  const [mode, setMode] = useState<LearningMode>('tour');
  const [activeStation, setActiveStation] = useState<StationId | null>(1);
  const [cameraPresetTrigger, setCameraPresetTrigger] = useState(0);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [muted, setMuted] = useState(false);

  const [introOpen, setIntroOpen] = useState(true);
  const [hasStartedTour, setHasStartedTour] = useState(false);
  const [unlockedStage, setUnlockedStage] = useState<StationId>(1);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);
  const [selectedGlossaryId, setSelectedGlossaryId] = useState<string | null>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeChallengeIdx, setActiveChallengeIdx] = useState(0);
  const [solvedChallengeIds, setSolvedChallengeIds] = useState<string[]>([]);
  const [interactionProgress, setInteractionProgress] =
    useState<InteractionProgress>(createInitialProgress);

  const [pipeline, setPipeline] = useState<PipelineState>(INITIAL_PIPELINE);
  const [crtReportPage, setCrtReportPage] = useState<CrtReportPage>('summary');

  const scenario = SCENARIOS[scenarioId];

  const stats = useMemo(
    () => computeLabStats(scenario, pipeline),
    [scenario, pipeline]
  );

  const report = useMemo(
    () => buildDidacticReport(scenario, pipeline, stats),
    [scenario, pipeline, stats]
  );

  const totalChallenges = useMemo(
    () =>
      Object.values(SCENARIOS).reduce(
        (acc, sc) => acc + sc.challenges.length,
        0
      ),
    []
  );

  const markStationExplored = useCallback((sid: StationId) => {
    setInteractionProgress((prev) => {
      if (prev.exploredStations[sid]) return prev;
      return {
        ...prev,
        exploredStations: {
          ...prev.exploredStations,
          [sid]: true,
        },
      };
    });
  }, []);

  const markStationVisited = useCallback((sid: StationId) => {
    setInteractionProgress((prev) => {
      if (prev.visitedStations[sid]) return prev;
      return {
        ...prev,
        visitedStations: {
          ...prev.visitedStations,
          [sid]: true,
        },
      };
    });
  }, []);

  const handleSolveChallenge = useCallback((challengeId: string) => {
    setSolvedChallengeIds((prev) => {
      if (prev.includes(challengeId)) return prev;
      labAudio.playSuccessChime();
      return [...prev, challengeId];
    });
  }, []);

  const unlockUpTo = useCallback((target: StationId) => {
    setUnlockedStage((prev) => (target > prev ? target : prev));
  }, []);

  const getLockRequirementMessage = useCallback(
    (currentStage: StationId): string => {
      switch (currentStage) {
        case 1:
          return 'Para avançar, clique em "Próxima Etapa (02)" na Etapa 01.';
        case 2:
          return 'Para liberar a Etapa 03, ative os 4 filtros da Centrífuga (ou clique em "Limpar Tudo").';
        case 3:
          return 'Para liberar a Etapa 04, teste o equilíbrio da Balança comparando dados sujos vs. limpos no painel inferior.';
        case 4:
          return 'Para liberar a Etapa 05, alterne para "Faixas (Clusters)" na barra inferior da Câmara Óptica.';
        case 5:
          return 'Para liberar a Etapa 06, simule um cenário no controle deslizante da Calculadora Valvulada.';
        default:
          return 'Conclua a etapa atual para avançar no pipeline.';
      }
    },
    []
  );

  // Automatic monotonic stage unlocking as the user completes key hands-on milestones
  useEffect(() => {
    if (interactionProgress.exploredStations[1]) {
      unlockUpTo(2);
    }
    if (
      pipeline.removeNulls &&
      pipeline.deduplicate &&
      pipeline.filterOutliers &&
      pipeline.normalizeScale
    ) {
      unlockUpTo(3);
    }
    if (interactionProgress.testedBalance) {
      unlockUpTo(4);
    }
    if (pipeline.highlightMode === 'cluster') {
      unlockUpTo(5);
    }
    if (interactionProgress.movedSlider) {
      unlockUpTo(6);
    }
  }, [
    interactionProgress.exploredStations,
    interactionProgress.testedBalance,
    interactionProgress.movedSlider,
    pipeline.removeNulls,
    pipeline.deduplicate,
    pipeline.filterOutliers,
    pipeline.normalizeScale,
    pipeline.highlightMode,
    unlockUpTo,
  ]);

  useEffect(() => {
    if (!lockedNotice) return;
    const timer = window.setTimeout(() => setLockedNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [lockedNotice]);

  useEffect(() => {
    if (mode !== 'challenge') return;
    const current = scenario.challenges[activeChallengeIdx];
    if (!current || current.type !== 'action' || !current.requiredPipeline) {
      return;
    }
    const satisfied = Object.entries(current.requiredPipeline).every(
      ([k, val]) => pipeline[k as keyof PipelineState] === val
    );
    if (satisfied && !solvedChallengeIds.includes(current.id)) {
      handleSolveChallenge(current.id);
    }
  }, [
    mode,
    scenario,
    activeChallengeIdx,
    pipeline,
    solvedChallengeIds,
    handleSolveChallenge,
  ]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === 'Escape' && introOpen) {
        setIntroOpen(false);
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((c) => !c);
      } else if (e.key >= '1' && e.key <= '6') {
        const sid = Number(e.key) as StationId;
        if (sid > unlockedStage) {
          labAudio.playWoodClick(180);
          setLockedNotice(
            `Etapa 0${sid} bloqueada no Guia: ${getLockRequirementMessage(unlockedStage)}`
          );
          return;
        }
        setLockedNotice(null);
        setMode('tour');
        setSelectedGlossaryId(null);
        setActiveStation(sid);
        markStationVisited(sid);
        setDrawerOpen(true);
        setCameraPresetTrigger((t) => t + 1);
      } else if (e.key === 'Escape') {
        setDrawerOpen(false);
        setSelectedGlossaryId(null);
        setActiveStation(null);
        setCameraPresetTrigger((t) => t + 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    introOpen,
    unlockedStage,
    getLockRequirementMessage,
    markStationVisited,
  ]);

  const handleChangeMode = (nextMode: LearningMode) => {
    labAudio.playWoodClick(340);
    setLockedNotice(null);
    setMode(nextMode);
    if (nextMode === 'overview') {
      setSelectedGlossaryId(null);
      setDrawerOpen(false);
      setActiveStation(null);
      setCameraPresetTrigger((t) => t + 1);
    } else if (nextMode === 'tour') {
      setSelectedGlossaryId(null);
      setHasStartedTour(true);
      setActiveStation((prev) => {
        const candidate = prev ?? 1;
        const nextSid = candidate > unlockedStage ? unlockedStage : candidate;
        markStationVisited(nextSid);
        return nextSid;
      });
      setDrawerOpen(true);
      setCameraPresetTrigger((t) => t + 1);
    } else if (nextMode === 'challenge') {
      setInteractionProgress((p) => ({ ...p, completedCycleAction: true }));
      setSelectedGlossaryId(null);
      setActiveChallengeIdx(0);
      const firstFocus = scenario.challenges[0]?.stationFocus ?? 2;
      setActiveStation(firstFocus);
      setDrawerOpen(true);
      setCameraPresetTrigger((t) => t + 1);
    } else if (nextMode === 'glossary') {
      setSelectedGlossaryId((prev) => prev ?? 'raw-urn');
      setDrawerOpen(true);
    }
  };

  const handlePrimaryAction = () => {
    if (activeStation !== null || mode !== 'overview') {
      handleChangeMode('overview');
    } else {
      setActiveStation(1);
      handleChangeMode('tour');
    }
  };

  const handleSelectStation = (sid: StationId | null) => {
    // Enforce sequential progression in guided Tour mode so beginners never skip pipeline steps
    if (sid !== null && mode === 'tour' && sid > unlockedStage) {
      // Allow explicit Stage 1 -> Stage 2 step from Stage 1 once user clicks Next
      if (activeStation === 1 && sid === 2) {
        markStationExplored(1);
        unlockUpTo(2);
      } else {
        labAudio.playWoodClick(180);
        setLockedNotice(
          `Etapa 0${sid} bloqueada no Guia: ${getLockRequirementMessage(unlockedStage)}`
        );
        return;
      }
    }

    setLockedNotice(null);
    labAudio.playWoodClick(sid ? 300 + sid * 30 : 260);
    setActiveStation(sid);
    setCameraPresetTrigger((t) => t + 1);
    if (sid !== null) {
      setHasStartedTour(true);
      markStationVisited(sid);
      if (mode === 'tour') {
        setSelectedGlossaryId(null);
      } else if (mode === 'overview') {
        if (sid <= unlockedStage) {
          setSelectedGlossaryId(null);
          setMode('tour');
        } else {
          const fallbackGlossary: Record<StationId, string> = {
            1: 'raw-urn',
            2: 'sieve-mesh',
            3: 'scale-bars',
            4: 'dispersion-prism',
            5: 'prediction-gears',
            6: 'insight-board',
          };
          setSelectedGlossaryId(fallbackGlossary[sid]);
          setMode('glossary');
        }
      }
      if (mode !== 'challenge' && mode !== 'glossary') {
        setDrawerOpen(true);
      }
    } else {
      setSelectedGlossaryId(null);
      setMode('overview');
      setDrawerOpen(false);
    }
  };

  const handleResumeTourStation = (sid: StationId) => {
    const safeSid = sid > unlockedStage ? unlockedStage : sid;
    if (sid > unlockedStage) {
      setLockedNotice(
        `Continuando na Etapa 0${unlockedStage} do Guia: ${getLockRequirementMessage(unlockedStage)}`
      );
    } else {
      setLockedNotice(null);
    }
    labAudio.playWoodClick(300 + safeSid * 30);
    setSelectedGlossaryId(null);
    setHasStartedTour(true);
    setMode('tour');
    setActiveStation(safeSid);
    markStationVisited(safeSid);
    setDrawerOpen(true);
    setCameraPresetTrigger((t) => t + 1);
  };

  const handleSelectObject3D = useCallback(
    (glossaryId: string, stationId: StationId) => {
      if (mode === 'tour' && stationId > unlockedStage) {
        labAudio.playWoodClick(180);
        setSelectedGlossaryId(glossaryId);
        setLockedNotice(
          `Esta peça é da Etapa 0${stationId}. ${getLockRequirementMessage(unlockedStage)}`
        );
        setDrawerOpen(true);
        return;
      }
      setLockedNotice(null);
      markStationExplored(stationId);
      markStationVisited(stationId);
      setSelectedGlossaryId(glossaryId);
      setActiveStation(stationId);
      setCameraPresetTrigger((t) => t + 1);
      // Keep tour users inside the step-by-step guide so they see the checklist update live
      if (mode !== 'tour') {
        setMode('glossary');
      }
      setDrawerOpen(true);
    },
    [
      getLockRequirementMessage,
      markStationExplored,
      markStationVisited,
      mode,
      unlockedStage,
    ]
  );

  const handleSelectCrtButton = useCallback(
    (page: CrtReportPage) => {
      setCrtReportPage(page);
      markStationExplored(6);
      markStationVisited(6);
      setSelectedGlossaryId(null);
      if (mode === 'tour' && unlockedStage < 6) {
        setLockedNotice(
          `Tela do CRT atualizada! No Guia, conclua até a Etapa 0${unlockedStage} (${getLockRequirementMessage(unlockedStage)}) ou veja em 'Bancada Completa'.`
        );
        return;
      }
      setLockedNotice(null);
      if (activeStation !== 6) {
        setActiveStation(6);
        setCameraPresetTrigger((t) => t + 1);
      }
      if (mode !== 'tour') {
        setMode('tour');
      }
      setDrawerOpen(true);
    },
    [
      activeStation,
      getLockRequirementMessage,
      markStationExplored,
      markStationVisited,
      mode,
      unlockedStage,
    ]
  );

  const handleChangeCrtPageFromUI = useCallback(
    (page: CrtReportPage) => {
      labAudio.playGearSnap(6);
      setCrtReportPage(page);
      markStationExplored(6);
    },
    [markStationExplored]
  );

  const handleOrbitExplore = useCallback(
    (stationId: StationId | null) => {
      if (stationId !== null) {
        markStationExplored(stationId);
      }
    },
    [markStationExplored]
  );

  const handleConfirmObservation = useCallback(
    (stationId: StationId) => {
      labAudio.playBrassTick();
      markStationExplored(stationId);
    },
    [markStationExplored]
  );

  const handleChangeScenario = (nextId: ScenarioId) => {
    labAudio.playWoodClick(360);
    const nextScenario = SCENARIOS[nextId];
    setScenarioId(nextId);
    setActiveChallengeIdx(0);
    setSelectedGlossaryId(null);
    setUnlockedStage(1);
    setLockedNotice(null);
    if (mode === 'tour') {
      setActiveStation(1);
      setCameraPresetTrigger((t) => t + 1);
    }
    const fresh = createInitialProgress();
    fresh.completedCycleAction = true;
    fresh.visitedStations[1] = true;
    setInteractionProgress(fresh);
    setPipeline({
      removeNulls: false,
      deduplicate: false,
      filterOutliers: false,
      normalizeScale: false,
      highlightMode: 'status',
      modelWeight: 1.0,
      predictionInputX: nextScenario.defaultInputX,
    });
  };

  const handleUpdatePipeline = (patch: Partial<PipelineState>) => {
    labAudio.playBrassTick();
    if (patch.predictionInputX !== undefined || patch.modelWeight !== undefined) {
      setInteractionProgress((p) => ({
        ...p,
        movedSlider: p.movedSlider || patch.predictionInputX !== undefined,
        adjustedWeight: p.adjustedWeight || patch.modelWeight !== undefined,
      }));
    }
    setPipeline((prev) => ({ ...prev, ...patch }));
  };

  const handleCleanAll = () => {
    labAudio.playSuccessChime();
    if (activeStation === 3) {
      setInteractionProgress((p) => ({ ...p, testedBalance: true }));
    }
    setPipeline((prev) => ({
      ...prev,
      removeNulls: true,
      deduplicate: true,
      filterOutliers: true,
      normalizeScale: true,
    }));
  };

  const handleResetDirty = () => {
    labAudio.playWoodClick(240);
    if (activeStation === 3) {
      setInteractionProgress((p) => ({ ...p, testedBalance: true }));
    }
    setPipeline((prev) => ({
      ...prev,
      removeNulls: false,
      deduplicate: false,
      filterOutliers: false,
      normalizeScale: false,
    }));
  };

  const handleToggleMute = () => {
    setMuted((m) => {
      const next = !m;
      labAudio.muted = next;
      return next;
    });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0C121E]">
      {/* Fixed 3-Zone Top Bar */}
      <TopBar
        mode={mode}
        activeStation={activeStation}
        solvedCount={solvedChallengeIds.length}
        totalChallenges={totalChallenges}
        onChangeMode={handleChangeMode}
        onPrimaryAction={handlePrimaryAction}
      />

      {/* Full-Viewport 3D Interactive Retro Lab */}
      <main className="w-full h-full pt-14">
        <LabViewport3D
          scenario={scenario}
          pipeline={pipeline}
          stats={stats}
          activeStation={activeStation}
          crtReportPage={crtReportPage}
          report={report}
          cameraPresetTrigger={cameraPresetTrigger}
          onSelectObject={handleSelectObject3D}
          onSelectCrtButton={handleSelectCrtButton}
          onOrbitExplore={handleOrbitExplore}
        />
      </main>

      {/* Friendly Overview Prompt when Drawer is closed */}
      {!drawerOpen && !dockCollapsed && (
        <div className="fixed top-[72px] left-5 z-10 max-w-md">
          <p className="text-xs font-medium text-[#D99B52] mb-1">
            {scenario.storyTitle} · {scenario.protagonist}
          </p>
          <h1 className="font-display text-xl font-semibold text-[#F1F5F9] leading-snug mb-1.5">
            {scenario.question}
          </h1>
          <p className="text-xs text-[#CBD5E1] leading-relaxed mb-3">
            Clique em qualquer estação de 01 a 06 na barra inferior ou inicie o
            guia passo a passo para acompanhar toda a análise.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveStation(activeStation ?? 1);
              handleChangeMode('tour');
            }}
            className="px-3.5 py-1.5 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0C121E] text-xs font-semibold rounded-lg cursor-pointer transition-colors"
          >
            Abrir Guia Passo a Passo
          </button>
        </div>
      )}

      {/* Mobile Mode Strip (< md screens) */}
      {!dockCollapsed && (
        <div className="md:hidden fixed top-16 right-4 z-10 flex items-center gap-1 p-1 bg-[#121A29] border border-[#2A3950] rounded-lg shadow-md">
          {(
            [
              { id: 'tour', label: 'Guia' },
              { id: 'overview', label: 'Bancada' },
              { id: 'challenge', label: 'Desafios' },
              { id: 'glossary', label: 'Glossário' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleChangeMode(m.id)}
              className={`px-2 py-1 text-[11px] font-medium rounded ${
                mode === m.id
                  ? 'bg-[#F59E0B] text-[#0C121E] font-semibold'
                  : 'text-[#94A3B8]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {/* Contextual Step-by-Step Guide / Challenge / Visual Glossary Drawer */}
      <ContextDrawer
        open={drawerOpen}
        mode={mode}
        scenario={scenario}
        pipeline={pipeline}
        stats={stats}
        activeStation={activeStation}
        unlockedStage={unlockedStage}
        lockedNotice={lockedNotice}
        crtReportPage={crtReportPage}
        report={report}
        selectedGlossaryId={selectedGlossaryId}
        activeChallengeIdx={activeChallengeIdx}
        solvedChallengeIds={solvedChallengeIds}
        interactionProgress={interactionProgress}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedGlossaryId(null);
        }}
        onDismissLockedNotice={() => setLockedNotice(null)}
        onSelectStation={(sid) => handleSelectStation(sid)}
        onChangeCrtPage={handleChangeCrtPageFromUI}
        onSelectGlossary={(gid) => setSelectedGlossaryId(gid)}
        onClearGlossarySelection={() => setSelectedGlossaryId(null)}
        onResumeTourStation={handleResumeTourStation}
        onConfirmObservation={handleConfirmObservation}
        onOpenStoryIntro={() => setIntroOpen(true)}
        onSelectChallengeIdx={(idx) => {
          setActiveChallengeIdx(idx);
          const focus = scenario.challenges[idx]?.stationFocus;
          if (focus) handleSelectStation(focus);
        }}
        onSolveChallenge={handleSolveChallenge}
        onApplyAllCleaning={handleCleanAll}
        onStartChallenges={() => handleChangeMode('challenge')}
      />

      {/* Unified Collapsible Bottom Dock */}
      <BottomDock
        collapsed={dockCollapsed}
        muted={muted}
        mode={mode}
        scenario={scenario}
        scenarioId={scenarioId}
        activeStation={activeStation}
        unlockedStage={unlockedStage}
        crtReportPage={crtReportPage}
        pipeline={pipeline}
        stats={stats}
        onToggleCollapse={() => setDockCollapsed((c) => !c)}
        onToggleMute={handleToggleMute}
        onOpenStoryIntro={() => setIntroOpen(true)}
        onChangeScenario={handleChangeScenario}
        onSelectStation={handleSelectStation}
        onChangeCrtPage={handleChangeCrtPageFromUI}
        onUpdatePipeline={handleUpdatePipeline}
        onCleanAll={handleCleanAll}
        onResetDirty={handleResetDirty}
      />

      {/* Storytelling Introduction & Author / Ambassador Showcase */}
      <StoryIntroModal
        open={introOpen}
        currentUnlockedStage={unlockedStage}
        hasStartedTour={hasStartedTour}
        onStartJourney={() => {
          labAudio.playSuccessChime();
          setIntroOpen(false);
          setHasStartedTour(true);
          setMode('tour');
          setActiveStation((prev) => prev ?? unlockedStage);
          setDrawerOpen(true);
          setCameraPresetTrigger((t) => t + 1);
        }}
        onClose={() => {
          labAudio.playWoodClick(280);
          setIntroOpen(false);
        }}
      />
    </div>
  );
}

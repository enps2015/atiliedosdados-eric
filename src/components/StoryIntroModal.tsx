import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Compass,
  ExternalLink,
  Github,
  Instagram,
  Linkedin,
  MapPin,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { STATIONS } from '../data/scenarios';
import { StationId } from '../types/lab';
import { LabLogo } from './LabLogo';

interface StoryIntroModalProps {
  open: boolean;
  currentUnlockedStage: StationId;
  hasStartedTour: boolean;
  onStartJourney: () => void;
  onClose: () => void;
}

const AUTHOR_AVATAR_SRC =
  '/assets/aistudio/WhatsApp_Image_2026-10-05_at_11.16.10__4__eea52920.jpeg';
const AMBASSADOR_LOGO_SRC =
  '/assets/aistudio/Gemini_Generated_Image_7kw8z47kw8z47kw8_0d2fc02d.png';

export const StoryIntroModal: React.FC<StoryIntroModalProps> = ({
  open,
  currentUnlockedStage,
  hasStartedTour,
  onStartJourney,
  onClose,
}) => {
  const [avatarError, setAvatarError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-intro-title"
      className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-5 bg-[#070B14]/92"
    >
      <div className="relative w-full max-w-6xl max-h-[calc(100vh-24px)] overflow-y-auto lg:overflow-visible bg-[#101827] border border-[#2A3950] rounded-2xl shadow-2xl text-[#F1F5F9]">
        {/* Subtle top brass hairline accent */}
        <div className="h-1 w-full rounded-t-2xl bg-gradient-to-r from-[#8B5A36] via-[#F59E0B] to-[#22D3EE]" />

        <div className="p-4 sm:p-5 lg:p-6">
          {/* Compact Top Bar inside Modal */}
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#253248]">
            <div className="flex items-center gap-3 min-w-0">
              <LabLogo size={34} />
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[#D99B52] truncate">
                  Laboratório Retrô Sci-Fi 3D · Educação em Dados para Todos
                </p>
                <h1
                  id="story-intro-title"
                  className="font-display text-lg sm:text-xl font-bold text-[#F8FAFC] tracking-tight truncate"
                >
                  Ateliê de Dados: Da Curiosidade à Decisão Segura
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar apresentação"
              className="p-1.5 text-[#94A3B8] hover:text-[#F1F5F9] rounded-lg hover:bg-[#1A2538] transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Single-Screen 2-Column Presentation Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 pt-4 items-stretch">
            {/* Left Column: Complete Storytelling Narrative & 6-Stage Sequence */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-3">
              {/* Chapter 1: Missão Didática do Laboratório */}
              <section className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#22D3EE]">
                  <Compass className="w-3.5 h-3.5" />
                  <span>A Missão Didática do Laboratório</span>
                </div>
                <p className="text-xs sm:text-[13px] text-[#E2E8F0] leading-relaxed">
                  Você não precisa programar nem gostar de fórmulas para entender
                  dados. O <strong className="text-[#F8FAFC]">Ateliê de Dados</strong>{' '}
                  transforma 3 casos reais (Cafeteria, Sono & Notas e Bicicletas)
                  em 6 instrumentos táteis para ensinar na prática{' '}
                  <span className="text-[#22D3EE]">
                    Outliers, Padronização de Escala, Média vs. Mediana,
                    Correlação/R² e Sensibilidade das Válvulas
                  </span>.
                </p>
              </section>

              {/* Chapter 2: A Importância da Análise de Dados no Dia a Dia */}
              <section className="p-3 bg-[#151F31] border border-[#253248] rounded-xl space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F59E0B]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Por que todo mundo deveria saber analisar dados no dia a dia?</span>
                </div>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  Números guiam nossas escolhas diárias — do orçamento de casa e
                  estoque de um negócio aos estudos e notícias. Saber questionar
                  dados dá a qualquer pessoa três vantagens imediatas:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-[#0F1726] border border-[#233047] rounded-lg">
                    <div className="font-semibold text-[#34D399]">
                      1. Evita armadilhas
                    </div>
                    <p className="text-[11px] text-[#94A3B8] leading-snug mt-0.5">
                      Detecta erros, duplicatas e médias infladas por extremos.
                    </p>
                  </div>
                  <div className="p-2 bg-[#0F1726] border border-[#233047] rounded-lg">
                    <div className="font-semibold text-[#22D3EE]">
                      2. Enxerga padrões
                    </div>
                    <p className="text-[11px] text-[#94A3B8] leading-snug mt-0.5">
                      Separa coincidência passageira de tendências consistentes.
                    </p>
                  </div>
                  <div className="p-2 bg-[#0F1726] border border-[#233047] rounded-lg">
                    <div className="font-semibold text-[#F59E0B]">
                      3. Decide melhor
                    </div>
                    <p className="text-[11px] text-[#94A3B8] leading-snug mt-0.5">
                      Troca o "achismo" por previsões simples e ação clara.
                    </p>
                  </div>
                </div>
              </section>

              {/* Chapter 3: Sequential 6-Stage Compact Roadmap */}
              <section className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#34D399]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Jornada sequencial em 6 etapas (sem pular passos)</span>
                  </div>
                  <span className="text-[11px] text-[#94A3B8]">
                    Progresso 01 → 06
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {STATIONS.map((st) => (
                    <div
                      key={st.id}
                      className="px-2.5 py-2 bg-[#0D1523] border border-[#233047] rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-semibold text-[#D99B52]">
                          {st.code}
                        </span>
                        <span className="font-semibold text-[#F1F5F9] truncate">
                          {st.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                        {st.instrumentName.split(' & ')[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column: Seção Autor & Programa Embaixadores Estudantis Google Brasil 2026 */}
            <aside className="lg:col-span-5 flex flex-col justify-between gap-3 p-3.5 sm:p-4 bg-[#0C1320] border border-[#253248] rounded-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#223047]">
                  <h2 className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#F59E0B]">
                    <Award className="w-3.5 h-3.5" />
                    <span>Autor</span>
                  </h2>
                  <span className="text-[11px] text-[#94A3B8] inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#22D3EE]" />
                    <span>Belém-PA · 2026</span>
                  </span>
                </div>

                {/* Author Avatar + Identity + Ambassador Emblem in one unified row */}
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#162033] border border-[#334663] shrink-0 flex items-center justify-center">
                    {!avatarError ? (
                      <img
                        src={AUTHOR_AVATAR_SRC}
                        alt="Avatar de Eric Pimentel"
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarError(true)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-display font-bold text-base text-[#F59E0B]">
                        EP
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-display text-base font-bold text-[#F8FAFC] leading-tight">
                      Eric Pimentel
                    </div>
                    <p className="text-xs font-medium text-[#22D3EE] mt-0.5 leading-snug">
                      Embaixador Estudantil Google 2026
                    </p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5 leading-snug">
                      Belém-PA · 2026
                    </p>
                  </div>

                  <div className="w-14 h-14 rounded-xl bg-[#F8FAFC] border border-[#334663] p-1 shrink-0 flex items-center justify-center">
                    {!logoError ? (
                      <img
                        src={AMBASSADOR_LOGO_SRC}
                        alt="Logo Embaixadores Estudantis Google Brasil 2026"
                        referrerPolicy="no-referrer"
                        onError={() => setLogoError(true)}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-[#0C121E] text-center">
                        GSA 26
                      </span>
                    )}
                  </div>
                </div>

                {/* Compact Program Context */}
                <div className="p-2.5 bg-[#141E30] border border-[#253248] rounded-lg text-[11px] text-[#CBD5E1] leading-relaxed">
                  Projeto criado por{' '}
                  <strong className="text-[#F8FAFC]">
                    Eric Pimentel - Embaixador Estudantil Google 2026 - Belém-PA - 2026
                  </strong>{' '}
                  para o programa{' '}
                  <span className="text-[#22D3EE] font-medium">
                    Embaixadores Estudantis Google Brasil 2026
                  </span>
                  , aproximando ciência de dados de todas as áreas.
                </div>

                {/* Author Social Links & GitHub (Compact 3-Column Row) */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-[#94A3B8]">
                    Redes sociais e GitHub do autor
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <a
                      href="https://www.linkedin.com/in/ericpimentel-dados/"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="LinkedIn: linkedin.com/in/ericpimentel-dados"
                      className="flex flex-col justify-between p-2 bg-[#141F32] hover:bg-[#1B2A42] border border-[#283852] hover:border-[#22D3EE] rounded-lg transition-colors text-[#E2E8F0]"
                    >
                      <div className="flex items-center justify-between">
                        <Linkedin className="w-3.5 h-3.5 text-[#22D3EE]" />
                        <ExternalLink className="w-3 h-3 text-[#64748B]" />
                      </div>
                      <span className="font-semibold text-[11px] mt-1">
                        LinkedIn
                      </span>
                      <span className="text-[10px] text-[#94A3B8] truncate">
                        ericpimentel-dados
                      </span>
                    </a>

                    <a
                      href="https://www.instagram.com/eric.n.pimentel/"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Instagram: @eric.n.pimentel"
                      className="flex flex-col justify-between p-2 bg-[#141F32] hover:bg-[#1B2A42] border border-[#283852] hover:border-[#F59E0B] rounded-lg transition-colors text-[#E2E8F0]"
                    >
                      <div className="flex items-center justify-between">
                        <Instagram className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <ExternalLink className="w-3 h-3 text-[#64748B]" />
                      </div>
                      <span className="font-semibold text-[11px] mt-1">
                        Instagram
                      </span>
                      <span className="text-[10px] text-[#94A3B8] truncate">
                        @eric.n.pimentel
                      </span>
                    </a>

                    <a
                      href="https://github.com/enps2015"
                      target="_blank"
                      rel="noopener noreferrer"
                      title="GitHub: github.com/enps2015"
                      className="flex flex-col justify-between p-2 bg-[#141F32] hover:bg-[#1B2A42] border border-[#283852] hover:border-[#34D399] rounded-lg transition-colors text-[#E2E8F0]"
                    >
                      <div className="flex items-center justify-between">
                        <Github className="w-3.5 h-3.5 text-[#34D399]" />
                        <ExternalLink className="w-3 h-3 text-[#64748B]" />
                      </div>
                      <span className="font-semibold text-[11px] mt-1">
                        GitHub
                      </span>
                      <span className="text-[10px] text-[#94A3B8] truncate">
                        enps2015
                      </span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Action CTA */}
              <div className="pt-2.5 border-t border-[#223047] flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={onStartJourney}
                  className="w-full py-2.5 px-4 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0C121E] text-sm font-bold rounded-lg transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>
                    {hasStartedTour
                      ? `Continuar Jornada (Etapa 0${currentUnlockedStage})`
                      : 'Iniciar Jornada na Etapa 01'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-center text-[#94A3B8]">
                  Você avança etapa por etapa conforme experimenta cada instrumento.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

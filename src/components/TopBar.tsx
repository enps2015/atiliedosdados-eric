import React from 'react';
import { LearningMode, StationId } from '../types/lab';
import { LabLogo } from './LabLogo';

interface TopBarProps {
  mode: LearningMode;
  activeStation: StationId | null;
  solvedCount: number;
  totalChallenges: number;
  onChangeMode: (mode: LearningMode) => void;
  onPrimaryAction: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  mode,
  activeStation,
  solvedCount,
  totalChallenges,
  onChangeMode,
  onPrimaryAction,
}) => {
  const navItems: Array<{ id: LearningMode; label: string }> = [
    { id: 'tour', label: 'Guia Passo a Passo' },
    { id: 'overview', label: 'Bancada Completa' },
    {
      id: 'challenge',
      label: `Desafios (${solvedCount}/${totalChallenges})`,
    },
    { id: 'glossary', label: 'Glossário 3D' },
  ];

  const primaryLabel =
    activeStation !== null || mode !== 'overview'
      ? 'Ver Bancada Toda'
      : 'Iniciar Passo 01';

  return (
    <header className="fixed top-0 left-0 right-0 z-20 h-14 px-6 bg-[#111827]/95 border-b border-[#253248] flex items-center justify-between gap-8">
      <button
        type="button"
        onClick={() => onChangeMode('tour')}
        className="flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-[#F1F5F9] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F59E0B] rounded"
      >
        <LabLogo size={30} />
        <span>Ateliê de Dados</span>
      </button>

      <nav
        aria-label="Modos do laboratório"
        className="hidden md:flex items-center gap-6"
      >
        {navItems.map((item) => {
          const active = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeMode(item.id)}
              className={`relative py-1 text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F59E0B] rounded ${
                active
                  ? 'text-[#22D3EE]'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              {item.label}
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 right-0 -bottom-[15px] h-[2px] bg-[#F59E0B]"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onPrimaryAction}
          className="px-4 py-2 text-xs font-semibold text-[#0C121E] bg-[#F59E0B] hover:bg-[#FBBF24] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B]"
        >
          {primaryLabel}
        </button>
      </div>
    </header>
  );
};

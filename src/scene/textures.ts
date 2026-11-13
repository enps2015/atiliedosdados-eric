import * as THREE from 'three';
import {
  CrtReportPage,
  DidacticReport,
  ProcessedStats,
  ScenarioDataset,
} from '../types/lab';

export function createWalnutWoodTextures(maxAnisotropy: number): {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const width = 1024;
  const height = 512;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = width;
  colorCanvas.height = height;
  const ctx = colorCanvas.getContext('2d')!;

  // Rich varnished walnut base
  ctx.fillStyle = '#5E3A24';
  ctx.fillRect(0, 0, width, height);

  const plankHeight = height / 5;
  for (let p = 0; p < 5; p++) {
    const y0 = p * plankHeight;
    const shift = (p % 3 - 1) * 7;
    ctx.fillStyle = `rgb(${94 + shift}, ${58 + Math.round(shift * 0.6)}, ${36 + Math.round(shift * 0.4)})`;
    ctx.fillRect(0, y0, width, plankHeight);

    // Organic walnut wood grain waves
    for (let i = 0; i < 110; i++) {
      const gy = y0 + Math.random() * plankHeight;
      const alpha = 0.08 + Math.random() * 0.14;
      ctx.strokeStyle =
        i % 3 === 0
          ? `rgba(42, 22, 12, ${alpha})`
          : `rgba(138, 86, 52, ${alpha * 0.85})`;
      ctx.lineWidth = 0.8 + Math.random() * 2.2;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      const wave = (Math.random() - 0.5) * 12;
      ctx.bezierCurveTo(
        width * 0.3,
        gy + wave,
        width * 0.7,
        gy - wave,
        width,
        gy + (Math.random() - 0.5) * 5
      );
      ctx.stroke();
    }

    // Plank seam
    ctx.fillStyle = 'rgba(25, 13, 7, 0.45)';
    ctx.fillRect(0, y0, width, 2);
  }

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 512;
  roughCanvas.height = 256;
  const rctx = roughCanvas.getContext('2d')!;
  rctx.fillStyle = '#7A7A7A'; // Satin varnish ~0.48 roughness
  rctx.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 220; i++) {
    const ry = Math.random() * 256;
    rctx.strokeStyle =
      i % 2 === 0 ? 'rgba(155,155,155,0.22)' : 'rgba(85,85,85,0.22)';
    rctx.lineWidth = 1.2;
    rctx.beginPath();
    rctx.moveTo(0, ry);
    rctx.lineTo(512, ry);
    rctx.stroke();
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 1);
  map.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.colorSpace = THREE.NoColorSpace;
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 1);
  roughnessMap.anisotropy = maxAnisotropy;

  return { map, roughnessMap };
}

export function createCopperScaleTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1B2436';
  ctx.fillRect(0, 0, 1024, 128);

  // Top & bottom brushed copper bezel strips
  ctx.fillStyle = '#C68A47';
  ctx.fillRect(0, 0, 1024, 8);
  ctx.fillRect(0, 120, 1024, 8);

  // Subtle tick marks
  ctx.strokeStyle = '#64748B';
  for (let x = 24; x <= 1000; x += 16) {
    const isMajor = (x - 24) % 160 === 0;
    ctx.lineWidth = isMajor ? 2.5 : 1;
    ctx.beginPath();
    ctx.moveTo(x, 8);
    ctx.lineTo(x, isMajor ? 34 : 20);
    ctx.stroke();
  }

  const labels = [
    '01 COLETA',
    '02 CENTRÍFUGA',
    '03 BALANÇA',
    '04 ÓPTICA',
    '05 VÁLVULAS',
    '06 TERMINAL',
  ];
  ctx.font = '600 17px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';

  labels.forEach((lbl, idx) => {
    const cx = 92 + idx * 168;
    // Small brass rivet
    ctx.fillStyle = '#D99B52';
    ctx.beginPath();
    ctx.arc(cx - 66, 76, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F59E0B';
    ctx.fillText(lbl, cx + 4, 82);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createSieveMeshTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#B88446';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#1E160E';
  const step = 16;
  for (let y = 8; y < 256; y += step) {
    for (let x = 8; x < 256; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, 4.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createDialGaugeTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark Bakelite / vintage radar dial face
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, 512, 512);

  // Warm copper outer bezel
  ctx.strokeStyle = '#D99B52';
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.arc(256, 256, 232, 0, Math.PI * 2);
  ctx.stroke();

  // Colored phosphor arc zones
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#0F766E';
  ctx.beginPath();
  ctx.arc(256, 256, 198, startAngle, startAngle + (endAngle - startAngle) * 0.55);
  ctx.stroke();

  ctx.strokeStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(256, 256, 198, startAngle + (endAngle - startAngle) * 0.55, endAngle);
  ctx.stroke();

  const steps = 24;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ang = startAngle + t * (endAngle - startAngle);
    const isMajor = i % 4 === 0;
    const rOut = 188;
    const rIn = isMajor ? 156 : 172;
    ctx.strokeStyle = isMajor ? '#F1F5F9' : '#64748B';
    ctx.lineWidth = isMajor ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(256 + Math.cos(ang) * rIn, 256 + Math.sin(ang) * rIn);
    ctx.lineTo(256 + Math.cos(ang) * rOut, 256 + Math.sin(ang) * rOut);
    ctx.stroke();
  }

  ctx.fillStyle = '#F59E0B';
  ctx.font = '600 22px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ORÁCULO ANALÓGICO', 256, 355);

  ctx.fillStyle = '#22D3EE';
  ctx.font = '600 17px "IBM Plex Mono", monospace';
  ctx.fillText('PREVISÃO CALIBRADA', 256, 388);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 16, 128, 128, 124);
  grad.addColorStop(0, 'rgba(6, 9, 16, 0.55)');
  grad.addColorStop(0.55, 'rgba(6, 9, 16, 0.22)');
  grad.addColorStop(1, 'rgba(6, 9, 16, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createCrtControlStripTexture(
  maxAnisotropy = 4
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#181E29';
  ctx.fillRect(0, 0, 160, 512);

  // Subtle metallic frame
  ctx.strokeStyle = '#9C6B35';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 10, 144, 492);

  ctx.fillStyle = '#D99B52';
  ctx.font = '700 13px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CRT · CANAL', 80, 62);

  const labels = [
    { y: 186, text: '01 SÍNTESE' },
    { y: 334, text: '02 PADRÃO' },
    { y: 482, text: '03 GUIA' },
  ];

  labels.forEach((lbl) => {
    ctx.fillStyle = '#22D3EE';
    ctx.font = '700 13px "IBM Plex Mono", monospace';
    ctx.fillText(lbl.text, 80, lbl.y);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createInsightBoardCanvas(maxAnisotropy = 4): {
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 512;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return { canvas, texture };
}

export function updateInsightBoardCanvas(
  canvas: HTMLCanvasElement,
  texture: THREE.CanvasTexture,
  scenario: ScenarioDataset,
  stats: ProcessedStats,
  page: CrtReportPage = 'summary',
  report?: DidacticReport
): void {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  // Deep CRT phosphor screen background with subtle radial vignette
  const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.48, 40, w * 0.5, h * 0.5, w * 0.62);
  bgGrad.addColorStop(0, '#0D2229');
  bgGrad.addColorStop(1, '#061116');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle oscilloscope grid
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.06)';
  ctx.lineWidth = 1;
  for (let gx = 48; gx < w - 32; gx += 48) {
    ctx.beginPath();
    ctx.moveTo(gx, 24);
    ctx.lineTo(gx, h - 24);
    ctx.stroke();
  }
  for (let gy = 48; gy < h - 32; gy += 48) {
    ctx.beginPath();
    ctx.moveTo(24, gy);
    ctx.lineTo(w - 24, gy);
    ctx.stroke();
  }

  // Subtle horizontal CRT scanlines
  ctx.fillStyle = 'rgba(34, 211, 238, 0.045)';
  for (let y = 0; y < h; y += 6) {
    ctx.fillRect(0, y, w, 2);
  }

  // Phosphor frame inset
  ctx.strokeStyle = '#146E75';
  ctx.lineWidth = 4;
  ctx.strokeRect(18, 18, w - 36, h - 36);

  // Header kicker & active page tabs [01] [02] [03]
  const pageTag =
    page === 'summary' ? '01 SÍNTESE' : page === 'patterns' ? '02 PADRÕES' : '03 COMO LER';
  ctx.fillStyle = '#22D3EE';
  ctx.font = '600 16px "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`CRT · ${scenario.shortTitle.toUpperCase()} · ${pageTag}`, 40, 56);

  const tabs: Array<{ id: CrtReportPage; label: string; x: number }> = [
    { id: 'summary', label: '01', x: w - 188 },
    { id: 'patterns', label: '02', x: w - 134 },
    { id: 'howto', label: '03', x: w - 80 },
  ];
  tabs.forEach((t) => {
    const active = t.id === page;
    ctx.fillStyle = active ? '#F59E0B' : '#13313B';
    ctx.fillRect(t.x, 34, 42, 26);
    ctx.strokeStyle = active ? '#FBBF24' : '#22D3EE';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(t.x, 34, 42, 26);
    ctx.fillStyle = active ? '#061116' : '#94A3B8';
    ctx.font = '700 15px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t.label, t.x + 21, 53);
  });
  ctx.textAlign = 'left';

  const formatMetricY = (val: number) => {
    if (scenario.yUnit === 'R$') {
      return `R$${Math.round(val).toLocaleString('pt-BR')}`;
    }
    return `${val.toFixed(1)} ${scenario.yUnit}`;
  };

  if (page === 'summary') {
    // PAGE 01: Executive Synthesis & Decision
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '700 28px "Outfit", sans-serif';
    const titleEndY = wrapText(
      ctx,
      report?.headline ?? scenario.decisionTitle,
      40,
      98,
      w - 80,
      34
    );

    const div1Y = Math.max(146, titleEndY + 16);
    ctx.fillStyle = '#1E4650';
    ctx.fillRect(40, div1Y, w - 80, 2);

    const drawStat = (x: number, y: number, label: string, val: string, color: string) => {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(label, x, y);
      ctx.fillStyle = color;
      ctx.font = '600 26px "IBM Plex Mono", monospace';
      ctx.fillText(val, x, y + 34);
    };

    const statY = div1Y + 28;
    drawStat(
      40,
      statY,
      'Qualidade',
      `${stats.qualityScore}%`,
      stats.qualityScore >= 80 ? '#34D399' : '#FBBF24'
    );
    drawStat(202, statY, 'Consistência', `${Math.round(stats.rSquared * 100)}%`, '#22D3EE');
    drawStat(372, statY, 'Maioria (Mediana)', formatMetricY(stats.medianY), '#F8FAFC');
    drawStat(564, statY, 'Previsão', formatMetricY(stats.predictedY), '#34D399');

    const div2Y = statY + 56;
    ctx.fillStyle = '#1E4650';
    ctx.fillRect(40, div2Y, w - 80, 2);

    const recLabelY = div2Y + 30;
    ctx.fillStyle = '#F59E0B';
    ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      report?.reliabilityBadge ?? `Plano para ${scenario.protagonist.split(',')[0]}`,
      40,
      recLabelY
    );

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '500 17px "Plus Jakarta Sans", sans-serif';
    const noteEnd = wrapText(
      ctx,
      report?.majorityVsAverageNote ?? scenario.decisionSummary,
      40,
      recLabelY + 26,
      w - 80,
      24
    );

    ctx.fillStyle = '#34D399';
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    wrapText(
      ctx,
      `Ação: ${report?.actionSummary ?? scenario.decisionAction}`,
      40,
      Math.max(noteEnd + 34, recLabelY + 86),
      w - 80,
      24
    );
  } else if (page === 'patterns') {
    // PAGE 02: Hidden Patterns Discovered
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '700 25px "Outfit", sans-serif';
    ctx.fillText('Padrões Escondidos Encontrados', 40, 96);

    ctx.fillStyle = '#22D3EE';
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    const dirEnd = wrapText(
      ctx,
      report?.trendDirectionLabel ?? 'Analisando tendência...',
      40,
      132,
      w - 80,
      24
    );

    ctx.fillStyle = '#FBBF24';
    ctx.font = '600 17px "IBM Plex Mono", monospace';
    const ruleEnd = wrapText(
      ctx,
      report?.practicalRule ?? '',
      40,
      dirEnd + 32,
      w - 80,
      24
    );

    const divY = Math.max(216, ruleEnd + 16);
    ctx.fillStyle = '#1E4650';
    ctx.fillRect(40, divY, w - 80, 2);

    // Group comparison visual bars inside CRT
    const gc = report?.groupComparison;
    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 15px "IBM Plex Mono", monospace';
    ctx.fillText('COMPARAÇÃO ENTRE GRUPOS E FATOR OCULTO', 40, divY + 28);

    if (gc) {
      const barY1 = divY + 46;
      ctx.fillStyle = '#10B981';
      ctx.fillRect(40, barY1, 320, 22);
      ctx.fillStyle = '#F8FAFC';
      ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`${gc.bestGroupLabel}: ${gc.bestGroupAvg}`, 376, barY1 + 17);

      const barY2 = barY1 + 32;
      ctx.fillStyle = '#22D3EE';
      ctx.fillRect(40, barY2, 200, 22);
      ctx.fillStyle = '#CBD5E1';
      ctx.fillText(`${gc.otherGroupLabel}: ${gc.otherGroupAvg}`, 256, barY2 + 17);

      ctx.fillStyle = '#E2E8F0';
      ctx.font = '500 17px "Plus Jakarta Sans", sans-serif';
      wrapText(ctx, gc.hiddenFactorNote, 40, barY2 + 54, w - 80, 24);
    }
  } else {
    // PAGE 03: Didactic Field Guide — How to Read Hidden Patterns
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '700 24px "Outfit", sans-serif';
    ctx.fillText('Como Ler Qualquer Dado (Sem Tecniquês)', 40, 94);

    const tips = report?.readingTips ?? [];
    let currY = 132;
    tips.slice(0, 4).forEach((tip, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#34D399' : '#F59E0B';
      ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(tip.ruleTitle, 40, currY);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '500 14px "Plus Jakarta Sans", sans-serif';
      const endLine = wrapText(ctx, tip.liveExample, 40, currY + 21, w - 80, 19);
      currY = endLine + 32;
    });
  }

  // Footer prompt pointing to side hardware buttons
  ctx.fillStyle = '#64748B';
  ctx.font = '600 13px "IBM Plex Mono", monospace';
  ctx.fillText('CLIQUE NOS BOTÕES À DIREITA DO CRT PARA ALTERNAR AS PÁGINAS', 40, h - 32);

  texture.needsUpdate = true;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currY);
      line = words[n] + ' ';
      currY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currY);
  return currY;
}

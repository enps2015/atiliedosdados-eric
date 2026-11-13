# Ateliê de Dados — Da Curiosidade à Decisão Segura

> Um laboratório retrô sci-fi em 3D para aprender fundamentos de análise de dados por meio de exploração, experimentação e desafios interativos.

**Acesso ao laboratório:** https://enps2015.github.io/atiliedosdados-eric/

> **Dados sintéticos:** todos os registros dos três cenários são simulados e servem exclusivamente para aprendizagem. Resultados e recomendações são exemplos de interpretação, não evidências empíricas nem orientações operacionais.

## Sobre o projeto

O Ateliê de Dados é uma experiência educacional aberta que apresenta etapas fundamentais de um pipeline de análise de dados sem exigir experiência prévia em programação. A pessoa aprende manipulando instrumentos virtuais e observando como decisões de preparação e análise alteram os resultados.

O projeto é independente de área de formação, religião, cor, gênero ou preferência política. Seu foco é ampliar o acesso à cultura de dados.

## O que é possível explorar

- **Seis estações:** origem e inspeção, limpeza, exploração, transformação e relações, modelagem/predição e interpretação.
- **Três estudos de caso didáticos:** cafeteria, sono e desempenho acadêmico, e mobilidade por bicicletas.
- **Experimentos interativos:** dados ausentes, duplicidades, valores atípicos, padronização de escalas, média versus mediana, correlação, regressão e interpretação.
- **Modos de aprendizagem:** guia passo a passo, bancada livre, desafios e glossário.
- **Laboratório 3D:** objetos construídos proceduralmente com Three.js, com controles de câmera e sonorização procedural.

## Para quem

Estudantes, educadores, profissionais e pessoas curiosas de qualquer área que queiram compreender como dados são coletados, preparados, analisados e usados para apoiar decisões.

## Precisa de uma chave de IA?

Não. O laboratório funciona no navegador: os cenários, interações e cálculos são executados no próprio dispositivo. A versão publicada não exige chave Gemini, serviço de backend ou cadastro para experimentar.

## Como começar

1. Abra o laboratório pelo link publicado.
2. Leia a apresentação inicial.
3. Selecione **Iniciar Jornada na Etapa 01**.
4. Explore cada estação, siga as instruções e experimente os controles.
5. Compare os resultados antes e depois da preparação dos dados.

## Tecnologias

- React + TypeScript
- Vite
- Three.js
- Tailwind CSS
- Web Audio API
- Bun para gerenciamento de dependências e automação de build

## Executar localmente

Requisitos: Bun instalado.

```bash
git clone https://github.com/enps2015/atiliedosdados-eric.git
cd atiliedosdados-eric
bun install --frozen-lockfile
bun run dev
```

Para validar o build local destinado ao GitHub Pages:

```bash
VITE_BASE_PATH=/atiliedosdados-eric/ bun run build
bun run preview
```

## Publicação

O projeto é publicado no GitHub Pages por GitHub Actions. Cada push em `main` executa instalação reprodutível, verificação TypeScript, build do Vite e deploy do diretório `dist`.

Em **Settings → Pages**, selecione **GitHub Actions** como fonte de publicação.

## Nota sobre os dados e a interpretação

Os cenários e registros apresentados no laboratório são **dados sintéticos, criados para fins didáticos**. Eles não representam medições de campo nem pesquisas empíricas. As tendências e recomendações exibidas são exemplos de interpretação dentro dos cenários simulados; não devem ser tratadas como comprovação de causalidade ou como orientação operacional real.

Em especial, correlação não demonstra, por si só, relação de causa e efeito. O laboratório procura estimular a leitura crítica e a formulação de perguntas, não substituir avaliação contextual, validação estatística ou conhecimento especializado.

## Acessibilidade e desempenho

A aplicação utiliza renderização 3D via WebGL. A experiência visual pode variar conforme o navegador, dispositivo e capacidade gráfica. Em dispositivos com recursos gráficos limitados, efeitos visuais podem ser reduzidos automaticamente.

## Autor

**Eric Pimentel**  
Embaixador Estudantil Google Brasil 2026  
Belém — Pará — Brasil

- GitHub: https://github.com/enps2015
- Instagram: https://www.instagram.com/eric.n.pimentel/
- LinkedIn: https://www.linkedin.com/in/eric-np-santos/

## Licença

Nenhuma licença de redistribuição foi identificada no repositório no momento desta revisão. Consulte o autor antes de reutilizar, modificar ou redistribuir o código e os assets.

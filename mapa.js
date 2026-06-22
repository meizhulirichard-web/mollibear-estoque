/**
 * Sistema de Estoque - Mollibear
 * Funções do Mapa (SVG e Estantes)
 */

import { calcularOcupacaoEstante } from './utils.js';

// ============================================
// DADOS DAS ESTANTES
// ============================================

/**
 * Dados das estantes da Sala P
 * @type {Array<{n: number, x: number, y: number, w: number, h: number, c: string}>}
 */
const estantes = [
  // LADO ESQUERDO DA LOJA (1-6): da frente para os fundos
  {n:1, x:20, y:600, w:50, h:80, c:"#f5e6d3"},
  {n:2, x:20, y:510, w:50, h:80, c:"#f5e6d3"},
  {n:3, x:20, y:420, w:50, h:80, c:"#f5e6d3"},
  {n:4, x:20, y:330, w:50, h:80, c:"#f5e6d3"},
  {n:5, x:20, y:240, w:50, h:80, c:"#f5e6d3"},
  {n:6, x:20, y:150, w:50, h:80, c:"#f5e6d3"},

  // PARTE SUPERIOR ESQUERDA (7-8)
  {n:7, x:100, y:20, w:100, h:40, c:"#f5e6d3"},
  {n:8, x:210, y:20, w:100, h:40, c:"#f5e6d3"},

  // PARTE SUPERIOR DIREITA (9-12)
  {n:9, x:700, y:20, w:100, h:40, c:"#f5e6d3"},
  {n:10, x:810, y:20, w:100, h:40, c:"#f5e6d3"},
  {n:11, x:920, y:20, w:100, h:40, c:"#f5e6d3"},
  {n:12, x:1030, y:20, w:100, h:40, c:"#f5e6d3"},

  // LADO DIREITO DA LOJA (13-16): espelhadas de cima para baixo
  {n:16, x:1120, y:600, w:50, h:80, c:"#f5e6d3"},
  {n:15, x:1120, y:445, w:50, h:80, c:"#f5e6d3"},
  {n:14, x:1120, y:365, w:50, h:80, c:"#f5e6d3"},
  {n:13, x:1120, y:285, w:50, h:80, c:"#f5e6d3"},

  // PARTE INFERIOR (17-21): da direita para a esquerda
  {n:17, x:1030, y:700, w:100, h:40, c:"#d4e6f1"},
  {n:18, x:920, y:700, w:100, h:40, c:"#d4e6f1"},
  {n:19, x:810, y:700, w:100, h:40, c:"#d4e6f1"},
  {n:20, x:700, y:700, w:100, h:40, c:"#d4e6f1"},
  {n:21, x:590, y:700, w:100, h:40, c:"#d4e6f1"},

  // ILHA CENTRAL INFERIOR (22-31)
  {n:22, x:410, y:550, w:100, h:40, c:"#f8c8c8"},
  {n:23, x:520, y:550, w:100, h:40, c:"#f8c8c8"},
  {n:24, x:630, y:550, w:100, h:40, c:"#f8c8c8"},
  {n:25, x:740, y:550, w:100, h:40, c:"#f8c8c8"},
  {n:26, x:850, y:550, w:100, h:40, c:"#f8c8c8"},
  {n:27, x:410, y:600, w:100, h:40, c:"#f8c8c8"},
  {n:28, x:520, y:600, w:100, h:40, c:"#f8c8c8"},
  {n:29, x:630, y:600, w:100, h:40, c:"#f8c8c8"},
  {n:30, x:740, y:600, w:100, h:40, c:"#f8c8c8"},
  {n:31, x:850, y:600, w:100, h:40, c:"#f8c8c8"},

  // ILHA CENTRAL INTERMEDIÁRIA (32-42)
  {n:32, x:410, y:400, w:100, h:40, c:"#d4e6f1"},
  {n:33, x:520, y:400, w:100, h:40, c:"#d4e6f1"},
  {n:34, x:630, y:400, w:100, h:40, c:"#d4e6f1"},
  {n:35, x:740, y:400, w:100, h:40, c:"#d4e6f1"},
  {n:36, x:850, y:400, w:100, h:40, c:"#d4e6f1"},
  {n:37, x:320, y:400, w:40, h:100, c:"#d4e6f1"},
  {n:38, x:410, y:450, w:100, h:40, c:"#d4e6f1"},
  {n:39, x:520, y:450, w:100, h:40, c:"#d4e6f1"},
  {n:40, x:630, y:450, w:100, h:40, c:"#d4e6f1"},
  {n:41, x:740, y:450, w:100, h:40, c:"#d4e6f1"},
  {n:42, x:850, y:450, w:100, h:40, c:"#d4e6f1"},

  // ILHA CENTRAL SUPERIOR (43-51)
  {n:43, x:500, y:200, w:100, h:40, c:"#e6d4f1"},
  {n:44, x:610, y:200, w:100, h:40, c:"#e6d4f1"},
  {n:45, x:720, y:200, w:100, h:40, c:"#e6d4f1"},
  {n:46, x:830, y:200, w:100, h:40, c:"#e6d4f1"},
  {n:47, x:500, y:250, w:100, h:40, c:"#e6d4f1"},
  {n:48, x:610, y:250, w:100, h:40, c:"#e6d4f1"},
  {n:49, x:720, y:250, w:100, h:40, c:"#e6d4f1"},
  {n:50, x:830, y:250, w:100, h:40, c:"#e6d4f1"},
  {n:51, x:960, y:200, w:40, h:100, c:"#e6d4f1"}
];

// ============================================
// FUNÇÕES DO MAPA
// ============================================

/**
 * Inicializa o SVG do mapa
 * @param {SVGElement} svgElement - Elemento SVG
 * @returns {Object} - Objeto com referências do SVG
 */
function inicializarMapa(svgElement) {
  const NS = "http://www.w3.org/2000/svg";
  
  // Limpar SVG existente
  svgElement.innerHTML = '';
  
  // Adicionar retângulo para indicar a porta
  const porta = document.createElementNS(NS, "rect");
  porta.setAttribute("x", 10);
  porta.setAttribute("y", 700);
  porta.setAttribute("width", 30);
  porta.setAttribute("height", 60);
  porta.setAttribute("fill", "#8b4513");
  porta.setAttribute("stroke", "#000");
  porta.setAttribute("stroke-width", "2");
  svgElement.appendChild(porta);
  
  // Adicionar texto "PORTAS" ao lado da porta
  const textoPorta = document.createElementNS(NS, "text");
  textoPorta.setAttribute("x", 25);
  textoPorta.setAttribute("y", 730);
  textoPorta.setAttribute("text-anchor", "middle");
  textoPorta.setAttribute("fill", "#fff");
  textoPorta.setAttribute("font-size", "12");
  textoPorta.setAttribute("font-weight", "bold");
  textoPorta.setAttribute("transform", "rotate(-90, 25, 730)");
  textoPorta.textContent = "PORTAS";
  svgElement.appendChild(textoPorta);
  
  // Adicionar estantes ao SVG
  const estantesElements = {};
  estantes.forEach(estante => {
    const rect = document.createElementNS(NS, "rect");
    rect.setAttribute("x", estante.x);
    rect.setAttribute("y", estante.y);
    rect.setAttribute("width", estante.w);
    rect.setAttribute("height", estante.h);
    rect.setAttribute("rx", 5);
    rect.setAttribute("fill", estante.c);
    rect.setAttribute("class", `estante ocupacao-vazia`);
    rect.setAttribute("stroke", "#8b4513");
    rect.setAttribute("stroke-width", "1");
    rect.setAttribute("data-estante", estante.n);
    
    svgElement.appendChild(rect);
    
    const texto = document.createElementNS(NS, "text");
    texto.setAttribute("x", estante.x + estante.w / 2);
    texto.setAttribute("y", estante.y + estante.h / 2);
    texto.setAttribute("class", "numero");
    texto.setAttribute("text-anchor", "middle");
    texto.setAttribute("dominant-baseline", "middle");
    texto.setAttribute("fill", "#8b4513");
    texto.setAttribute("font-size", "16");
    texto.setAttribute("font-weight", "bold");
    texto.textContent = estante.n;
    
    svgElement.appendChild(texto);
    
    estantesElements[estante.n] = rect;
  });
  
  return {
    svg: svgElement,
    estantesElements,
    NS
  };
}

/**
 * Atualiza as cores das estantes com base na ocupação
 * @param {Object} mapa - Objeto do mapa (retornado por inicializarMapa)
 * @param {Array} produtos - Lista de produtos
 */
async function atualizarCoresEstantes(mapa, produtos) {
  // Calcular ocupação para cada estante
  const ocupacaoPorEstante = {};
  
  // Contar produtos por estante
  produtos.forEach(produto => {
    if (produto.estante) {
      const estante = parseInt(produto.estante);
      if (!ocupacaoPorEstante[estante]) {
        ocupacaoPorEstante[estante] = 0;
      }
      ocupacaoPorEstante[estante] += parseInt(produto.quantidade) || 0;
    }
  });
  
  // Atualizar cores das estantes
  for (const [estanteNum, rect] of Object.entries(mapa.estantesElements)) {
    const ocupacao = ocupacaoPorEstante[parseInt(estanteNum)] || 0;
    const porcentagem = calcularPorcentagemOcupacao(ocupacao, 100); // Supondo capacidade de 100 por estante
    const classe = calcularOcupacaoClasse(porcentagem);
    
    // Remover classes antigas
    rect.classList.remove('ocupacao-vazia', 'ocupacao-baixa', 'ocupacao-media', 'ocupacao-alta');
    
    // Adicionar nova classe
    rect.classList.add(classe);
    
    // Atualizar título (tooltip)
    rect.setAttribute('title', `Estante ${estanteNum}: ${ocupacao} itens (${porcentagem}% ocupado)`);
  }
}

/**
 * Adiciona eventos de clique às estantes
 * @param {Object} mapa - Objeto do mapa
 * @param {Function} callback - Função de callback ao clicar em uma estante
 */
function adicionarEventosEstantes(mapa, callback) {
  for (const [estanteNum, rect] of Object.entries(mapa.estantesElements)) {
    rect.addEventListener("click", () => {
      callback(parseInt(estanteNum));
    });
  }
}

/**
 * Obtém uma estante pelo número
 * @param {number} numero - Número da estante
 * @returns {Object|null} - Dados da estante ou null
 */
function getEstantePorNumero(numero) {
  return estantes.find(e => e.n === numero) || null;
}

/**
 * Obtém todas as estantes
 * @returns {Array} - Lista de estantes
 */
function getTodasEstantes() {
  return [...estantes];
}

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

export {
  estantes,
  inicializarMapa,
  atualizarCoresEstantes,
  adicionarEventosEstantes,
  getEstantePorNumero,
  getTodasEstantes
};